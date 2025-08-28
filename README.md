# Next + Convex + Clerk + PostHog + Tailwind + Vercel (BotID) + UploadThing + Stripe + Sentry

A **production-ready starter scaffold** for SaaS:

* **Next.js (App Router + Tailwind v4)**
* **Convex** (DB, server functions, realtime)
* **Clerk** (authentication & user management)
* **Stripe** (subscriptions, Apple Pay, Google Pay)
* **UploadThing** (operational file storage)
* **PostHog** (analytics, feature flags, session replay via proxy)
* **Sentry** (error/performance monitoring)
* **Vercel BotID** (bot protection)

---

## Agents.md (Guardrails & Playbooks)

This repo ships with a predefined governance file: [`Agents.md`](./Agents.md).

It codifies non‑negotiable guardrails and playbooks across auth, billing, data, files, analytics, errors, and middleware. Highlights:

- **Entitlements in Convex**: Stripe webhooks upsert entitlements; premium reads/writes are guarded server‑side.
- **Pricing IDs in code**: Non‑secret price IDs live in `lib/pricing.ts` (dev/prod aware), not in env.
- **PostHog proxied**: Analytics through `/_ph`; users identified via Clerk.
- **Uploads via UploadThing**: Blobs move via UploadThing; metadata persists in Convex.
- **Clerk middleware**: Keep `/_ph`, `/pricing`, auth routes, and `/api/webhooks/(.*)` public; protect the rest.
- **Sentry & BotID**: Sentry on both sides; protect expensive endpoints with BotID (`checkBotId()`).

Read it before making changes; new features should comply with those guardrails.

---

## Quickstart

### 1. Prerequisites

* Node.js 18+
* pnpm (recommended)
* Accounts: Clerk, Convex, Stripe, UploadThing, PostHog, Vercel

### 2. Clone & install

```bash
git clone <REPO_URL> app && cd app
pnpm install
```

### 3. Environment variables

Copy `.env.example` → `.env.local` and fill in values (secrets only):

```ini
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=dev

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex
NEXT_PUBLIC_CONVEX_URL=   # filled after `pnpm convex:dev`

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=    # filled after `stripe listen`

# UploadThing
UPLOADTHING_SECRET=...
UPLOADTHING_APP_ID=...

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0
```

### 4. Run locally

Terminal A:

```bash
pnpm convex:dev
```

Copy the Convex deployment URL → `NEXT_PUBLIC_CONVEX_URL`.

Terminal B:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000).

### 5. Stripe webhook (local)

```bash
stripe login
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

Copy the signing secret → `STRIPE_WEBHOOK_SECRET`.

---

## Features & Integration Details

### Clerk (Authentication)

* Sign-in and sign-up routes already wired (`/sign-in`, `/sign-up`).
* Server: `currentUser()` in server components, `auth()` in API routes.
* Client: `<SignedIn>`, `<SignedOut>`, `<SignInButton>`.

### Convex (Database)

* Schema and queries in `convex/`.
* Example: `items` table with row-level auth by Clerk user ID.
* **Entitlements** table stores plan/feature status, updated by Stripe webhooks.

### Stripe (Billing)

* Prebuilt **pricing page** at `/pricing` with Stripe Checkout (cards + Apple Pay + Google Pay).
* **Webhooks** keep Convex entitlements in sync (`active`, `canceled`, etc.).
* Non-secret price IDs live in the code **catalog** at `lib/pricing.ts` (dev/prod aware) and are not stored in env.
* Apple Pay & Google Pay surface automatically in Checkout once enabled in Stripe Dashboard.

### UploadThing (User Files)

* Endpoint in `app/api/uploadthing/route.ts`.
* Convex table `files` stores metadata (userId, url, key).
* Example UI: `Uploader.tsx` lists and uploads files per-user.
* Secure by Clerk user identity.

### PostHog (Analytics & Feature Flags)

* Proxied through `/_ph` to avoid blockers.
* User identification wired to Clerk user data.
* SPA pageviews auto-captured.
* Example feature flag: `<FeatureFlagPanel flagKey="beta-panel" />`.

### Sentry (Monitoring)

* Configured for client and server with sample rates in env.
* Errors captured in API routes and server components.

### BotID (Bot Protection)

* Integrated in `next.config.ts` with `withBotId()`.
* Client instrumentation lists protected routes.
* Use `checkBotId()` in API routes for verification.

---

## Deployment (Vercel)

1. Import repo into Vercel.
2. Add environment variables (use **live Stripe keys** in prod).
3. Enable **Apple Pay domain verification** in Stripe.
4. Add Stripe webhook: `https://<yourdomain>/api/webhooks/stripe`.
5. Enable **BotID Deep Analysis** under Firewall in Vercel.

---

## Dev Notes

* Convex client types live in `convex/_generated/`. Run `pnpm convex:dev` after schema changes.
* All server-side access checks should be enforced in Convex functions.
* Client-only checks (feature flags, `<Protect>`, etc.) are UX sugar; do not rely on them for security.

---

## Extending

* Add new features by extending `convex/schema.ts` + new queries/mutations.
* Gate premium features with Convex entitlements.
* Add UploadThing endpoints for additional file types.
* Add PostHog feature flags to stage rollouts safely.

---

⚡ **Goal**: This stack saves weeks of dev-ops decision making and setup. Clone, link accounts, configure envs, and deploy to Vercel — you’ll have a monetizable SaaS foundation ready in minutes.

---
