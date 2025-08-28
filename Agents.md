Fair point. Here’s a **clean, table-free Agents.md**—strict, project-agnostic, and aligned with the stack as implemented (Clerk auth, Stripe billing, price IDs in code, UploadThing for blobs, Convex as source of truth, PostHog proxied, Sentry on, BotID enabled).

---

# Agents.md — Guardrails & Playbooks

**Audience:** code-generating agents and maintainers.
**Stack:** Next.js (App Router + Tailwind), Convex, Clerk (auth only), Stripe (billing), UploadThing, PostHog (proxied), Sentry, Vercel BotID.
**Goal:** enable changes without compromising security, billing, or data integrity.

---

## 0) Non-negotiables

* **Auth**

  * Use Clerk for identity: `currentUser()`, `auth()`, `<SignedIn/>`, `<SignedOut/>`.
  * Do not build custom sessions, store passwords, or add another auth provider.

* **Billing**

  * Baseline ships **Stripe** (cards, Apple Pay, Google Pay).
  * Other providers (e.g., PayPal) are **out of baseline scope, not prohibited**. If you add one, route lifecycle events into the **same Convex entitlements** model.

* **Pricing IDs**

  * Keep non-secret price IDs in a **pricing catalog** (a code file like `lib/pricing.ts`, a `pricing` table in Convex, or a cached Stripe catalog fetch). Include a **fail-fast guard** if any ID is missing.
  * Do not put price IDs in `.env`. Do not scatter IDs across components.


* **Entitlements**

  * Single source of truth is **Convex**. Upsert `{subjectId, plan, status}` from webhooks. Guard **every** premium read/write in Convex.
  * Do not rely on client-only gating. Do not query Stripe from the client.

* **Data**

  * Persist only in **Convex** (queries/mutations/actions). Apply row-level auth by Clerk `userId`.
  * Do not add ad-hoc DBs/ORMs. Do not return cross-user rows.

* **Files**

  * Use **UploadThing** to move/store blobs. Persist **metadata in Convex** (`userId, url, key, type, size, ts`). Use signed/short-TTL URLs for private access.
  * Do not trust client-provided URLs. Do not expose bucket listings. Do not store blobs in Convex.

* **Abuse control**

  * Register sensitive endpoints in BotID client instrumentation and verify with `checkBotId()` in server routes.
  * Do not ship expensive endpoints without BotID.

* **Analytics & flags**

  * Route PostHog via the proxy path `/_ph`. Identify with Clerk `userId`. Capture SPA pageviews manually.
  * Do not hit the public PostHog host directly or log PII carelessly.

* **Errors & performance**

  * Capture with Sentry (client and server). Use sample rates from env.
  * Do not rely on console logs. Do not swallow errors.

* **Middleware**

  * Use Clerk’s official middleware (`createRouteMatcher` + `auth.protect()`).
  * Keep `/`, `/pricing`, `/sign-in(.*)`, `/sign-up(.*)`, `/api/webhooks/(.*)`, `/_ph/(.*)` public. Do not block webhooks behind auth.
  * **All webhook endpoints must remain public** (Stripe and any future provider). Authorization is via **signature verification**; entitlements are enforced in **Convex**.


* **Tailwind**

  * Match the repo’s major version.

    * If v3: `@tailwind base; @tailwind components; @tailwind utilities;`
    * If v4: `@tailwindcss/postcss` + `@import "tailwindcss"` (and `@reference` for CSS modules)
  * Do not mix v3/v4 syntax. Do not change major version mid-repo.

* **Secrets**

  * Keep secrets in env. Missing envs should fail fast and loudly.
  * Do not commit secrets. Do not silently degrade when envs are absent.

* **Docs & DX**

  * Keep README/Agents.md authoritative. Prefer code-tracked config over dashboard-only tweaks.
  * Do not speculate future features. Keep the baseline provider-agnostic beyond the stack above.

---

## 1) Sources of truth

* Clerk → identity (users/orgs, sessions).
* Stripe → payments and subscription events.
* Convex → persistent data, **entitlements**, authorization.
* UploadThing → blob transport/storage; Convex owns metadata/ownership.
* PostHog → analytics/flags via `/_ph`.
* Sentry → error/perf monitoring.
* BotID → bot/abuse protection on sensitive endpoints.

---

## 2) Canonical file map

*Edit in place if present. Create only if missing.*

