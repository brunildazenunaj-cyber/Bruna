# Beyond Money Minds — phases 1 and 2

A bilingual, mobile-first Next.js App Router application for BMM Academy. Albanian is the default; the language switcher persists the choice locally. Public content is editable in `src/lib/content.ts`, legal drafts in `src/lib/legal.ts`. The founder portrait and Instagram remain explicitly labelled placeholders. No stock portrait is presented as the founder.

## Included

- Responsive landing page, six education topics, the ten-session weekly schedule, six/twelve-month membership options, FAQs and bilingual legal drafts.
- Academy application with server validation, a honeypot, persistent atomic IP-based rate limiting (five attempts/hour) and normalized-email uniqueness. Separate optional marketing consent records a timestamp; privacy acknowledgement records a policy version.
- Supabase database migration with RLS and no anonymous/authenticated client access. All database operations use server routes. Membership prices exist only in the protected database configuration, never in client bundles.
- Admin login through Supabase Auth, with an additional database allowlist checked on **every** protected request. No public signup UI. Search/filter, details, WhatsApp contact, notes/status updates, consent withdrawal, CSV export, permanent record deletion and statistics. Lists and exports show at most the newest 1,000 records; this limit is disclosed in the dashboard. Audit records contain actor, action and record ID, not applicant details.
- Resend admin notification and applicant confirmation. Submission succeeds only after a database insert. Email failure does not lose the application: per-recipient delivery flags remain pending; administrators can retry from the dashboard. Resend idempotency keys reduce repeated delivery within its supported idempotency window. Retries after that window can duplicate delivery if a previous provider success was not recorded; review delivery logs before retrying older requests. No background mail worker or marketing campaigns are enabled.

**Excluded:** Gold Group onboarding, broker registration, tutorial, verification, Telegram, support-ticket system, payments and production deployment. The Gold Group teaser honestly says this pathway is a future release. Help currently opens a real email contact. Phases 3–5 have not been built; basic implementation tests do not constitute a production security/compliance review.

## Local development

Requires Node 22.16+ (Node 24 used here), npm and a Supabase project. No services are needed to view the landing page. Without database configuration, submissions fail with a localized unavailable message and the dashboard remains inaccessible; there is no simulated success.

```sh
cd /workspace/Bruna
npm ci --cache /workspace/.npm-cache
cp .env.example .env.local
# Set the values below securely; never commit .env.local.
npm run dev
```

Open the application on port 3000 using your development platform. `/admin` is the private dashboard. Production: `npm run build` then `npm start`.

### Database and admin provisioning

1. Create a Supabase project in an appropriate region. Apply `supabase/migrations/001_academy.sql` once through its SQL editor or the migration CLI. It creates applications, admins, audit logs, rate-limit buckets and server-only membership configuration.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The anon key is intentionally public but has no table policies. Set `SUPABASE_SERVICE_ROLE_KEY` **server-side only**; it bypasses RLS and must never use a `NEXT_PUBLIC_` prefix.
3. Disable public email signup in Supabase. Create the admin user privately using the Supabase dashboard, use a strong unique password, and add the actual UUID to the allowlist:
   ```sql
   insert into public.admins(user_id) values ('REPLACE_WITH_ACTUAL_AUTH_USER_UUID');
   ```
   Manage password recovery from Supabase; no custom recovery UI is provided. Enable Supabase login abuse protections/rate limits. This release uses password authentication; require an MFA enhancement before deployment if your operating policy requires it.
4. Configure Supabase Auth URLs to match the deployment. An authenticated non-admin is signed out on login and cannot access applications.

### Email

Set `RESEND_API_KEY` and `EMAIL_FROM` to a verified sending domain/address in Resend. `ADMIN_EMAIL` defaults to `brunildazenunaj@gmail.com`. Set `APP_URL` to your exact HTTPS deployment origin for same-origin request validation. Leave it unset locally unless it exactly matches your browser URL. Credentials are never embedded in templates or client code. Application emails are transactional, not marketing.

Verify both recipient deliveries with a controlled real application after credentials are installed. Check the dashboard delivery flags and provider logs. An email queued by the provider is not proof it reached an inbox. Resend test-domain recipient restrictions may prevent sending to arbitrary applicants; use a verified production domain.

### Data lifecycle and consent

The proposed privacy retention period is 12 months for inactive applications, subject to operator approval. Review records regularly and delete through the dashboard. Supabase backups and delivered email copies require separate provider-side retention/deletion controls. Rate-limit buckets are purged on the next submission after expiry. Audit logs currently have no automated retention job; choose and implement an approved retention schedule before launch. Deletion is immediate in the live application database and is not represented as deletion from backups.

Marketing consent can be withdrawn by the admin after an email request. Timestamp the withdrawal in the database. This release sends **no** marketing. If campaigns are added, build and verify one-click unsubscribe, use only active opted-in contacts and honour withdrawals before enabling them. CSV files contain personal data: restrict access, store securely and delete after use. Formula-leading cells are escaped to reduce spreadsheet injection risk.

## Validation

```sh
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Browser tests need Chromium: `npx playwright install chromium`. This cloud machine already has `/usr/bin/chromium`; here use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` instead. They exercise language persistence, responsive navigation, form validation, legal routes and fail-closed API behavior without service credentials. Database tests apply the real migration to ephemeral PGlite PostgreSQL with test-only Supabase roles/auth schema and verify uniqueness, RLS and rate limiting. They do not verify a live Supabase deployment or real mail. For credentialed acceptance: provision an admin and a separate non-admin; submit a controlled application, check the two emails, exercise each status/notes/filter/export, withdraw consent, and delete it. Confirm unauthenticated/non-admin requests remain denied.

## Deployment and launch checklist

Deploy on Vercel or a compatible Node host; root directory is this repository. Build command `npm run build`. Configure the environment variables from `.env.example` in server settings and redeploy. HTTPS is provided by the host; secure authentication cookies are enabled in production. Mutation routes require a same-origin Origin header. Deploy behind a trusted proxy (such as Vercel) that sets the client IP; local/proxy-less rate limits may share one `unknown` bucket, and untrusted forwarded headers must not be accepted directly. Necessary outbound destinations are your exact Supabase project hostname and `api.resend.com`.

Before launch: supply the real photograph and Instagram URL, approve editable founder copy, finalize legal business identity and legal policies, verify real Supabase/Resend flows, test backups/restoration and data deletion, and arrange qualified review of UK financial promotions, investment-advice, broker-referral and privacy rules. No analytics or non-essential cookies are enabled, so no consent banner is shown. If tracking is added, implement consent controls first. Run the separate phase 5 security and deployment review before claiming production readiness.
