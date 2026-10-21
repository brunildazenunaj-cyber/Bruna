# Beyond Money Minds — launch implementation

A bilingual, mobile-first Next.js App Router application. Gold Group is the primary pathway; BMM Academy is a compact secondary option. Albanian is the default and the language switcher persists the choice locally. Public content is editable in `src/lib/content.ts` and `src/lib/gold.ts`; legal drafts are in `src/lib/legal.ts`.

**Launch instructions and production verification:** [docs/LAUNCH.md](docs/LAUNCH.md). **Tutorial video:** [public/videos/README.md](public/videos/README.md). The supplied original is preserved separately; its optimized 9.65 MiB MP4 is included and served directly by the website.

## Included

- Minimal hero, three-step Gold Group onboarding, tutorial slot and Gold request form, compact Academy overview, existing Academy application form, three useful FAQs and legal footer. No biography, separate schedule section or separate membership promotion.
- Academy application with server validation, a honeypot, persistent atomic IP-based rate limiting (five attempts/hour) and normalized-email uniqueness. Separate optional marketing consent records a timestamp; privacy acknowledgement records a policy version.
- Supabase database migration with RLS and no anonymous/authenticated client access. All database operations use server routes. Membership prices exist only in the protected database configuration, never in client bundles.
- Admin login through Supabase Auth, with an additional database allowlist checked on **every** protected request. No public signup UI. Search/filter, details, WhatsApp contact, notes/status updates, consent withdrawal, CSV export, permanent record deletion and statistics. Lists and exports show at most the newest 1,000 records; this limit is disclosed in the dashboard. Audit records contain actor, action and record ID, not applicant details.
- Resend admin notification and applicant confirmation. Submission succeeds only after a database insert. Email failure does not lose the application: per-recipient delivery flags remain pending; administrators can retry from the dashboard. Resend idempotency keys reduce repeated delivery within its supported idempotency window. Retries after that window can duplicate delivery if a previous provider success was not recorded; review delivery logs before retrying older requests. No background mail worker or marketing campaigns are enabled.

**Excluded:** automatic broker verification, automatic Telegram invitations, support-ticket system, payments and scheduling integrations. The responsive tutorial player now includes the owner-supplied footage. Captions have not been supplied. Help opens a real email contact. Basic implementation tests do not constitute completed production integration or legal review.

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

Set `RESEND_API_KEY` and `EMAIL_FROM` to a verified sending domain/address in Resend. `ADMIN_EMAIL` defaults to `brunildazenunaj@gmail.com`. Set `APP_URL` to your exact HTTPS deployment origin for same-origin request validation. Leave it unset locally or for dynamic Vercel previews unless it exactly matches your browser URL. Credentials are never embedded in templates or client code. Application emails are transactional, not marketing.

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

Before launch: finalize legal business identity and legal policies, verify real Supabase/Resend flows, test backups/restoration and data deletion, and arrange qualified review of UK financial promotions, investment-advice, broker-referral and privacy rules. No analytics or non-essential cookies are enabled, so no consent banner is shown. If tracking is added, implement consent controls first. Complete the production acceptance checks in docs/LAUNCH.md before claiming production readiness.


## Gold Group manual requests

Apply **002_gold_requests.sql after 001_academy.sql** in the existing Supabase project. Do not rerun the original migration on an existing database. The new migration only adds the separate `gold_requests` table, indexes and review function; Academy data and behavior remain unchanged.

Visitors submit required full name, email, international WhatsApp number and TradeQuo Broker ID with privacy acknowledgement. Required fields have red asterisks. Apply `003_gold_whatsapp.sql` after migration 002 before deploying this version; it adds the phone column while preserving older requests without phone numbers. Phone numbers appear in the admin notification and dashboard with a WhatsApp contact link. Requests always start Pending Verification. Duplicate email or Broker ID is blocked within Gold requests (the same email can apply to the Academy separately). Honeypot, server validation, a separate five-attempts/hour rate-limit bucket, RLS and server-only access protect requests. No passwords, screenshots or invitation URLs are collected.

In `/admin`, choose **Gold Group Requests**. Verify registration and the required deposit personally in the official TradeQuo dashboard. Check the manual-verification acknowledgement and approve. Send the Telegram link personally using the applicant's email, then click **Mark invitation as sent** and confirm. PostgreSQL records the administrator and timestamp atomically with an audit entry. Only Approved requests can be marked Invitation Sent; repeated marking is rejected so the original timestamp is preserved. Pending/Approved requests can be rejected, and rejected requests can return to pending for a fresh review. These are staff assertions, not automated broker verification. The app never sends Telegram invitations and stores no private invite links.

The existing Resend credentials and verified sender notify `brunildazenunaj@gmail.com` of new requests. Failed notifications stay pending with a dashboard retry button; no applicant email is added and Academy email behavior is unchanged. No TradeQuo API or Telegram bot approval is required because verification and invitation sending are manual. The administrator must already have legitimate access to the TradeQuo dashboard and Telegram invite permissions. Gold retention/deletion must be handled by an authorized operator in Supabase under the approved retention policy; the existing Academy deletion button only deletes Academy records.

Local tests cover both migrations, cross-flow isolation, authorization, valid/invalid status transitions, timestamps and audit logging. Browser dashboard tests use explicitly isolated HTTP fixtures; live Supabase writes and actual email delivery still require credentialed acceptance testing. Update Vercel after applying the additive migration and configuring the existing server credentials.
