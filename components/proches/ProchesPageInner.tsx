'use client'

import { useCallback, useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DonneesRecuesSection } from '@/components/proches/DonneesRecuesSection'
import { MesPartagesSection } from '@/components/proches/MesPartagesSection'
import { Nav } from '@/components/shared/Nav'
import { Button } from '@/components/ui/button'
import { fetchCycleContextProches, fetchProchesConnectionsClient } from '@/lib/proches-page-client'
import type { Phase, ProcheConnection } from '@/types'

export function ProchesPageInner() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connections, setConnections] = useState<ProcheConnection[]>([])
  const [phase, setPhase] = useState<Phase>('folliculaire')
  const [sansCycle, setSansCycle] = useState(false)
  const [prenom, setPrenom] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const ctx = await fetchCycleContextProches()
      if (!ctx) {
        router.replace('/login')
        return
      }
      setPrenom(ctx.prenom)
      setPhase(ctx.phase)
      setSansCycle(ctx.sansCycle)
      const conns = await fetchProchesConnectionsClient()
      setConnections(conns)
    } catch {
      setError('Impossible de charger la page Proches.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  const navPhase: Phase | null = sansCycle ? null : phase

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950 flex items-center justify-center text-sm text-muted-foreground">
        Chargement…
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
        <Nav phase={navPhase} sansCycle={sansCycle} prenom={prenom} />
        <div className="mx-auto max-w-lg px-4 py-12 text-center sm:px-6">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Button type="button" className="mt-4" onClick={() => void load()}>
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav phase={navPhase} sansCycle={sansCycle} prenom={prenom} />
      <div className="mx-auto max-w-lg px-4 py-6 pb-24 sm:px-6">
        <header className="mb-6 flex items-center gap-2">
          <Heart className="size-6 text-rose-500 dark:text-rose-400" aria-hidden />
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Proches</h1>
        </header>

        <DonneesRecuesSection />
        <MesPartagesSection connections={connections} onRefresh={() => void load()} />
      </div>
    </div>
  )
}
