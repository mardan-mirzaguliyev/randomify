# Deploy Randomify to the web

This guide deploys the app as **one website** (React + API on the same URL) using **MongoDB Atlas** + **Render** (free tier available).

## Architecture

| Piece | Service |
|-------|---------|
| Database | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free M0 cluster) |
| App (API + frontend) | [Render](https://render.com) Web Service |

The production build serves the React app from Express and uses `/api` on the same domain (no separate CORS setup needed).

---

## Step 1 — MongoDB Atlas

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a **free M0 cluster**
3. **Database Access** → Add user with password (save the password)
4. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere — required for Render)
5. **Database** → Connect → Drivers → copy the connection string  
   Example: `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/randomify?retryWrites=true&w=majority`  
   Replace `<password>` with your user password and set the database name to `randomify`.

---

## Step 2 — Push code to GitHub

```bash
cd /Users/mardan/Desktop/randomify
git init
git add .
git commit -m "Prepare Randomify for deployment"
```

Create a repo on GitHub and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/randomify.git
git branch -M main
git push -u origin main
```

Do **not** commit `server/.env` (secrets). It is listed in `.gitignore`.

---

## Step 3 — Deploy on Render

1. Go to https://dashboard.render.com → **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Name**: `randomify` (or any name)
   - **Region**: closest to you
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`  
     (Must install client deps so Vite is available — do **not** use only `npm run build`.)
   - **Start Command**: `npm start`
   - **Plan**: Free (spins down after inactivity; first load may be slow)

4. **Environment variables** (required):

   | Key | Value |
   |-----|--------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Your Atlas connection string |
   | `JWT_ACCESS_SECRET` | Random 64+ char secret (see below) |
   | `JWT_REFRESH_SECRET` | Different random secret |
   | `CLIENT_URL` | `https://YOUR-SERVICE.onrender.com` (set after first deploy, then redeploy) |

   Generate JWT secrets locally:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

   Run twice for access and refresh secrets.

5. Click **Create Web Service** and wait for the build (~2–5 min).

6. After deploy, copy your live URL (e.g. `https://randomify-xxxx.onrender.com`).

7. Set **`CLIENT_URL`** to that exact URL (with `https://`, no trailing slash) in Render env vars → **Save** → **Manual Deploy** → Redeploy.

---

## Step 4 — Verify

- Open `https://YOUR-SERVICE.onrender.com`
- Health check: `https://YOUR-SERVICE.onrender.com/api/health` → `{"status":"ok"}`
- Register a new account and create a list

---

## Optional — Blueprint deploy

If Render supports Blueprints for your account, use the included `render.yaml`:

1. **New** → **Blueprint** → select repo
2. Still add `MONGODB_URI` and `CLIENT_URL` manually when prompted
3. Redeploy once `CLIENT_URL` matches the live URL

---

## Local production test

```bash
npm run install:all
npm run build
NODE_ENV=production \
  MONGODB_URI="mongodb://localhost:27017/randomify" \
  JWT_ACCESS_SECRET="dev-access-secret-min-32-chars-long!!" \
  JWT_REFRESH_SECRET="dev-refresh-secret-min-32-chars-long!" \
  CLIENT_URL="http://localhost:5000" \
  npm start
```

Open http://localhost:5000 (single port serves UI + API).

---

## Other hosts

Same build/start commands work on **Railway**, **Fly.io**, or a **VPS**:

- Build: `npm run install:all && npm run build`
- Start: `npm start`
- Set the same environment variables
- Expose port `PORT` (platform sets this automatically on Render/Railway)

**Split frontend + API** (e.g. Vercel + Render): set `REACT_APP_API_URL` to your API URL at build time and set `CLIENT_URL` on the API to your Vercel domain. Cookies across domains need extra config; same-origin deploy is simpler.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails | Check Node 18+; run `npm run build` locally |
| `MONGODB_URI` error | Atlas IP allowlist + correct password in URI |
| Login works locally but not live | Set `CLIENT_URL` to exact production URL and redeploy |
| Slow first load | Free Render tier cold-starts after ~15 min idle |
| 502 on deploy | Check Render logs; usually MongoDB connection or missing env vars |
