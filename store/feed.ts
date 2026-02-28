import { create } from 'zustand'
import type { NewsletterIssue, ViewMode } from '@/types'

interface FeedState {
  newsletters: NewsletterIssue[]
  selectedId: string | null
  viewMode: ViewMode
  isLoading: boolean
  searchQuery: string
  refreshTick: number

  setNewsletters: (newsletters: NewsletterIssue[]) => void
  setSelected: (id: string | null) => void
  setViewMode: (mode: ViewMode) => void
  setLoading: (loading: boolean) => void
  setSearchQuery: (query: string) => void
  markRead: (id: string) => void
  toggleSaved: (id: string) => void
  refresh: () => void
}

export const useFeedStore = create<FeedState>((set) => ({
  newsletters: [],
  selectedId: null,
  viewMode: 'feed',
  isLoading: false,
  searchQuery: '',
  refreshTick: 0,

  setNewsletters: (newsletters) => set({ newsletters }),
  setSelected: (id) => set({ selectedId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  markRead: (id) =>
    set((state) => ({
      newsletters: state.newsletters.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),

  toggleSaved: (id) =>
    set((state) => ({
      newsletters: state.newsletters.map((n) =>
        n.id === id ? { ...n, isSaved: !n.isSaved } : n
      ),
    })),

  refresh: () => set((state) => ({ refreshTick: state.refreshTick + 1 })),
}))
