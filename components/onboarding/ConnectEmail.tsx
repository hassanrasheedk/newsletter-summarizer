'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Mail, CheckCircle, Loader2, ChevronRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { LogoWordmark } from '@/components/ui/logo'
import { cn } from '@/lib/utils'

type Step = 'welcome' | 'connecting' | 'scanning' | 'done'

const STEPS: { key: Step; label: string }[] = [
  { key: 'welcome',    label: 'Welcome'  },
  { key: 'connecting', label: 'Connect'  },
  { key: 'scanning',   label: 'Scanning' },
  { key: 'done',       label: 'Done'     },
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
    <Card className="w-full max-w-md animate-slide-up shadow-2xl border-border/60">
      <CardHeader className="pb-3">
        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <LogoWordmark />
        </div>

        {/* Step progress */}
        <div className="mb-4 flex gap-1">
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-300',
                i <= stepIndex
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-500'
                  : 'bg-border'
              )}
            />
          ))}
        </div>

        <CardTitle className="text-xl">
          {step === 'welcome'    && 'Your inbox, finally under control'}
          {step === 'connecting' && 'Connecting Gmail…'}
          {step === 'scanning'   && 'Skimming your inbox…'}
          {step === 'done'       && `Found ${foundCount} newsletters!`}
        </CardTitle>
        <CardDescription>
          {step === 'welcome'    && 'Skimr reads your newsletters so you get the signal, not the noise.'}
          {step === 'connecting' && 'Authorizing read-only access to your Gmail.'}
          {step === 'scanning'   && 'AI is skimming and ranking your newsletters…'}
          {step === 'done'       && 'Your feed is ready — ranked by what matters most.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Progress value={progress} className="h-1" />

        {step === 'welcome' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-cyan-400" />
              <div className="text-sm">
                <p className="font-medium">Read-only Gmail access</p>
                <p className="text-muted-foreground text-xs mt-0.5">We never store your credentials. Emails are processed locally and never leave your machine.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Mail size={18} className="mt-0.5 shrink-0 text-violet-400" />
              <div className="text-sm">
                <p className="font-medium">AI-powered summaries</p>
                <p className="text-muted-foreground text-xs mt-0.5">Every newsletter is skimmed, ranked by importance, and delivered as key points — not walls of text.</p>
              </div>
            </div>
            <Button onClick={handleConnect} className="w-full gap-2 mt-1 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 border-0">
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
            <p className="text-sm text-muted-foreground text-center">
              Skimming emails and generating AI summaries…
            </p>
            <Button variant="outline" size="sm" onClick={handleScan}>
              Start Scan
            </Button>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle size={48} className="text-cyan-400" />
            <p className="text-sm text-muted-foreground text-center">
              Skimr has skimmed and ranked your newsletters.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 border-0">
              <a href="/feed">Open My Feed →</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
