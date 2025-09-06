// convex/auth.config.ts
// Configure Convex to validate Clerk-issued JWTs from the "convex" template.

export default {
  providers: [
    {
      // Set this to your Clerk Frontend API URL (the Issuer domain of your "convex" JWT template),
      // e.g. https://verb-noun-00.clerk.accounts.dev
      // Provide it via env: CLERK_JWT_ISSUER_DOMAIN
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: 'convex',
    },
  ],
}


