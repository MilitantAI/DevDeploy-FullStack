// app/components/FileList.tsx
'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function FileList() {
  const files = useQuery(api.files.myFiles) ?? []
  const remove = useMutation(api.files.remove)

  if (files.length === 0) {
    return <p className="text-sm text-gray-600">No uploads yet.</p>
  }

  return (
    <ul className="space-y-2">
      {files.map((f) => (
        <li key={f._id} className="flex items-center justify-between rounded border p-2">
          <div className="min-w-0">
            <a className="truncate text-blue-600 underline" href={f.url} target="_blank" rel="noreferrer">
              {f.name}
            </a>
            <div className="text-xs text-gray-500">
              {f.type} • {(f.size / 1024).toFixed(1)} KB • {new Date(f.uploadedAt).toLocaleString()}
            </div>
          </div>
          <button
            className="ml-3 rounded bg-black px-3 py-1 text-white text-xs"
            onClick={() => remove({ id: f._id })}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