* Routing/Shell: `app/layout.tsx`, `app/providers.tsx`, `app/globals.css`, `middleware.ts`, `app/(auth)/*`, `app/(app)/dashboard/page.tsx`, `app/pricing/page.tsx`
* Convex: `convex/schema.ts`, `convex/items.ts`, `convex/entitlements.ts`, `convex/guards.ts`, `convex/files.ts`
* APIs: `app/api/billing/stripe/create-checkout-session/route.ts`, `app/api/webhooks/stripe/route.ts`, `app/api/uploadthing/route.ts`, `app/api/protected/route.ts`
* Observability/Protection: `lib/posthog.tsx`, `sentry.client.config.ts`, `sentry.server.config.ts`, `next.config.ts`, `app/instrumentation.client.ts`
* Pricing catalog (non-secret): `lib/pricing.ts` **or** a Convex `pricing` table (if you choose DB-backed catalog)


---

## 3) Environment contract (secrets only)

**Price IDs are non-secret and live in your **pricing catalog** (code, Convex, or cached Stripe list).**

* `NEXT_PUBLIC_APP_URL`
* `NEXT_PUBLIC_APP_ENV` = `dev` | `prod`

**Clerk**

* `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
* `CLERK_SECRET_KEY`

**Convex**

* `NEXT_PUBLIC_CONVEX_URL`

**Stripe**

* `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
* `STRIPE_SECRET_KEY`
* `STRIPE_WEBHOOK_SECRET`

**UploadThing**

* `UPLOADTHING_SECRET`
* `UPLOADTHING_APP_ID`

**PostHog**

* `NEXT_PUBLIC_POSTHOG_KEY`
* `NEXT_PUBLIC_POSTHOG_HOST`

**Sentry**

* `SENTRY_DSN`
* `NEXT_PUBLIC_SENTRY_DSN`
* `SENTRY_TRACES_SAMPLE_RATE`
* `SENTRY_REPLAYS_SESSION_SAMPLE_RATE`
* `SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE`

---

## 4) Pricing IDs in code

**Pricing is catalog-driven.** Choose one of these **non-secret** catalog patterns and stick to it:
  1. **Code catalog**: `lib/pricing.ts` maps **arbitrary tier keys** (e.g., `tierA`, `tierB`) to Stripe price IDs for **dev/prod**.
  2. **Convex catalog**: price IDs stored as records in a `pricing` table (seeded at deploy), read server-side.
  3. **Stripe catalog at runtime**: fetch Products/Prices server-side and **cache** (ISR/tagged cache) to avoid per-request calls.
  Whichever you pick, **do not hard-code tier names** into components; read from the catalog.
* Include a fail-fast guard that throws if any ID is missing.
* Do not duplicate price IDs in components, routes, or env.
* Env contains **secrets only** (Stripe secret key, webhook secret, etc.).
  **Price IDs are non-secret** and belong in your **chosen catalog** (code, Convex, or cached Stripe read).
  If you add another provider, add its **envs** and **webhook secret**, and map its events to Convex entitlements.

---

## 5) Modification rules

**Allowed**

* Append Convex tables/indexes in `convex/schema.ts`.
* Add Convex queries/mutations/actions; every handler checks `ctx.auth.getUserIdentity()`; premium paths call the entitlement guard.
* Extend `/pricing` by reading tiers from the **pricing catalog** (code or Convex, or cached Stripe list).

* Extend UploadThing endpoints/types; persist metadata via Convex.
* Register protected endpoints in `app/instrumentation.client.ts` and verify with `checkBotId()` in handlers.
* Add PostHog events/flags and Sentry capture points.

**Forbidden**

**Do not integrate additional providers without**:
  (a) documenting their envs and webhooks, and
  (b) mapping their lifecycle to **Convex entitlements**.
  Baseline remains Stripe; additional providers are optional extensions.
* Do not persist data outside Convex.
* Do not use client-only authorization.
* Do not scatter price IDs across components.
* Do not couple UI to specific tier names—render from catalog.
* Do not mix Tailwind major versions.
* Do not commit secrets.

---

## 6) Canonical interfaces (minimal)

*If these are missing, implement once. If present, do not re-implement.*

* **Convex entitlement guard** (`convex/guards.ts`)

  * `requirePlan(ctx, 'basic' | 'pro') → userId`
  * Throws `'unauthorized'` if no session; `'forbidden'` if plan/status insufficient.
  * Used in **every** premium mutation/query.

