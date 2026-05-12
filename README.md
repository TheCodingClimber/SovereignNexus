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
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM=Sovereign Nexus <noreply@sovereign-nexus.com>
```

`RESEND_FROM` must use a sender/domain verified in Resend.

For local development, run `npm run dev:server` in one terminal and `npm run dev` in another. Vite proxies `/api` requests to `http://127.0.0.1:3001`.
