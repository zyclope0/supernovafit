'use client'

import { useEffect } from 'react'

function extractError(data: unknown): { name?: string; message?: string } {
  if (!data) return {}
  if (data instanceof Error) return { name: data.name, message: data.message }
  const anyObj = data as { name?: string; message?: string }
  return { name: anyObj?.name, message: anyObj?.message }
}

export default function ChunkGuard() {
  useEffect(() => {
    const stamp = process.env.NEXT_PUBLIC_APP_VERSION || 'v'
    const key = `snf-chunk-reload-${stamp}`

    // Clear previous reload marker after a successful load
    try { sessionStorage.removeItem(key) } catch {}

    const handler = (evt: Event) => {
      const isErrorEvt = (evt as ErrorEvent).error !== undefined
      const isPromiseEvt = (evt as PromiseRejectionEvent).reason !== undefined

      const { name, message } = extractError(
        isPromiseEvt ? (evt as PromiseRejectionEvent).reason
        : isErrorEvt ? (evt as ErrorEvent).error
        : undefined
      )

      const text = `${name || ''} ${message || ''}`
      const looksLikeChunkError =
        (name === 'ChunkLoadError') || /Loading chunk .* failed/i.test(text)

      if (looksLikeChunkError) {
        try {
          const already = sessionStorage.getItem(key) === '1'
          if (!already) {
            sessionStorage.setItem(key, '1')
            window.location.reload()
          }
        } catch {
          window.location.reload()
        }
      }
    }

    window.addEventListener('error', handler)
    window.addEventListener('unhandledrejection', handler as EventListener)
    return () => {
      window.removeEventListener('error', handler)
      window.removeEventListener('unhandledrejection', handler as EventListener)
    }
  }, [])

  return null
}


