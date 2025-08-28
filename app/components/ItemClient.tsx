'use client'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState } from 'react'

export default function ItemClient() {
  const items = useQuery(api.items.myItems) ?? []
  const addItem = useMutation(api.items.addItem)
  const [text, setText] = useState('')

  return (
    <section className="space-y-3">
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (!text.trim()) return
          await addItem({ text })
          setText('')
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 rounded border px-3 py-2"
          placeholder="Add an item"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="rounded bg-black px-4 py-2 text-white" type="submit">
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it._id} className="rounded border p-2">
            {new Date(it.createdAt).toLocaleString()} — {it.text}
          </li>
        ))}
      </ul>
    </section>
  )
}