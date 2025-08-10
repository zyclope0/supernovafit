'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface CollapsibleCardProps {
  title: string
  defaultOpen?: boolean
  right?: React.ReactNode
  counter?: number | string
  children: React.ReactNode
}

export default function CollapsibleCard({ title, defaultOpen = true, right, counter, children }: CollapsibleCardProps) {
  const [open, setOpen] = useState<boolean>(defaultOpen)
  const panelId = `panel-${title.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="glass-effect rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? 'Replier' : 'Déplier'} la section ${title}`}
          className="flex items-center gap-2"
        >
          {open ? <ChevronDown className="w-4 h-4 text-white" /> : <ChevronRight className="w-4 h-4 text-white" />}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {typeof counter !== 'undefined' && (
            <span className="ml-2 bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded-full">{counter}</span>
          )}
        </button>
        {right}
      </div>
      {open && (
        <div id={panelId} className="mt-4">
          {children}
        </div>
      )}
    </div>
  )}


