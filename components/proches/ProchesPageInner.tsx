'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormulaireInvitation } from '@/components/proches/FormulaireInvitation'
import { ProchesLayout } from '@/components/proches/ProchesLayout'
import {
  fetchCycleContextProches,
  fetchJournalAujourdhui,
  fetchProchesConnectionsClient,
} from '@/lib/proches-page-client'
import type { JournalAujourdhui } from '@/lib/proches-page-client'
import type { Phase, ProcheConnection } from '@/types'

const journalVide: JournalAujourdhui = {
  energie: null,
  douleur: null,
  humeur: null,
  libido: null,
  symptomes: null,
}

export function ProchesPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [connections, setConnections] = useState<ProcheConnection[]>([])
  const [procheActif, setProcheActif] = useState<string | null>(null)
  const [modale, setModale] = useState(false)
  const [phase, setPhase] = useState<Phase>('folliculaire')
  const [sansCycle, setSansCycle] = useState(false)
  const [prenom, setPrenom] = useState<string | null>(null)
  const [jourDuCycle, setJourDuCycle] = useState(1)
  const [journal, setJournal] = useState<JournalAujourdhui>(journalVide)
  const [prochaineCyclePredite, setProchaineCyclePredite] = useState<string | null>(null)
  const load = useCallback(async () => {
    const ctx = await fetchCycleContextProches()
    if (!ctx) {
      setLoading(false)
      router.replace('/login')
      return
    }
    setPrenom(ctx.prenom)
    setPhase(ctx.phase)
    setSansCycle(ctx.sansCycle)
    setJourDuCycle(ctx.jourDuCycle)
    setProchaineCyclePredite(ctx.prochaineCyclePredite)
    const [conns, j] = await Promise.all([
      fetchProchesConnectionsClient(),
      fetchJournalAujourdhui(ctx.userId),
    ])
    setConnections(conns)
    setJournal(j)
    setLoading(false)
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (connections.length === 0) {
      setProcheActif(null)
      return
    }
    const code = searchParams.get('code')
    if (code) {
      const m = connections.find((c) => c.invite_code === code)
      if (m) {
        setProcheActif(m.id)
        router.replace('/proches', { scroll: false })
        return
      }
    }
    setProcheActif((prev) => {
      if (prev && connections.some((c) => c.id === prev)) return prev
      const next = connections.find((c) => c.status === 'active') ?? connections[0]
      return next?.id ?? null
    })
  }, [connections, searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950 flex items-center justify-center text-sm text-neutral-500">
        Chargement…
      </div>
    )
  }

  return (
    <>
      <FormulaireInvitation
        open={modale}
        onOpenChange={setModale}
        onInvite={(c) => {
          setModale(false)
          setProcheActif(c.id)
          void load()
        }}
      />
      <ProchesLayout
        phase={phase}
        sansCycle={sansCycle}
        prenom={prenom}
        connections={connections}
        procheActif={procheActif}
        onSelectProche={setProcheActif}
        onInviter={() => setModale(true)}
        onRefresh={() => void load()}
        journal={journal}
        jourDuCycle={jourDuCycle}
        prochaineCyclePredite={prochaineCyclePredite}
      />
    </>
  )
}
