# Setup guide — RideCare vehicle servicing bookings

This guide walks you from **zero** to a running app on your computer (**macOS** or **Windows 11**), then optionally to **free cloud hosting**. It assumes you are new to coding; copy each command carefully.

---

## What you are building

A small **booking demo**: riders submit bike details and a service type; staff (**admin**) accepts or rejects requests and moves each job through workshop stages (vehicle received → in progress → completed → final touch-up). **There is no login.** Users track progress with a **reference code** (for example `BK-ABC12XYZ`) shown after booking.

---

## Prerequisites (what to install)

| Tool | Why you need it | Suggested version |
|------|------------------|-------------------|
| **Node.js** | Runs the backend and builds the frontend | **Current LTS** from [https://nodejs.org](https://nodejs.org) (as of this guide: **v22.x** or **v20.x** LTS — either is fine) |
| **npm** | Installs libraries | Included with Node.js |
| **Git** | Clones the project from GitHub | Latest from [https://git-scm.com](https://git-scm.com) |

Optional but helpful:

- **VS Code** (free editor): [https://code.visualstudio.com](https://code.visualstudio.com)
- Free accounts (only if you deploy): **GitHub**, **[Neon](https://neon.tech)** (database), **[Render](https://render.com)** (API), **[Vercel](https://vercel.com)** (website)

---

## Part A — Install Node.js and Git

### macOS

1. Open **Terminal** (Spotlight → search “Terminal”).
2. Install Node.js:
   - Easiest: download the **LTS** installer from [https://nodejs.org](https://nodejs.org), open it, follow the steps.
   - Optional later: tools like **nvm** manage multiple Node versions; not required for this project.
3. Install Git:
   - If `git` is missing, install **Xcode Command Line Tools**: run `xcode-select --install` in Terminal, or install Git from [git-scm.com](https://git-scm.com/download/mac).
4. Check versions:

```bash
node -v
npm -v
git --version
```

You should see three version lines with **no errors**.

### Windows 11

1. Open **PowerShell** or **Command Prompt** (Win + R → type `powershell` → Enter).
2. Install Node.js:
   - Download the **LTS** **Windows Installer (.msi)** from [https://nodejs.org](https://nodejs.org).
   - Run it; keep **“Add to PATH”** checked; finish the wizard.
   - **Restart** the terminal after install.
3. Install Git:
   - Download from [https://git-scm.com/download/win](https://git-scm.com/download/win).
   - During setup, the default options are usually fine. Pick **Git from the command line** when asked.
4. Check versions (same commands as Mac):

```bash
node -v
npm -v
git --version
```

### Windows tip: line endings

Git may warn about line endings. For fewer surprises on Windows, many beginners run once:

```bash
git config --global core.autocrlf true
```

---

## Part B — Get the code

Replace the URL below with **your** GitHub repo URL after you push.

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

Folder layout you should see:

- `client/` — React website (Vite, **plain JavaScript**)
- `server/` — Node API (Express + Prisma)
- `SETUP_GUIDE.md` — this file
- `INTERVIEW_PREP.md` — interview notes

---

## Part C — Create a free PostgreSQL database (Neon)

The app stores bookings in **PostgreSQL**. The simplest free option for beginners is **[Neon](https://neon.tech)** (no Docker required).

1. Sign up at [https://neon.tech](https://neon.tech).
2. Create a **project** and a **database**.
3. Copy the **connection string** (it looks like `postgresql://user:pass@host/db?sslmode=require`).
4. On your computer, create a file **`server/.env`** (same folder as `server/package.json`).
5. Paste this line and replace with your real URL:

```bash
DATABASE_URL="postgresql://YOUR_CONNECTION_STRING"
```

**Never commit `server/.env` to Git.** It is already ignored via `.gitignore`.

---

## Part D — Run the backend (API)

Commands work the same on **Mac** and **Windows** if Node is installed.

### 1) Install dependencies

```bash
cd server
npm install
```

### 2) Apply database schema

This creates tables in your Neon database:

```bash
npx prisma migrate deploy
```

If you see connection errors, double-check `DATABASE_URL` in `server/.env`.

### 3) Start the API

```bash
npm run dev
```

You should see something like: `API listening on http://localhost:4000`.

### 4) Quick health check

Open a **second** terminal tab/window:

```bash
curl http://localhost:4000/health
```

- **Mac/Linux**: `curl` is built in.
- **Windows 11**: `curl` usually works in PowerShell; or paste `http://localhost:4000/health` in a browser — you should see JSON like `{"ok":true}`.

Leave this terminal **running** while you develop.

---

## Part E — Run the frontend (React)

Open a **new** terminal (keep the server running).

### 1) Configure API URL

Create **`client/.env`**:

```bash
VITE_API_URL=http://localhost:4000
```

If your API uses another port, change `4000` to match.

### 2) Install and start

```bash
cd client
npm install
npm run dev
```

Vite prints a local URL (usually **http://localhost:5173**). Open it in your browser.

You should see the **landing page** with **User dashboard** and **Admin dashboard**.

---

## Part F — Try the full flow locally

1. **User dashboard** → **Book now** → submit bike details → note the **reference code**.
2. **Admin dashboard** → **Accept** the booking (or **Reject** to test that path).
3. Back on **User dashboard**, **Track your booking** with the code → advance statuses from **Admin** and refresh or search again to see updates.

If buttons fail with “network error”, the API is not running or `VITE_API_URL` is wrong.

---

## Part G — Deploy for free (optional)

Typical **free** split:

| Piece | Service | Role |
|-------|---------|------|
| Database | **Neon** | Already set up — reuse the same `DATABASE_URL` |
| Backend | **Render** | Runs `node` for Express |
| Frontend | **Vercel** | Hosts the built React site |

### 1) Deploy the API on Render

1. Push your project to GitHub.
2. On Render, create a **Web Service**, connect the repo.
3. Set **Root Directory** to `server`.
4. **Build command**:

```bash
npm install && npx prisma migrate deploy
```

5. **Start command**:

```bash
npm start
```

6. Add environment variable **`DATABASE_URL`** (same value as local Neon string).
7. Add **`CLIENT_ORIGIN`** with your **frontend URL** after step 2 (example: `https://your-app.vercel.app`). Multiple URLs can be comma-separated.
8. Deploy and copy the public API URL (example: `https://your-api.onrender.com`).

**Note:** Free Render apps **sleep** when idle; the first request after sleep can take ~30–60 seconds.

### 2) Deploy the frontend on Vercel

1. Create a Vercel project from the same GitHub repo.
2. Set **Root Directory** to `client`.
3. Framework preset: **Vite**.
4. Build command: `npm run build` (default).
5. Output directory: `dist` (Vite default).
6. Add environment variable **`VITE_API_URL`** = your Render API URL (**no** trailing slash), e.g. `https://your-api.onrender.com`.
7. Redeploy.

After deploy, put that same frontend URL into Render’s **`CLIENT_ORIGIN`** so the browser is allowed to call the API (CORS).

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| `node` / `npm` not found | Reinstall Node from nodejs.org; **restart terminal**. |
| Port **4000** in use | Change `PORT` in `server/.env` or stop the other program using the port. |
| Port **5173** in use | Vite will suggest another port — use the URL it prints. |
| Database errors | Verify `DATABASE_URL`, internet connection, and that `npx prisma migrate deploy` succeeded. |
| CORS errors in browser | `CLIENT_ORIGIN` on the server must include your exact frontend URL (scheme + host, no trailing slash). Locally, `http://localhost:5173` is allowed by default. |
| Blank page after deploy | Check Vercel build logs; confirm **`VITE_API_URL`** points to the live API. |

---

## Environment variables summary

| File | Variable | Purpose |
|------|----------|---------|
| `server/.env` | `DATABASE_URL` | PostgreSQL connection |
| `server/.env` | `CLIENT_ORIGIN` | Extra allowed frontend origins (production) |
| `server/.env` | `PORT` | API port (Render sets this automatically) |
| `client/.env` | `VITE_API_URL` | Browser talks to this API base URL |

Examples without secrets live in **`server/.env.example`** and **`client/.env.example`**.

---

## You’re done

When both terminals show no errors and the browser flows work, your environment matches what collaborators need after `git clone`. Share **SETUP_GUIDE.md** with anyone opening your repo for the first time.