* **Stripe webhook** (`app/api/webhooks/stripe/route.ts`)

  * Verify signature with `STRIPE_WEBHOOK_SECRET`.
  * Upsert Convex `entitlements` with `{ subjectId, plan, status, currentPeriodEnd? }`.
  * Never rely on client redirect alone for activation.

* **UploadThing completion** (`app/api/uploadthing/route.ts`)

  * On `onUploadComplete`, call Convex mutation `files.recordUpload({ userId, url, key, name, size, type })`.
  * All listing reads filter by `userId`. Private access uses signed/short-TTL URLs.

* **Clerk middleware** (`/middleware.ts`)

  * Use `clerkMiddleware` + `createRouteMatcher`.
  * Public: `/`, `/pricing`, `/sign-in(.*)`, `/sign-up(.*)`, `/api/webhooks/(.*)`, `/_ph/(.*)`.
  * All other routes `auth.protect()`.

---

## 7) Playbooks

**Add a premium feature**

1. Add table/index in `convex/schema.ts`.
2. Implement mutation/query; first line in premium paths: `await requirePlan(ctx, 'pro')`.
3. UI: render feature; show upsell if `myEntitlements` inactive.
4. Telemetry: PostHog event on success; Sentry capture on error.
5. Verify: free user gets 403; paid user succeeds.

**Add a new file type (uploads)**

1. Extend UploadThing endpoint MIME/limits.
2. Persist metadata in Convex on completion.
3. UI: add uploader; list via `api.files.myFiles`.
4. Ensure per-user filtering and private access rules.

**Protect a new expensive API route**

1. Register `{ path, method }` in `app/instrumentation.client.ts`.
2. In the handler: `const v = await checkBotId(); if (v.isBot) return 403;`.

**Extend pricing catalog**

1. Create prices in Stripe (test/live).
2. Update your **chosen catalog** (code or Convex), or refresh the **cached Stripe list**.
3. `/pricing` renders from catalog; **no hard-coded tier names**.

---

## 8) Testing & verification

**Local**

* `pnpm convex:dev` → set `NEXT_PUBLIC_CONVEX_URL`.
* `pnpm dev` → sign in via Clerk dev instance.
* Stripe test: `stripe listen --forward-to /api/webhooks/stripe`; complete Checkout; ensure Convex `entitlements` updated.
* Uploads: upload and confirm Convex metadata write; cross-user access denied.
* BotID: protected routes behave; enable deeper analysis in Vercel for production.
* PostHog: events flow via `/_ph`; user identified.
* Sentry: trigger a test error; confirm capture.

**Prod**

* Separate prod envs; verify Apple Pay domain; add Stripe webhook at `/api/webhooks/stripe`.
* `NEXT_PUBLIC_APP_ENV=prod` so `lib/pricing.ts` uses live IDs.

---

## 9) PR template (fill in every time)

* Context (why).
* Security (auth/entitlements, BotID coverage).
* Data (schema/index changes, migration impact).
* Billing (tiers touched—names only; IDs live in `lib/pricing.ts`).
* Telemetry (PostHog events/flags; Sentry capture points).
* Testing (local + webhook + upload + premium gating).
* Rollback (revert or flag off).

---

## 10) Definition of Done

* `pnpm build` and `pnpm typecheck` pass.
* Premium paths blocked for free users; allowed for paid users.
* Stripe webhook reliably updates Convex entitlements.
* Uploads persist and list per-user; no cross-tenant leakage.
* BotID enforced on sensitive endpoints.
* PostHog events appear; Sentry receives a test exception.
* README/Agents.md updated if envs or flows changed.

---

## 11) Prohibited changes

* Adding payment providers **without** documenting their envs/webhooks **and** mapping their lifecycle to **Convex entitlements**.
* Moving price IDs to env or scattering them outside `lib/pricing.ts`.
* Persisting data outside Convex.
* Client-only authorization.
* Mixing Tailwind major versions.
* Committing secrets.

---

### Bottom line

* If it isn’t enforced in **Convex**, it isn’t protected.
* If it isn’t in the **pricing catalog** (code, Convex, or cached Stripe list), it isn’t a valid price.
* If it didn’t pass through the **billing provider’s webhooks**, it isn’t a real entitlement.
* If it bypasses **Clerk**, it isn’t a user.
* If it skips **BotID**, expect abuse.
* If it doesn’t show in **PostHog/Sentry**, you won’t measure or fix it.
