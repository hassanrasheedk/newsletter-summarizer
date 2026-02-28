'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import {
  RefreshCw, LogOut, Mail, Database, Bot, Palette,
  ToggleLeft, ChevronDown, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { NewsletterSource, Category } from '@/types'
import type { DbStats } from '@/lib/db'

const CATEGORIES: Category[] = [
  'Tech', 'AI', 'Finance', 'Business', 'Politics',
  'Health', 'Science', 'Culture', 'Other',
]

const AI_MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Fast · Lower cost · Good quality' },
  { value: 'gpt-4o',      label: 'GPT-4o',      desc: 'Slower · Higher cost · Best quality' },
]

function cleanName(raw: string) {
  return raw.replace(/^"+|"+$/g, '').trim()
}

function SettingRow({ label, description, children }: {
  label: string; description?: string; children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <Icon size={16} className="text-primary" />
      <h2 className="text-base font-semibold">{title}</h2>
    </div>
  )
}

export function SettingsView() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DbStats | null>(null)
  const [sources, setSources] = useState<NewsletterSource[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [model, setModel] = useState('gpt-4o-mini')

  useEffect(() => {
    const saved = localStorage.getItem('ai_model')
    if (saved) setModel(saved)

    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/sources').then(r => r.json()),
    ]).then(([s, sr]: [DbStats, { sources: NewsletterSource[] }]) => {
      setStats(s)
      setSources(sr.sources ?? [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      const data = await res.json() as { synced: number }
      toast.success(`Synced ${data.synced} newsletters`)
      const s = await fetch('/api/stats').then(r => r.json()) as DbStats
      setStats(s)
    } catch {
      toast.error('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  async function toggleSource(id: string, isActive: boolean) {
    setSources(prev => prev.map(s => s.id === id ? { ...s, isActive } : s))
    await fetch(`/api/sources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    toast.success(isActive ? 'Source enabled' : 'Source disabled')
  }

  async function updateCategory(id: string, category: Category) {
    setSources(prev => prev.map(s => s.id === id ? { ...s, category } : s))
    await fetch(`/api/sources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    })
    toast.success('Category updated')
  }

  function handleModelChange(value: string) {
    setModel(value)
    localStorage.setItem('ai_model', value)
    toast.success('AI model updated')
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col gap-8">

        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your account, sources, sync, and AI preferences.
          </p>
        </div>

        {/* ── Stats ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : stats ? ([
            { label: 'Newsletters', value: stats.total },
            { label: 'Sources',     value: stats.sources },
            { label: 'Avg Score',   value: stats.avgScore },
            { label: 'Saved',       value: stats.saved },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-card px-4 py-3 flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold tabular-nums">{value}</p>
            </div>
          ))) : null}
        </div>

        {/* ── Account ───────────────────────────────────────────── */}
        <section className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5">
          <SectionHeader icon={Mail} title="Account" />
          <Separator className="my-3" />
          <SettingRow label="Connected Gmail" description={session?.user?.email ?? 'Loading…'}>
            <Badge variant="outline" className="text-[oklch(0.62_0.18_162)] border-[oklch(0.62_0.18_162/0.4)] bg-[oklch(0.62_0.18_162/0.1)] text-xs">
              ✓ Connected
            </Badge>
          </SettingRow>
          <Separator />
          <SettingRow label="Sign out" description="Disconnect your Gmail account">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => signOut({ callbackUrl: '/connect' })}
            >
              <LogOut size={12} /> Sign out
            </Button>
          </SettingRow>
        </section>

        {/* ── Sync ──────────────────────────────────────────────── */}
        <section className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5">
          <SectionHeader icon={RefreshCw} title="Sync" />
          <Separator className="my-3" />
          <SettingRow label="Manual sync" description="Fetch latest emails and run AI processing">
            <Button
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing…' : 'Sync now'}
            </Button>
          </SettingRow>
        </section>

        {/* ── AI ────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5">
          <SectionHeader icon={Bot} title="AI" />
          <Separator className="my-3" />
          <SettingRow label="Summarization model" description="Model used for newsletter summaries and key points">
            <Select value={model} onValueChange={handleModelChange}>
              <SelectTrigger className="h-8 text-xs w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map(m => (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{m.label}</span>
                      <span className="text-[10px] text-muted-foreground">{m.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
        </section>

        {/* ── Newsletter Sources ─────────────────────────────────── */}
        <section className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5">
          <SectionHeader icon={Database} title="Newsletter Sources" />
          <p className="text-xs text-muted-foreground mb-3">
            {sources.length} detected sources — disable any you don't want synced.
          </p>
          <Separator className="mb-2" />

          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {sources.map((source) => (
                <div key={source.id} className={cn('flex items-center gap-3 py-3', !source.isActive && 'opacity-40')}>
                  {/* Domain avatar */}
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground shrink-0 uppercase">
                    {cleanName(source.senderName).slice(0, 2)}
                  </div>

                  {/* Name + domain */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cleanName(source.senderName)}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{source.domain}</p>
                  </div>

                  {/* Category */}
                  <Select
                    value={source.category}
                    onValueChange={(v) => updateCategory(source.id, v as Category)}
                  >
                    <SelectTrigger className="h-7 text-[11px] w-28 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Active toggle */}
                  <Switch
                    checked={source.isActive}
                    onCheckedChange={(v) => toggleSource(source.id, v)}
                    className="shrink-0"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
