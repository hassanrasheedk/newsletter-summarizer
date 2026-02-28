'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Mail, CheckCircle, Loader2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type Step = 'welcome' | 'connecting' | 'scanning' | 'done'

const STEPS: { key: Step; label: string }[] = [
  { key: 'welcome', label: 'Welcome' },
  { key: 'connecting', label: 'Connect' },
  { key: 'scanning', label: 'Scanning' },
  { key: 'done', label: 'Done' },
]

export function ConnectEmail() {
  const [step, setStep] = useState<Step>('welcome')
  const [foundCount, setFoundCount] = useState(0)

  const stepIndex = STEPS.findIndex((s) => s.key === step)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  async function handleConnect() {
    setStep('connecting')
    await signIn('google', { callbackUrl: '/feed' })
  }

  async function handleScan() {
    setStep('scanning')
    const res = await fetch('/api/sync', { method: 'POST' })
    const data = (await res.json()) as { synced: number }
    setFoundCount(data.synced ?? 0)
    setStep('done')
  }

  return (
    <Card className="w-full max-w-md animate-slide-up shadow-xl">
      <CardHeader className="pb-3">
        <div className="mb-2 flex gap-1">
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i <= stepIndex ? 'bg-primary' : 'bg-border'
              )}
            />
          ))}
        </div>
        <CardTitle className="text-xl">
          {step === 'welcome' && 'Welcome to Newsletter Summarizer'}
          {step === 'connecting' && 'Connecting Gmail…'}
          {step === 'scanning' && 'Scanning your inbox…'}
          {step === 'done' && `Found ${foundCount} newsletters!`}
        </CardTitle>
        <CardDescription>
          {step === 'welcome' && 'Connect your Gmail to get AI-powered summaries of your newsletters.'}
          {step === 'connecting' && 'Authorizing read-only access to your Gmail.'}
          {step === 'scanning' && 'Detecting newsletters and generating summaries with Claude AI.'}
          {step === 'done' && 'Your feed is ready. Newsletters are ranked by importance.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Progress value={progress} className="h-1.5" />

        {step === 'welcome' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
              <Mail size={20} className="mt-0.5 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-medium">Gmail OAuth — read-only</p>
                <p className="text-muted-foreground">We never store your credentials. Emails stay local.</p>
              </div>
            </div>
            <Button onClick={handleConnect} className="w-full gap-2">
              Connect Gmail <ChevronRight size={16} />
            </Button>
          </div>
        )}

        {step === 'connecting' && (
          <div className="flex justify-center py-6">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        )}

        {step === 'scanning' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Fetching emails and running AI summarization…
            </p>
            <Button variant="outline" size="sm" onClick={handleScan}>
              Start Scan
            </Button>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle size={48} className="text-[oklch(0.62_0.18_162)]" />
            <Button asChild className="w-full">
              <a href="/feed">Open My Feed →</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
