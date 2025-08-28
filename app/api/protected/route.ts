import { NextResponse } from 'next/server'
import { checkBotId } from 'botid/server'

export async function POST() {
  const verification = await checkBotId()
  if (verification.isBot) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }
  // Do expensive work here
  return NextResponse.json({ ok: true })
}