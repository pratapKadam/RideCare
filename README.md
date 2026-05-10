# RideCare — vehicle servicing appointment demo

Full-stack **mini project**: riders book a bike service and track status with a **reference code**; staff use an **admin dashboard** to accept/reject requests and move jobs through workshop stages. Built with **React (JavaScript)**, **Node.js + Express**, **PostgreSQL**, and **Prisma**.

**There is no login and no payments.** Anyone who knows a booking’s reference code can view that booking’s status—fine for learning and demos, not for production customer data.

---

## Documentation

| Doc | Who it’s for |
|-----|----------------|
| **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** | Step-by-step install, local run (**macOS** & **Windows 11**), optional **free** deploy (Neon + Render + Vercel) |
| **[INTERVIEW_PREP.md](./INTERVIEW_PREP.md)** | Concepts, theory, and how to demo/talk about the project |

If you are new, start with **SETUP_GUIDE.md**.

---

## Quick start (after prerequisites)

1. Create **`server/.env`** with `DATABASE_URL` from [Neon](https://neon.tech) (see setup guide).
2. Backend: `cd server` → `npm install` → `npx prisma migrate deploy` → `npm run dev`
3. Frontend: `cd client` → copy **`client/.env.example`** to **`client/.env`** → `npm install` → `npm run dev`

Open the printed local URL (usually `http://localhost:5173`).

---

## Repo layout

- **`client/`** — Vite + React (`npm run dev`, `npm run build`)
- **`server/`** — Express API (`npm run dev`, `npm start`)

---

## License

Use and modify freely for learning and your portfolio.
