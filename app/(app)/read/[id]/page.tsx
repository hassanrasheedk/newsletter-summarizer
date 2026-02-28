import { EmailContent } from '@/components/reader/EmailContent'
import { AISidebar } from '@/components/reader/AISidebar'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReadPage({ params }: Props) {
  const { id } = await params
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <EmailContent id={id} />
      </div>
      <AISidebar id={id} />
    </div>
  )
}
