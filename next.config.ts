import type { NextConfig } from 'next'
import { withBotId } from 'botid/next/config'
import { withSentryConfig } from '@sentry/nextjs'


const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
const PH_PROXY_PATH = '/_ph' // avoid common names like /ingest, /analytics, /posthog


const nextConfig: NextConfig = {
  // Required for some PostHog endpoints
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      // Static assets (session replay, etc.)
      {
        source: `${PH_PROXY_PATH}/static/:path*`,
        destination: `${POSTHOG_HOST}/static/:path*`
      },
      // API endpoints
      {
        source: `${PH_PROXY_PATH}/:path*`,
        destination: `${POSTHOG_HOST}/:path*`
      }
    ]
  }
}

const wrapped = withSentryConfig(withBotId(nextConfig), {
  // build-time options
  silent: true,
  // client bundle options
  widenClientFileUpload: false
})

export default wrapped