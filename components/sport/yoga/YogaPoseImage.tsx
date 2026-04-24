'use client'

import { useEffect, useState } from 'react'
import { nomPosePourApi } from '@/lib/data/yogaPoseApiName'

function extractUrl(d: unknown): string | null {
  if (Array.isArray(d) && d[0] && typeof d[0] === 'object' && d[0] !== null && 'url_png' in d[0]) {
    const u = (d[0] as { url_png?: string }).url_png
    return typeof u === 'string' ? u : null
  }
  if (d && typeof d === 'object' && 'url_png' in d) {
    const u = (d as { url_png?: string }).url_png
    return typeof u === 'string' ? u : null
  }
  return null
}

export function YogaPoseImage({ nomFr }: { nomFr: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [attente, setAttente] = useState(true)
  useEffect(() => {
    const en = nomPosePourApi(nomFr)
    let c = true
    setUrl(null)
    setAttente(true)
    fetch(`/api/yoga?name=${encodeURIComponent(en)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!c || !data) return
        const u = extractUrl(data)
        if (u) setUrl(u)
      })
      .catch(() => {})
      .finally(() => {
        if (c) setAttente(false)
      })
    return () => {
      c = false
    }
  }, [nomFr])
  if (attente) {
    return <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
  }
  if (!url) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-violet-100/80 text-3xl dark:bg-neutral-800">
        🧘
      </div>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" onError={() => setUrl(null)} />
}
