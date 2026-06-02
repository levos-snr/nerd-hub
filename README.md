# JS/TS Learning Platform (Production Full-Stack)

Gamified JavaScript + TypeScript learning platform with production auth, Postgres persistence, TanStack DB live queries, and Vercel deployment.

## Recommended Stack

| Layer           | Technology                                |
| --------------- | ----------------------------------------- |
| Frontend        | React 19 + Vite + Tailwind CSS v4         |
| Data/Reactivity | TanStack Query + TanStack DB              |
| Auth            | Better Auth (email/password, DB sessions) |
| Database        | Neon Postgres (serverless)                |
| ORM             | Drizzle ORM                               |
| Hosting         | Vercel (TanStack Start + Nitro)           |

## Features

- **117+ mixed JS/TS modules** (beginner → pro, including workshop-style topics)
- Landing page, dashboard, learn path, module detail, and admin panel
- Lesson + quiz + coding challenge per module
- Pass-to-unlock progression with XP/streak/level
- Better Auth (email/password) with admin plugin + role-based access
- Progress persisted per user in Postgres
- TanStack Router + Query for routing and live data

## App routes

| Route                | Description                        |
| -------------------- | ---------------------------------- |
| `/`                  | Landing page                       |
| `/signup`, `/signin` | Auth                               |
| `/dashboard`         | XP, level, streak, module stats    |
| `/learn`             | Module catalog (filtered by track) |
| `/learn/$moduleId`   | Lesson, challenge, quiz            |
| `/admin`             | Admin CRUD (requires `admin` role) |

---

## 1) Get Environment Variables

Copy env template:

```bash
cp .env.example .env
```

### `BETTER_AUTH_SECRET`

Generate a secure secret (32+ chars):

```bash
openssl rand -base64 32
```

Paste into `.env`:

```env
BETTER_AUTH_SECRET=your_generated_secret
```

### `BETTER_AUTH_URL`

- Local: `http://localhost:3000`
- Production: your Vercel URL, e.g. `https://your-app.vercel.app`

### `DATABASE_URL` (Neon Postgres)

1. Create account at [https://neon.tech](https://neon.tech)
2. Create project + database
3. Copy connection string from Neon dashboard
4. Paste into `.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
```

---

## 2) Local Setup

```bash
pnpm install
pnpm db:migrate
pnpm db:sync-modules
pnpm dev
```

Open: [http://localhost:3000](http://localhost:3000)

Check database connectivity: `GET http://localhost:3000/api/health` → `{ "ok": true, "db": { "ok": true } }`

### Local flow

1. Sign up with email/password
2. Open first unlocked module
3. Complete the coding challenge (run tests, then submit)
4. Answer quiz and submit
5. Pass quiz (>=70%) to unlock next module
6. Progress is saved to Postgres via `/api/progress` and `/api/submit-quiz`

### Promote an admin user

After signing up, set `ADMIN_EMAIL` in `.env` and run:

```bash
pnpm db:promote-admin
```

---

## 3) Cloud Setup (Vercel)

### A. Push repo to GitHub

### B. Import project in Vercel

- Framework preset: **Other** (TanStack Start + Nitro)
- Build command: `pnpm build`
- Output directory: `.vercel/output` (set automatically via `vercel.json`)
- Install command: `pnpm install`

### C. Add Vercel Environment Variables

In Vercel Project → Settings → Environment Variables, add for **Production** and **Preview**:

| Name                 | Value                                    |
| -------------------- | ---------------------------------------- |
| `DATABASE_URL`       | Neon connection string                   |
| `BETTER_AUTH_SECRET` | same secret as local (or unique per env) |
| `BETTER_AUTH_URL`    | `https://your-app.vercel.app`            |

### D. Run DB migration against Neon

From local machine (with production DATABASE_URL):

```bash
DATABASE_URL="postgresql://..." pnpm db:migrate
```

Or use Neon SQL editor and run `drizzle/0000_initial.sql`.

### E. Deploy

Vercel auto-deploys on push. The Nitro server handles SSR and `/api/*` routes.

---

## 4) API Endpoints

| Endpoint             | Method              | Auth     | Purpose                                    |
| -------------------- | ------------------- | -------- | ------------------------------------------ |
| `/api/auth/*`        | ALL                 | public   | Better Auth routes (signup/signin/session) |
| `/api/modules`       | GET                 | public   | Curriculum modules                         |
| `/api/progress`      | GET/PUT             | required | Load/save learner state                    |
| `/api/submit-quiz`   | POST                | required | Score quiz + update progression            |
| `/api/admin/modules` | GET/POST/PUT/DELETE | admin    | Curriculum CRUD                            |

---

## 5) Scripts

```bash
pnpm dev          # local app + API middleware
pnpm build        # production frontend build
pnpm preview      # preview built frontend
pnpm db:migrate   # apply all SQL migrations in drizzle/
pnpm db:promote-admin  # promote ADMIN_EMAIL user to admin
pnpm db:push      # drizzle-kit push (optional)
pnpm seed         # export curriculum JSON
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

---

## 6) Troubleshooting

- **`DATABASE_URL is required`**: set env in `.env` locally or Vercel dashboard in cloud.
- **Auth signup fails**: ensure migration ran and `BETTER_AUTH_SECRET` + `BETTER_AUTH_URL` are set.
- **Progress not saving**: sign in first; `/api/progress` requires session cookie.
- **Modules not loading in tests/preview**: API must be reachable; local dev uses Vite API middleware.

---

## 7) Security Notes

- Never commit `.env`
- Use unique secrets per environment
- Keep Neon credentials server-side only
- Session cookies are managed by Better Auth
