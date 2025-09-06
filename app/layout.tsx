// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import Providers from './providers'
import Nav from './components/Nav'

export const metadata: Metadata = {
  title: 'App',
  description: 'Next + Convex + Clerk + PostHog',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  )
}
