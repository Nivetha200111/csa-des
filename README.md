# csa-des

CSA Prep Tracker — 4-day bootcamp tracker with labs, flashcards, blueprint checklist, and cloud sync.

## Login & Neon (Postgres)

Auth is backed by **Neon** serverless Postgres. Users can register, sign in, and sync progress across devices.

1. Create a project at [Neon Console](https://console.neon.tech) and copy the **pooled** connection string.
2. Copy `.env.example` to `.env` and set:
   - `DATABASE_URL` — your Neon connection string (use the pooled one ending with `-pooler`)
   - `JWT_SECRET` — any long random string for signing tokens
3. Run migrations and start the app:

```bash
npm install
npm run db:migrate
npm run dev
```

4. Open the app (Vite usually at http://localhost:5173), use **Sign up** to create an account, then **Sign in**. Progress is stored in Neon and synced when you log in on another device.

### Health check

- `GET http://localhost:3001/api/health` — returns `database: "connected"` when Neon is reachable.

## Scripts

- `npm run dev` — client (Vite) + server (Express) with watch
- `npm run db:migrate` — create `users` and `user_progress` tables
- `npm run build` — build frontend for production
