import { Suspense } from 'react'
import { TagsView } from '@/components/tags/TagsView'

export const metadata = { title: 'Tags — Skimr' }

export default function TagsPage() {
  return (
    <Suspense>
      <TagsView />
    </Suspense>
  )
}
