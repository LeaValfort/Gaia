'use client'

import { useCallback, useEffect, useState } from 'react'
import { ContenuVueProche } from '@/components/proches/ContenuVueProche'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { interpreterReponseRpcProche } from '@/lib/proches'
import { fetchProchesRecusClient } from '@/lib/proches-page-client'
import { supabase } from '@/lib/supabase'
import type { ProcheConnection, ProchePartageData } from '@/types'
import { cn } from '@/lib/utils'

type Ent = { c: ProcheConnection; resume: string }

export function VueProchesConnectes({ userId: _userId }: { userId: string }) {
  const [list, setList] = useState<Ent[]>([])
  const [sel, setSel] = useState<ProcheConnection | null>(null)
  const [dataModal, setDataModal] = useState<ProchePartageData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const conns = await fetchProchesRecusClient()
    const enriched: Ent[] = await Promise.all(
      conns.map(async (c) => {
        const { data } = await supabase.rpc('fn_proches_public_view', { p_code: c.invite_code })
        const { partage } = interpreterReponseRpcProche(data)
        if (!partage) return { c, resume: '' }
        const ph = partage.phase ? String(partage.phase) : '—'
        const e = partage.energie != null ? `${partage.energie}/5` : '—'
        const h = partage.humeur?.trim() ? partage.humeur.slice(0, 28) : '—'
        return { c, resume: `${ph} · ☀ ${e} · ${h}` }
      })
    )
    setList(enriched)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function open(c: ProcheConnection) {
    setSel(c)
    const { data, error } = await supabase.rpc('fn_proches_public_view', { p_code: c.invite_code })
    if (error) {
      setDataModal(null)
      return
    }
    const { partage } = interpreterReponseRpcProche(data)
    setDataModal(partage)
  }

  if (loading) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400 py-2">Chargement…</p>
  }

  if (list.length === 0) {
    return (
      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        Personne ne partage encore son cycle avec toi ici. Quand quelqu’un accepte une invitation et que tu es liée·e comme
        proche, son aperçu apparaîtra dans cette colonne.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {list.map(({ c, resume }) => (
        <button
          key={c.id}
          type="button"
          onClick={() => void open(c)}
          className={cn(
            'w-full text-left rounded-xl border border-violet-200/80 dark:border-violet-900/50',
            'bg-white/90 dark:bg-neutral-900/60 p-3 hover:border-violet-400 transition-colors'
          )}
        >
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {c.owner_display_name?.trim() || 'Proche'}
          </p>
          {resume ? (
            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">{resume}</p>
          ) : null}
        </button>
      ))}
      <Dialog open={!!sel} onOpenChange={(o) => !o && (setSel(null), setDataModal(null))}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 border-0 bg-transparent shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Vue partagée</DialogTitle>
          </DialogHeader>
          {sel && dataModal ? (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950">
              <ContenuVueProche
                connection={sel}
                partageData={dataModal}
                largeurContenu="plein"
                compact
              />
            </div>
          ) : sel ? (
            <p className="text-sm text-neutral-500 p-4 bg-white dark:bg-neutral-900 rounded-xl">Aucune donnée.</p>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
