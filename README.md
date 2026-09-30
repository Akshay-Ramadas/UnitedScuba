# United Scuba

One Hostinger Node.js app: React (Vite) public site + admin at `/admin`, Express API at `/api`.

## Local

1. Copy `.env.example` to `.env`
2. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD`
3. Optional: `MONGODB_URI`, Mailjet, Cloudinary
4. `npm install`
5. `npm run dev` — site on http://localhost:5173 , API on http://localhost:5000

Sign in at `/admin/login` with those env credentials. There is no public registration.

## Hostinger (1 slot)

Requires Business or Cloud **Node.js / Web Apps**, not PHP-only hosting.

- Framework: Express
- Build command: `npm run build`
- Entry file: `server/index.js`
- Node: 20 or 22
- Add the same env vars as `.env.example` (never commit secrets)

Express serves `client/dist` for the website and `/admin`, and `/api` for data.
