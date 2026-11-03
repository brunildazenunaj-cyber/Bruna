# Beyond Money Minds — BMM Gold Group

The active website is Gold Group only: bilingual Albanian/English onboarding, registration tutorial, manual Telegram access requests and a help form. The private dashboard has Gold Group Requests and Help Requests tabs. Requests are stored in Supabase and admin notifications use Resend. No automatic Telegram invitations or broker verification.

## Setup

Use Node 22 or newer. Run `npm ci`, configure `.env.local` from `.env.example`, then `npm run dev`. For production use `npm run build` and `npm start`, or Vercel's Next.js defaults. Keep Supabase service-role and Resend keys server-only.

Existing installations need **no database migration** for the Gold-only change. Academy pages, forms, API operations, email code and dashboard tab have been removed. Existing private records are preserved; an authorized database operator can handle retention/deletion separately. Historical SQL migrations remain unchanged because they establish shared authentication, rate limiting and audit infrastructure. Never rerun setup on an existing database.

For a verified-empty database only, `scripts/setup-fresh-database.sql` installs the historical schema plus Gold and help storage in one guarded transaction. Provision an administrator in Supabase Auth and add their UUID to `public.admins`; disable public signup. Gold requests require manual review before approval and personal sending of Telegram invitations. Help requests can be resolved, reopened or deleted in the dashboard. Notification failures can be retried there.

## Validation

`npm test`, `npm run build`, and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` (use your installed Chromium path). Browser success tests use isolated fixtures; they do not prove live email delivery.

See `docs/LAUNCH.md` for production configuration and historical rollout notes. The included owner-supplied tutorial is documented in `public/videos/README.md`.
