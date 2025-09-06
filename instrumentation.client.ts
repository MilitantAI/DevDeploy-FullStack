'use client'
import { initBotId } from 'botid/client/core'
import * as Sentry from '@sentry/nextjs'

// Sentry client initialisation (App Router requires instrumentation-client at project root)
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
  replaysSessionSampleRate: Number(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? 0),
  replaysOnErrorSampleRate: Number(process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? 0)
})

// Declare protected paths (client awareness enables BotID classification)
initBotId({
  protect: [
    { path: '/api/protected', method: 'POST' }
  ]
})


