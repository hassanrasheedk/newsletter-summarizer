'use client'

import { RefreshCw, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFeedStore } from '@/store/feed'
import type { ViewMode } from '@/types'
import { toast } from 'sonner'

export function FeedHeader() {
  const { viewMode, setViewMode, setSearchQuery, searchQuery, refresh } = useFeedStore()
  const [syncing, setSyncing] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      const data = (await res.json()) as { synced: number }
      toast.success(`Synced ${data.synced} newsletters`)
      refresh()
    } catch {
      toast.error('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <header className="border-b border-border py-3">
      <div className="flex items-center gap-3 max-w-3xl mx-auto px-4">
      <div className="relative flex-1 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search newsletters…"
          className="pl-8 h-8 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {mounted && (
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList className="h-8">
            <TabsTrigger value="feed" className="text-xs px-3">Feed</TabsTrigger>
            <TabsTrigger value="quickscan" className="text-xs px-3">Quick Scan</TabsTrigger>
            <TabsTrigger value="digest" className="text-xs px-3">Digest</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={handleSync}
        disabled={syncing}
      >
        <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
        {syncing ? 'Syncing…' : 'Sync'}
      </Button>
      </div>
    </header>
  )
}
