# CSA Prep Tracker

A **ServiceNow Certified System Administrator (CSA)** exam prep app: 4-day bootcamp planner, 20-lab tracker, glossary flashcards, official blueprint checklist, mock score tracking, and cloud-synced progress — all in a ServiceNow-themed UI.

---

## Features

### 4-day bootcamp tracker
- **20 labs** mapped to the CSA blueprint across **6 exam domains** (with weight %).
- **Day-by-day plan**: Day 1–4 with timeboxes, focus areas, and task lists (labs + review drills).
- **Task checklist**: Mark labs and drills done; progress per day and overall.
- **Progress ring**: Visual overall completion (all tasks).
- **Domain coverage**: See which domains are fully completed and which labs belong to which domain.
- **High-impact labs**: Callout of the 8 highest-yield labs for when time is limited.

### Mock score & readiness
- **6 mock score slots**: Log scores (0–100) for up to 6 practice exams.
- **Readiness meter**: Zones — Strong pass (85+), Safe pass (80–84), Borderline (70–79), Not ready (&lt;70).
- **Score chart**: Bar view of mock scores and average.

### CSA sample questions
- **Official-style questions** (from ServiceNow sample materials) with multiple choice.
- **Answer reveal** and correct/incorrect feedback.
- **Stats**: Count of answered and correct.

### Weak area / patch sheet
- **Quick notes**: Log weak areas from labs and mocks.
- **List with timestamps**: Review and clear notes; use as a “patch sheet” for final review.

### Glossary flashcards
- **Term/definition cards** for CSA vocabulary.
- **Flip to reveal** definition.
- **Anki-style review**: Again / Hard / Good / Easy with day-based scheduling (Day 1–4 plan).
- **Search** and filter; stats (reviewed, by rating).
- **Sprint plan**: Day 1 = learn deck, Day 2 = pressure weak cards, Day 3 = mixed recall, Day 4 = final lock-in.

### Exam blueprint checklist
- **6 domains**, **30 topics** aligned to the official CSA blueprint.
- **Check off** each topic as you cover it.
- **Progress per domain** and overall blueprint completion.
- **Reset** option to clear checklist.

### Auth & cloud sync
- **Register** and **sign in** (email + password).
- **JWT-based** auth; session persisted in browser.
- **Cloud sync**: Progress (days, selected day, scores, notes, blueprint, flashcards) is stored in **Neon** (serverless Postgres) and synced when you’re logged in.
- **Cross-device**: Same account on another device gets your synced progress after login.
- **Auto-sync**: Changes in the app are debounced and pushed to the cloud.

### UI & tech
- **ServiceNow-style theme**: Dark green (#293E40) and light green (#81B5A1) palette.
- **Responsive** layout; **Framer Motion** for transitions and feedback.
- **Health check** API: `GET /api/health` reports DB status when `DATABASE_URL` is set.

---

## Quick start

### Prerequisites
- Node.js 18+
- A [Neon](https://console.neon.tech) project (free tier is enough)

### 1. Clone and install
```bash
git clone https://github.com/Nivetha200111/csa-des.git
cd csa-des
npm install
```

### 2. Environment
Copy `.env.example` to `.env` and set:

| Variable        | Description |
|----------------|-------------|
| `DATABASE_URL` | Neon **pooled** connection string (from Neon Console → Connection details) |
| `JWT_SECRET`   | Any long random string for signing auth tokens |

### 3. Database
```bash
npm run db:migrate
```
Creates `users` and `user_progress` in your Neon database.

### 4. Run locally
```bash
npm run dev
```
- App: **http://localhost:5173**
- API: **http://localhost:3001**

Sign up, then sign in. Your progress is saved locally and synced to Neon when logged in.

---

## Scripts

| Command              | Description |
|----------------------|-------------|
| `npm run dev`        | Run Vite + Express with watch |
| `npm run build`      | Build frontend to `dist/` |
| `npm run db:migrate` | Run DB migrations (users, user_progress) |
| `npm run preview`    | Preview production build (Vite) |

---

## Deploy on Vercel

1. Push to GitHub, then import the repo at [vercel.com/new](https://vercel.com/new).
2. In the Vercel project **Settings → Environment Variables**, add:
   - `DATABASE_URL` — your Neon connection string  
   - `JWT_SECRET` — same value you use locally  
3. Deploy. The API runs as a serverless function; the frontend is served from `dist/`.

Or from the repo root: `vercel login` then `npx vercel --prod`.

---

## API (for reference)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | App + DB health (when `DATABASE_URL` set) |
| `/api/auth/register` | POST | Register (email, name, password) |
| `/api/auth/login` | POST | Login (email, password) |
| `/api/auth/me` | GET | Current user (Bearer token) |
| `/api/progress` | GET / PUT | Get or bulk-save user progress (Bearer token) |
| `/api/progress/:key` | PUT | Save one progress key (Bearer token) |

---

## License

Private / use as you like.
