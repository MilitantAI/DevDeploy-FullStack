// /middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Protect everything except explicitly public routes
const isPublic = createRouteMatcher([
  '/',                 // landing
  '/pricing',          // pricing page
  '/sign-in(.*)',      // auth screens
  '/sign-up(.*)',

  // Webhooks and health (must not require a session)
  '/api/webhooks/(.*)',
  '/api/health',

  // Static-ish/analytics endpoints you expose publicly
  '/_ph/(.*)',

  // Add any other PUBLIC routes here
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) {
    // Enforce authentication (returns 404 by default if not authorized)
    await auth.protect()
  }
})

/**
 * Matcher: run middleware on all app routes, API, and trpc,
 * but skip Next internals and static assets.
 * This is the regex block Clerk recommends.
 */
export const config = {
  matcher: [
    // Skip _next and all static files unless in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run on API routes
    '/(api|trpc)(.*)',
  ],
}
