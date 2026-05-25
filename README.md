# Randomify

Full-stack MERN app for creating lists and picking items at random — with weighted picks, cooldowns, surprise mode, and pick history.

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)

## Setup

```bash
cd randomify
npm run install:all
```

Server and client `.env` files are already configured. JWT secrets are set in `server/.env`.

## Run

```bash
# From project root (server + client)
npm run dev

# Or separately:
npm run dev --prefix server   # http://localhost:5000
npm run dev --prefix client   # http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173).

## API

- `POST /api/auth/register` — create account
- `POST /api/auth/login` — log in
- `POST /api/auth/refresh` — refresh access token (HttpOnly cookie)
- `GET /api/lists/explore` — public/template lists (no auth)
- `GET/POST /api/lists` — manage lists (auth required)
- `POST /api/lists/:id/pick` — randomize

## Plans

| Feature | Free | Pro / Lifetime |
|---------|------|----------------|
| Lists | 3 | Unlimited |
| Items per list | 20 | Unlimited |
| Pick history | No | Last 50 |
| Clone public lists | No | Yes |

Payment on `/upgrade` is a placeholder — wire Stripe when ready.

## Deploy to the web

See **[DEPLOY.md](./DEPLOY.md)** for MongoDB Atlas + Render (free tier) step-by-step instructions.

Quick summary:

```bash
npm install && npm run build   # production build (postinstall installs server + client)
npm start                      # serves API + client on PORT
```

Set `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, and `NODE_ENV=production`.
