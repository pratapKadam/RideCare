# Interview prep — RideCare booking demo

Use this doc to explain **what you built**, **how it works**, and **which concepts** you practiced. Adjust wording to match how you actually deployed (local only vs Neon + Render + Vercel).

---

## Elevator pitch (30–45 seconds)

“I built a small full-stack demo for **vehicle service appointments**. Riders submit bike details and pick a service package; an **admin view** lists requests and can **accept or reject** them. After acceptance, the admin moves the job through **workshop statuses**, and the rider sees updates by entering a **reference code**—there’s **no login**, so the code acts like a public tracking ID. The stack is **React** on the frontend, **Node and Express** on the backend, and **PostgreSQL** with **Prisma** for schema and migrations.”

---

## Trade-offs you chose on purpose

- **No authentication** → faster to ship and easier for beginners to run; **not** suitable for real customer data without adding accounts or signed links.
- **No payments** → scheduling-only demo.
- **Anyone with the reference code can view that booking** → fine for learning; production would need auth or expiring tokens.

Be ready to say what you’d add next: **login for admins**, **rate limiting**, **email/SMS notifications**, **payments**, **audit log**, **automated tests**.

---

## User journey vs system journey

### A) Normal user perspective

1. Opens the site → chooses **User dashboard**.
2. Taps **Book now**, enters **brand**, **model**, **kilometers**, **service type**, submits.
3. Sees a **reference code** and saves it.
4. Later, enters the code under **Track your booking** and sees a **timeline** of statuses.
5. When the workshop finishes steps on their side, refreshing or searching again shows progress until **final touch-up done**.

### B) Workshop staff (admin) perspective

1. Opens **Admin dashboard**.
2. Sees a **table** of all bookings, newest first.
3. For **awaiting confirmation**, taps **Accept** or **Reject**.
4. For accepted jobs, advances status in order: **vehicle received** → **in progress** → **completed** → **final touch-up done**.

---

## Technical flow — plain language first, then developer detail

### 1) Booking created (user submits the form)

**Plain:** The website sends the form answers to the server; the server saves one row in the database and returns a unique booking code.

**Technical:**

- React `fetch` **POST** `/api/bookings` with JSON `{ brand, model, odometerKm, serviceType }`.
- Express parses JSON (`express.json()`), validates fields, generates `referenceCode` (like `BK-…`), inserts via **Prisma** `create`.
- Response **201** with the saved booking JSON (includes `id`, `status: PENDING`, etc.).

### 2) Admin lists appointments

**Plain:** The dashboard asks the server for every booking; the server reads the database and sends back a list.

**Technical:**

- React `fetch` **GET** `/api/bookings`.
- Prisma `findMany` ordered by `createdAt` descending.

### 3) Admin accepts or rejects

**Plain:** Clicking a button tells the server to change that booking’s status. The server only allows sensible changes (you can’t skip steps incorrectly).

**Technical:**

- React **PATCH** `/api/bookings/:id` with `{ status: "ACCEPTED" }` or `"REJECTED"`.
- Express loads the row, checks **allowed transitions** from current status, then Prisma `update`.

### 4) User tracks by reference code

**Plain:** The user types their code; the server looks up that row and returns the current status so the UI can draw the timeline.

**Technical:**

- React **GET** `/api/bookings/by-reference/:code` (code normalized to uppercase).
- Prisma `findUnique` on `referenceCode`; **404** if missing.

### 5) Running locally vs production

**Plain:** On your laptop, two programs run: the **API** (port 4000) and the **website** (port 5173). In production, the website is **static files** on a host like Vercel; the API runs on a host like Render; the database lives on Neon.

**Technical:**

- **CORS**: browser blocks random cross-origin calls unless the API allows the frontend origin (`CLIENT_ORIGIN` + localhost defaults).
- **Environment variables**: `DATABASE_URL` on the server; `VITE_API_URL` baked into the client at **build time**.

---

## Concepts glossary (what / why / where)

| Concept | What it means | Where it shows up |
|---------|----------------|-------------------|
| **Client vs server** | Browser UI vs program answering HTTP requests | React vs Express |
| **HTTP** | How browsers and servers message each other | GET / POST / PATCH |
| **REST-ish JSON API** | URLs represent resources; JSON carries data | `/api/bookings`, `/api/bookings/:id` |
| **JSON** | Text format for structured data | Request/response bodies |
| **React** | UI built from components that re-render when state changes | `src/pages`, `useState`, `useEffect` |
| **JSX** | HTML-like syntax inside JavaScript | `.jsx` files |
| **React Router** | Maps URLs to screen components | `/`, `/user`, `/admin` |
| **`fetch`** | Browser API for HTTP calls | Booking form, admin table |
| **Express** | Minimal Node framework for routes and middleware | `server/src/index.js` |
| **Middleware** | Functions that run on each request (e.g. parse JSON) | `express.json()`, `cors` |
| **Prisma** | ORM: schema + migrations + DB client | `prisma/schema.prisma`, `PrismaClient` |
| **PostgreSQL** | Relational database; rows and constraints | Hosted on Neon in the guided deploy |
| **Migrations** | Versioned SQL changes to the database | `prisma/migrations/` |
| **Environment variables** | Secrets/config outside source code | `.env`, `DATABASE_URL`, `VITE_API_URL` |
| **CORS** | Browser security for cross-origin requests | Server allows frontend origin |
| **Static hosting** | Pre-built HTML/JS/CSS served cheaply | Vercel for `client/dist` |
| **Cold start** | Free Node hosts may sleep; first hit wakes slowly | Render free tier |

---

## Possible follow-up questions & sample answers

**Why Prisma instead of raw SQL?**  
“It keeps the schema in one place, generates a client, and migrations are repeatable—good for small teams and demos.”

**Why Vite?**  
“Fast dev server and a simple production build for React without extra framework complexity.”

**How would you secure the admin page?**  
“Add authentication (session or JWT), roles, and move admin APIs behind authorization—not just hiding the URL.”

**How do you prevent spam bookings?**  
“CAPTCHA, rate limits per IP, and optional email verification—none of that is in the demo on purpose.”

---

## 60-second demo script

1. Landing → **User dashboard** → **Book now** → submit → **read reference aloud**.
2. **Admin dashboard** → **Accept** that row → advance one status step.
3. **User dashboard** → **Track** with the code → point at timeline updating.
4. Mention stack: “React + Express + Postgres + Prisma; no login by design; reference code is the correlation ID.”

Practice saying **one** thing you’d improve next so the interview ends with forward momentum.
