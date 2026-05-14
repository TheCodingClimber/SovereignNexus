const CONTACT_TO = "jake@sovereign-nexus.com";
const DEFAULT_FROM = "Sovereign Nexus <noreply@sovereign-nexus.com>";
const MAX_LENGTHS = {
  name: 80,
  email: 254,
  message: 4000,
  company: 120,
};
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_MAX_KEYS = 5000;
const attempts = new Map();
const PRODUCTION_ORIGINS = new Set(["https://sovereign-nexus.com", "https://www.sovereign-nexus.com"]);
const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i;
const apiSecurityHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStringField = (value) => value === undefined || typeof value === "string";

const normalizeField = (value = "", maxLength) =>
  String(value)
    .normalize("NFKC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);

const isTooLong = (value = "", maxLength) => String(value).length > maxLength;

const getHeader = (request, name) => {
  const value = request.headers?.[name.toLowerCase()] ?? request.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
};

const getClientKey = (request) => request.ip || request.socket?.remoteAddress || "unknown";

const isAllowedOrigin = (request) => {
  const origin = getHeader(request, "origin");

  if (!origin) {
    return true;
  }

  try {
    const normalizedOrigin = new URL(origin).origin.toLowerCase();
    return PRODUCTION_ORIGINS.has(normalizedOrigin) || LOCAL_ORIGIN_PATTERN.test(normalizedOrigin);
  } catch {
    return false;
  }
};

const isRateLimited = (request) => {
  const now = Date.now();
  const key = getClientKey(request);

  for (const [attemptKey, record] of attempts) {
    if (now - record.startedAt > RATE_LIMIT_WINDOW_MS) {
      attempts.delete(attemptKey);
    }
  }

  if (attempts.size > RATE_LIMIT_MAX_KEYS) {
    const oldestKey = attempts.keys().next().value;
    if (oldestKey) {
      attempts.delete(oldestKey);
    }
  }

  const record = attempts.get(key) ?? { count: 0, startedAt: now };
  record.count += 1;
  attempts.set(key, record);

  return record.count > RATE_LIMIT_MAX;
};

export default async function handler(request, response) {
  Object.entries(apiSecurityHeaders).forEach(([header, value]) => {
    response.setHeader(header, value);
  });

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!isAllowedOrigin(request)) {
    return response.status(403).json({ error: "Origin not allowed." });
  }

  const contentType = getHeader(request, "content-type") || "";
  if (contentType && !contentType.toLowerCase().includes("application/json")) {
    return response.status(415).json({ error: "Content-Type must be application/json." });
  }

  if (isRateLimited(request)) {
    response.setHeader("Retry-After", String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)));
    return response.status(429).json({ error: "Too many messages. Please try again later." });
  }

  const { name = "", email = "", message = "", company = "" } = request.body ?? {};

  if (!isStringField(name) || !isStringField(email) || !isStringField(message) || !isStringField(company)) {
    return response.status(400).json({ error: "Invalid form payload." });
  }

  if (isTooLong(name, MAX_LENGTHS.name) || isTooLong(email, MAX_LENGTHS.email) || isTooLong(message, MAX_LENGTHS.message)) {
    return response.status(400).json({ error: "Please keep the form fields within their length limits." });
  }

  const honeypot = normalizeField(company, MAX_LENGTHS.company);
  if (honeypot) {
    return response.status(200).json({ ok: true });
  }

  const trimmedName = normalizeField(name, MAX_LENGTHS.name);
  const trimmedEmail = normalizeField(email, MAX_LENGTHS.email).toLowerCase();
  const trimmedMessage = normalizeField(message, MAX_LENGTHS.message);

  if (!trimmedName || !isValidEmail(trimmedEmail) || trimmedMessage.length < 10) {
    return response.status(400).json({ error: "Please provide a name, valid email, and message." });
  }

  if (!process.env.RESEND_API_KEY) {
    return response.status(500).json({ error: "Email service is not configured." });
  }

  const subjectName = trimmedName.replace(/[\r\n]+/g, " ");
  const subject = `New Sovereign Nexus inquiry from ${subjectName}`;
  const text = [
    "New Sovereign Nexus inquiry",
    "",
    `Name: ${trimmedName}`,
    `Email: ${trimmedEmail}`,
    "",
    "Message:",
    trimmedMessage,
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  let resendResponse;

  try {
    resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || DEFAULT_FROM,
        to: [CONTACT_TO],
        reply_to: trimmedEmail,
        subject,
        text,
        html: `
          <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
            <h2>New Sovereign Nexus inquiry</h2>
            <p><strong>Name:</strong> ${escapeHtml(trimmedName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(trimmedEmail)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(trimmedMessage).replaceAll("\n", "<br />")}</p>
          </div>
        `,
      }),
    });
  } catch (error) {
    console.error("Resend contact email request failed:", error);
    return response.status(502).json({ error: "Email could not be sent. Please try again." });
  } finally {
    clearTimeout(timeout);
  }

  if (!resendResponse.ok) {
    const details = await resendResponse.text();
    console.error("Resend contact email failed:", details);
    return response.status(502).json({ error: "Email could not be sent. Please try again." });
  }

  return response.status(200).json({ ok: true });
}
