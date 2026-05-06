'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { ContenuVueProche } from '@/components/proches/ContenuVueProche'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { interpreterReponseRpcProche } from '@/lib/proches'
import { fetchProchesRecusClient } from '@/lib/proches-page-client'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { ProcheConnection, ProchePartageData } from '@/types'
import { cn } from '@/lib/utils'

type Ent = { c: ProcheConnection; resume: string }
const CODE_INVITATION_REGEX = /^GAIA-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/

export function VueProchesConnectes({ userId: _userId }: { userId: string }) {
  const [list, setList] = useState<Ent[]>([])
  const [openedId, setOpenedId] = useState<string | null>(null)
  const [addCodeOpen, setAddCodeOpen] = useState(false)
  const [details, setDetails] = useState<Record<string, ProchePartageData | null>>({})
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [envoiCode, setEnvoiCode] = useState(false)

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

  async function envoyerCode() {
    const nettoye = code.trim().toUpperCase()
    if (!nettoye) return
    if (!CODE_INVITATION_REGEX.test(nettoye)) {
      toast.error("Format invalide. Utilise GAIA-XXXX (ex: GAIA-4X7K).")
      return
    }
    setEnvoiCode(true)
    try {
      const res = await fetch('/api/proches/connect', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: nettoye }),
      })
      const j = (await res.json()) as { success?: boolean; error?: string; already?: boolean; requested?: boolean }
      if (!res.ok || !j.success) {
        toast.error(j.error || 'Demande impossible')
        return
      }
      if (j.already) {
        toast.success('Tu es déjà liée à ce code.')
      } else if (j.requested) {
        toast.success('Demande envoyée !')
      } else {
        toast.success('Demande envoyée !')
      }
      setCode('')
      await load()
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setEnvoiCode(false)
    }
  }

  async function chargerDetail(c: ProcheConnection) {
    if (details[c.id] !== undefined) return
    setLoadingDetailId(c.id)
    const { data, error } = await supabase.rpc('fn_proches_public_view', { p_code: c.invite_code })
    if (error) {
      setDetails((prev) => ({ ...prev, [c.id]: null }))
      setLoadingDetailId((prev) => (prev === c.id ? null : prev))
      return
    }
    const { partage } = interpreterReponseRpcProche(data)
    setDetails((prev) => ({ ...prev, [c.id]: partage }))
    setLoadingDetailId((prev) => (prev === c.id ? null : prev))
  }

  return (
    <div className="space-y-2">
      <Collapsible
        open={addCodeOpen}
        onOpenChange={setAddCodeOpen}
        className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/50 overflow-hidden"
      >
        <CollapsibleTrigger
          className={cn(
            'w-full p-3 text-left flex items-center justify-between gap-2',
            'hover:bg-violet-50/60 dark:hover:bg-violet-950/20 transition-colors'
          )}
        >
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">Ajouter un code</p>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-300 transition-transform',
              addCodeOpen && 'rotate-180'
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-neutral-200 dark:border-neutral-700 p-3 space-y-2">
          <p className="text-xs text-neutral-600 dark:text-neutral-300">Entrer un code d&apos;invitation</p>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="GAIA-4X7K"
              className="h-8 text-xs"
            />
            <Button
              type="button"
              size="sm"
              className="h-8 bg-violet-600 text-white hover:bg-violet-700"
              disabled={envoiCode || !code.trim()}
              onClick={() => void envoyerCode()}
            >
              {envoiCode ? 'Envoi…' : 'Rejoindre'}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
      {loading ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 py-2">Chargement…</p>
      ) : null}
      {!loading && list.length === 0 ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Personne ne partage encore son cycle avec toi ici. Quand quelqu’un accepte ta demande, son aperçu apparaîtra dans
          cette colonne.
        </p>
      ) : null}
      {!loading &&
        list.map(({ c, resume }) => {
          const ouvert = openedId === c.id
          const detail = details[c.id]
          const detailEnChargement = loadingDetailId === c.id
          return (
            <Collapsible
              key={c.id}
              open={ouvert}
              onOpenChange={(next) => {
                if (!next) {
                  setOpenedId(null)
                  return
                }
                setOpenedId(c.id)
                void chargerDetail(c)
              }}
              className={cn(
                'rounded-xl border border-violet-200/80 dark:border-violet-900/50',
                'bg-white/90 dark:bg-neutral-900/60 overflow-hidden'
              )}
            >
              <CollapsibleTrigger
                className={cn(
                  'w-full text-left p-3 hover:bg-violet-50/60 dark:hover:bg-violet-950/20 transition-colors',
                  'flex items-start justify-between gap-3'
                )}
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {c.owner_display_name?.trim() || 'Proche'}
                  </p>
                  {resume ? (
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">{resume}</p>
                  ) : null}
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 mt-0.5 shrink-0 text-neutral-500 dark:text-neutral-300 transition-transform',
                    ouvert && 'rotate-180'
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t border-violet-200/70 dark:border-violet-900/40">
                {detailEnChargement ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 p-4">Chargement…</p>
                ) : detail ? (
                  <ContenuVueProche connection={c} partageData={detail} largeurContenu="plein" compact />
                ) : (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 p-4">Aucune donnée.</p>
                )}
              </CollapsibleContent>
            </Collapsible>
          )
        })}
    </div>
  )
}
