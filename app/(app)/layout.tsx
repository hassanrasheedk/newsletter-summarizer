'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Inbox, Star, Tag, Settings, ChevronLeft, ChevronRight, Bot, CheckCircle2 } from 'lucide-react'
import { LogoWordmark, LogoIcon } from '@/components/ui/logo'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  { href: '/feed', label: 'Inbox', icon: Inbox },
  { href: '/digest', label: 'Digest', icon: Bot },
  { href: '/saved', label: 'Saved', icon: Star },
  { href: '/tags', label: 'Tags', icon: Tag },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            'flex flex-col border-r border-border bg-sidebar transition-all duration-200',
            collapsed ? 'w-14' : 'w-52'
          )}
        >
          {/* Logo */}
          <div className={cn('flex h-14 items-center border-b border-border px-3', collapsed ? 'justify-center' : 'gap-2')}>
            {collapsed ? (
              <LogoIcon size={26} />
            ) : (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <LogoWordmark />
              </div>
            )}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Nav */}
          <ScrollArea className="flex-1 py-2">
            <nav className="flex flex-col gap-1 px-2">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href)
                const item = (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
                      active
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      collapsed && 'justify-center'
                    )}
                  >
                    <Icon size={16} />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                )
                return collapsed ? (
                  <Tooltip key={href}>
                    <TooltipTrigger asChild>{item}</TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                  </Tooltip>
                ) : item
              })}
            </nav>

            {!collapsed && (
              <>
                <Separator className="my-3 mx-2" />
                <p className="px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Connected
                </p>
                <div className="px-4 flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[oklch(0.62_0.18_162)] shrink-0" />
                  <span className="text-xs text-muted-foreground">Gmail</span>
                </div>
              </>
            )}
          </ScrollArea>

          {/* Settings link */}
          <div className="border-t border-border p-2">
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/settings"
                    className="flex justify-center rounded-md p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <Settings size={16} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href="/settings"
                className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Settings size={16} />
                <span>Settings</span>
              </Link>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex flex-1 overflow-hidden">{children}</main>
      </div>
    </TooltipProvider>
  )
}
