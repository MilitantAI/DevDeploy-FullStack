'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-gray-600">{error.message}</p>
      <button className="mt-4 rounded bg-black px-4 py-2 text-white" onClick={() => reset()}>
        Try again
      </button>
    </main>
  )
}


