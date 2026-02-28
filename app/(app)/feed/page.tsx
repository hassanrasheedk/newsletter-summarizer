import { FeedHeader } from '@/components/feed/FeedHeader'
import { FeedList } from '@/components/feed/FeedList'

export const metadata = { title: 'Feed — Newsletter Summarizer' }

export default function FeedPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <FeedHeader />
      <FeedList />
    </div>
  )
}
