# BMM launch handoff

## Production status and credentials

No Supabase, Resend or Vercel credentials are available in the development environment as of 21 October 2026. The current production URL was not supplied when this work began. A local build or database test is **not** evidence that the production database is migrated, email is delivered, an admin is provisioned, or a production form works.

Configure the existing variables in the Vercel project (Production, and Preview if needed):
- `NEXT_PUBLIC_SUPABASE_URL`: the intended Supabase project's URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: its publishable/anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: the same project's server-only service role key.
- `RESEND_API_KEY` and `EMAIL_FROM`: an authorized Resend key and verified sender address/domain.
- `ADMIN_EMAIL=brunildazenunaj@gmail.com` for Academy notifications. Gold notifications already target that address.
- `APP_URL`: the exact HTTPS origin of the production site, without a path. Do not use a localhost value in production. For Vercel previews with varying domains, omit APP_URL in Preview so same-origin checks use the trusted request host.

Do not paste secrets into chat, source code or SQL migration files. A Vercel environment update requires a new deployment. No production values or credentials were inferred from the repository name.

## Safely check and apply migration 002

1. Open the Supabase project used by the production Vercel environment. Confirm its project reference matches `NEXT_PUBLIC_SUPABASE_URL` using your settings privately.
2. Run `scripts/check-database.sql` in SQL Editor. This is a read-only check; it contains no applicant data queries.
3. Confirm Academy prerequisites exist (`applications`, `admins`, `audit_logs`, `rate_limits`, and `consume_rate_limit`). If they do not, stop: this may be the wrong database or migration 001 may not have been applied. **Do not rerun 001 against an existing database.** For a genuinely fresh, verified-empty project only, apply 001 first.
4. If **all four Gold objects** (`gold_requests`, `gold_requests_broker_unique`, `gold_requests_created`, `review_gold_request`) are null, migration 002 has not created its objects. After taking/confirming a current database backup, open a new SQL Editor query containing `begin;`, then the **complete unchanged contents** of `supabase/migrations/002_gold_requests.sql`, then `commit;`. Run that single transaction once. It only adds Gold objects and does not modify Academy tables or functions.
5. If all Gold objects exist, **do not rerun 002**. Compare the reported columns, constraints and function definition to the checked-in migration. Confirm RLS is enabled; anon/authenticated table SELECT and review-function EXECUTE are false; service_role permissions are true; and there are no Gold client policies. The status default must be Pending Verification, and approval/invitation fields and checks must be present.
6. If only some objects exist, definitions differ, or privileges are wrong, stop and investigate the partial/schema-drift state with the database operator. Do not drop tables, overwrite functions or rerun migrations blindly. Creating an empty table alone is not proof of a correctly applied migration.
7. Run the read-only check again after a successful migration and record the result with the deployment. Test one controlled request before opening registration to visitors.

Migration files applied manually in SQL Editor may not appear in Supabase CLI migration history. Inspect the actual schema and definitions; the presence or absence of a history row alone is insufficient.

## Admin and functional acceptance

Keep the existing admin allowlist and Supabase Auth setup. Confirm public signup is disabled and use a privately provisioned administrator whose Auth UUID is in `public.admins`. Do not add a new administrator or reset an existing one without the owner's direction.

Using the actual deployed site and controlled contact addresses:
1. Submit an Academy application in each language. Confirm New status, the saved fields and privacy/marketing consent; verify the admin notification reaches `brunildazenunaj@gmail.com` and the applicant confirmation reaches the controlled inbox. Confirm the personal follow-up process is understood. No scheduling/payment integration is required.
2. Submit a Gold request. Confirm Pending Verification and an admin notification. Verify registration/deposit independently in the official TradeQuo dashboard, then approve in BMM. Only after personally sending the Telegram invitation should the admin mark it sent. Check the persisted timestamp and actor; retrying that action must not overwrite the timestamp.
3. Confirm an unauthenticated browser and a real non-admin Auth user cannot access either admin API. Check status updates, rejection/reopen, and email retry handling. Browser fixture tests only verify UI interactions, not actual Supabase Auth or email delivery.
4. Confirm both languages, mobile navigation, external links, same-origin submissions and legal routes on the production hostname. Test the video on a real mobile device when its actual file is supplied.
5. Remove controlled test records according to the retention process. Academy deletion remains in the dashboard; Gold deletion is handled by an authorized database operator.

Email failures do not discard saved requests. Pending flags and dashboard retry controls remain available. Provider acceptance is not proof of inbox delivery; inspect the actual controlled inboxes and provider logs. Resend idempotency limitations documented in README still apply.

## Tutorial

The owner-supplied video is now present at `public/videos/bmm-registration.mp4`: 9.65 MiB, H.264/AAC, 1280×800, 5:02. The original is preserved separately and was not modified. See `public/videos/README.md` for conversion details and checksums. No captions were supplied. A normal Vercel build detects and serves the included MP4; there is no Google Drive dependency at playback time.

## Vercel readiness

