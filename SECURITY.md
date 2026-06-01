# Security overview

## Authentication

- Better Auth with HTTP-only session cookies
- Passwords hashed server-side (Better Auth account table)
- Session lookup failures return `null` instead of crashing the API

## Authorization

- Learner routes require authenticated session
- Admin routes require `admin` or `owner` role
- Quiz submit requires: module unlocked, challenge completed server-side
- Progress `PUT` restricted to admins; learners may only `PATCH` `lastVisitedModuleId`

## API hardening

- Rate limiting on `/api/progress`, `/api/submit-*`, `/api/admin/*` (120 req/min/IP/route)
- Module IDs validated (`module-\d+`) on submit endpoints
- Quiz answer count validated against module question count
- Admin module payloads validated with Zod

## Client-side challenges

- Coding tests run in the browser (`new Function`) for learning UX
- Challenge completion is recorded server-side before quiz unlock
- Do not treat client test results as anti-cheat; use for education only

## Deployment checklist

- Set strong `BETTER_AUTH_SECRET` (32+ chars)
- Use Neon **pooled** `DATABASE_URL` with `sslmode=require`
- Set `BETTER_AUTH_URL` to your production origin
- Keep `.env` out of git
- Run `pnpm db:migrate` before serving traffic

## If Neon HTTP fails locally

Add to `.env`:

```env
DATABASE_DRIVER=postgres
```

This uses TCP `postgres` instead of HTTP fetch (helps when `fetch failed` to Neon).
