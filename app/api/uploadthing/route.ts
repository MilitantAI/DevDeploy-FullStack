import { auth } from '@clerk/nextjs/server'
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { createRouteHandler } from 'uploadthing/next'
import { fetchMutation } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'

const f = createUploadthing()

export const ourFileRouter = {
  // Adjust types/limits to your needs
  fileUploader: f({
    image: { maxFileSize: '8MB', maxFileCount: 10 },
    'application/pdf': { maxFileSize: '16MB', maxFileCount: 5 }
  })
    .middleware(async () => {
      const { userId } = await auth()
      if (!userId) throw new Error('unauthorized')
      return { userId } // becomes `metadata.userId` in onUploadComplete
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Persist metadata in Convex
      await fetchMutation(api.files.recordUpload, {
        userId: metadata.userId,
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type
      })
    })
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

// Next.js route export
export const { GET, POST } = createRouteHandler({ router: ourFileRouter })