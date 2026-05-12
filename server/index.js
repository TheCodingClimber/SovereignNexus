import "dotenv/config";
import express from "express";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import contactHandler from "../api/contact.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;
const distPath = resolve(__dirname, "../dist");
const isProduction = process.env.NODE_ENV === "production";

const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "font-src 'self' https://fonts.gstatic.com",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "media-src 'self'",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
    "upgrade-insecure-requests",
  ].join("; "),
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Origin-Agent-Cluster": "?1",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Permitted-Cross-Domain-Policies": "none",
};

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use((_request, response, next) => {
  Object.entries(securityHeaders).forEach(([header, value]) => {
    response.setHeader(header, value);
  });

  if (isProduction) {
    response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  next();
});

app.use(express.json({ limit: "16kb", type: "application/json" }));

app.use((error, _request, response, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ error: "Invalid JSON payload." });
  }

  return next(error);
});

app.get("/api/health", (_request, response) => {
  response.status(200).json({ ok: true });
});

app.post("/api/contact", contactHandler);

app.use(
  express.static(distPath, {
    index: false,
    setHeaders(response, filePath) {
      if (/\.(?:js|css|woff2?|png|jpe?g|gif|svg|webp|mp4)$/i.test(filePath)) {
        response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return;
      }

      response.setHeader("Cache-Control", "public, max-age=3600");
    },
  }),
);

app.use((request, response, next) => {
  if (request.method === "GET" && !request.path.startsWith("/api/")) {
    response.setHeader("Cache-Control", "no-store");
    return response.sendFile(resolve(distPath, "index.html"));
  }

  return next();
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Server error." });
});

app.listen(port, () => {
  console.log(`Sovereign Nexus server listening on port ${port}`);
});
