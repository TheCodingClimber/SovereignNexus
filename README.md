# Sovereign Nexus

React/Vite landing page for Sovereign Nexus LLC.

## Scripts

```bash
npm run dev
npm run dev:server
npm run lint
npm run build
npm start
```

## Contact Form

This project includes its own Node/Express backend. In production, run:

```bash
npm run build
npm start
```

The server serves the built site from `dist/` and handles `POST /api/contact`.

The contact form sends mail through Resend to:

```text
jake@sovereign-nexus.com
```

Set these environment variables in the deployment host:

```text
PORT=3001
CANONICAL_HOST=sovereign-nexus.com
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM=Sovereign Nexus <noreply@sovereign-nexus.com>
```

`RESEND_FROM` must use a sender/domain verified in Resend.

## Production Notes

Run the server with `NODE_ENV=production` so HSTS, HTTPS redirects, and the canonical host redirect are active. If TLS terminates at a reverse proxy, forward `X-Forwarded-Proto` and `X-Forwarded-Host` to Node so Express can correctly identify secure requests.

Point both `sovereign-nexus.com` and `www.sovereign-nexus.com` at the server, then redirect `www` to the apex domain. The Node server also redirects `www.sovereign-nexus.com` to `https://sovereign-nexus.com` as a backup.

The server sets CSP, HSTS, frame protection, MIME sniffing protection, a restrictive Permissions-Policy, immutable asset caching, and serves `/.well-known/security.txt`.

For local development, run `npm run dev:server` in one terminal and `npm run dev` in another. Vite proxies `/api` requests to `http://127.0.0.1:3001`.
