// app/components/Uploader.tsx
'use client'

import { UploadButton } from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/route'

export default function Uploader() {
  return (
    <div className="rounded border p-3">
      <h3 className="font-medium mb-2">Upload files</h3>
      <UploadButton<OurFileRouter, 'fileUploader'>
        endpoint="fileUploader"
        onUploadError={(e) => alert(e.message)}
      />
    </div>
  )
}
