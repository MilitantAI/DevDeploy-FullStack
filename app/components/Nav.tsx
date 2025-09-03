'use client'
import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Nav() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">App</Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black">Dashboard</Link>
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-black">Pricing</Link>
          <SignedIn>
            <Link href="/settings" className="text-sm text-gray-600 hover:text-black">Settings</Link>
          </SignedIn>
        </div>
        <div>
          <SignedIn><UserButton /></SignedIn>
          <SignedOut>
            <Link href="/sign-in" className="text-sm underline">Sign in</Link>
          </SignedOut>
        </div>
      </nav>
    </header>
  )
}

 