The code uses the existing Next.js stack and is suitable for the standard Vercel Next.js build. Source validation does not publish a deployment. Connect this GitHub repository, retain framework defaults, configure the variables above, apply only the missing migration, then deploy. Production readiness additionally requires the controlled acceptance checks and business approval of the legal drafts (legal identity/address, jurisdiction, retention, affiliate terms and UK financial-promotion review).

This release performs no automatic broker verification or Telegram sending and exposes no private invitation URL. External provider eligibility must be confirmed before funding; BMM membership is free while broker funding is separate and at risk.

External URL check: the supplied TradeQuo and My ProTrader destinations were retained exactly. Workspace HTTP checks were blocked by the outbound proxy (CONNECT 403), so provider availability, broker eligibility and account setup have not been verified. Browser tests verify the link destinations, not those providers’ services.

## Recorded local validation — 21 October 2026

- `npm run typecheck`: passed.
- `npm test`: 10 passed. Includes ephemeral PostgreSQL migration/permissions/transition tests, read-only migration preflight checks and tutorial markup checks. These do not touch production.
- `npm run build`: passed with the existing Next.js stack.
- Browser suite: 9 passed with system Chromium against the production build. Includes Albanian default and English persistence, exact section order, responsive widths from 320 to 1440 pixels, both form error paths, isolated success UI fixtures, access denial, Gold manual controls and legal routes.
- Desktop/mobile rendered layouts reviewed. At the initial landing-page review the video was absent; the later tutorial integration below supersedes that limitation. No actual notification email was sent or confirmed. Live migration status, production Auth and live submissions remain unverified because service access is unavailable.

## Required WhatsApp contact update

Before deploying the new four-field Gold form, check `information_schema.columns` for `public.gold_requests.phone` (the read-only preflight above already lists every Gold column). If missing and migration 002 is complete, run the complete `supabase/migrations/003_gold_whatsapp.sql` once in Supabase SQL Editor. This file already includes BEGIN/COMMIT. Do not rerun 001 or 002. If the phone column exists, compare the `gold_requests_phone_format` constraint with 003 instead of rerunning it. Investigate partial schema differences before changing anything.

The database column permits NULL for historical requests. The new public API requires a valid international phone number for every new submission. Existing requests remain reviewable and show “Not provided (earlier request)”; no fabricated numbers are added. Academy storage and notifications are unchanged. Gold privacy acknowledgement now uses version `2026-10-gold-whatsapp`.

The phone is included in Gold admin notification emails and in the private dashboard with a user-initiated WhatsApp link. The website does not send WhatsApp messages or Telegram invitations automatically. Confirm the phone is saved and the admin email contains it in the controlled production acceptance test after applying 003. This migration has been tested locally; production application is not confirmed without database access.

## Tutorial completion

The real owner-supplied tutorial was downloaded after Drive access became available and optimized from 76.2 MiB to 9.65 MiB. The complete audio stream decodes successfully and contains audio; the full video is checked for decoding errors. The original duration and resolution are preserved and fast-start MP4 metadata is verified. Browser tests use the actual MP4 for desktop/mobile play, pause, seeking and HTTP range delivery; missing-file behavior remains covered separately. Automated browser playback is muted only in the test context. Caption files were not supplied.

Final tutorial validation: TypeScript checking and the production build passed; all 10 unit/integration tests and all 11 browser tests passed (21 total). The browser suite includes actual tutorial playback on desktop and mobile.

This completes the outstanding video asset work. It does not establish production Supabase configuration, migration application, Resend inbox delivery or a successful Vercel deployment. Apply/verify migration 003 before enabling the updated WhatsApp form, following the preceding database instructions. Existing 001/002 migrations must not be rerun blindly.

## Help requests update

The public questions section is removed. A bilingual help form beside access requests accepts contact details and the issue without requiring broker registration. The navigation and a direct email link make help accessible.

Before enabling live form submissions, check `select to_regclass('public.support_requests'), to_regprocedure('public.manage_support_request(uuid,uuid,text)');` in the correct Supabase project. If both are missing and migrations 001–003 are already installed, run all of `supabase/migrations/004_support_requests.sql` once (it includes BEGIN/COMMIT). If either exists, inspect its definition against migration 004 and investigate partial installation; do not blindly rerun any migration. This adds storage, RLS and audited resolution/deletion without changing Academy or Gold data.

With production credentials, submit one controlled help request without a Broker ID, confirm it appears in **Help Requests**, and confirm receipt at brunildazenunaj@gmail.com with the correct reply-to and contact details. Verify email retry after a provider error, admin resolution/reopening/deletion and denial for anonymous/non-admin users. Delete the test record afterward. Live migration application and actual email delivery cannot be verified in this workspace without service access. Direct email remains an alternative.

Local help-update validation: production build and TypeScript checking passed, all 12 unit/database tests passed, and all 13 browser tests passed. The help tests cover pre-registration submission, bilingual/mobile layout, honest unavailable-service behavior, protected endpoints, duplicate protection, private database permissions and audited admin actions. Successful browser form and dashboard states use isolated API fixtures, not live delivery.
