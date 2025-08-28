'use client'
import { initBotId } from 'botid/client/core'


// Declare protected paths (client awareness enables BotID classification)
initBotId({
protect: [
{ path: '/api/protected', method: 'POST' }
]
})

// To protect additional API endpoints with BotID:
// 1) Add them to the list above, e.g. { path: '/api/heavy-task', method: 'POST' }
// 2) In the route handler, call `const v = await checkBotId(); if (v.isBot) return 403;`
// 3) Optionally enable Deep Analysis in Vercel for production