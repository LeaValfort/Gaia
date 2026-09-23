'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { CarteDonneeRecue } from '@/components/proches/CarteDonneeRecue'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { interpreterReponseRpcProche } from '@/lib/proches'
import { fetchProchesRecusClient } from '@/lib/proches-page-client'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { ProcheConnection, ProchePartageData } from '@/types'

type EntreeRecue = {
  connection: ProcheConnection
  partage: ProchePartageData | null
}

const CODE_INVITATION_REGEX = /^GAIA-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/

export function DonneesRecuesSection() {
  const [entrees, setEntrees] = useState<EntreeRecue[]>([])
  const [details, setDetails] = useState<Record<string, ProchePartageData | null>>({})
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Formulaire "Ajouter un code" (Chantier Proches, restauré le 23/09 : cette section
  // affichait les proches déjà connectés mais avait perdu le formulaire pour en ajouter
  // un nouveau, présent uniquement dans l'ancien composant VueProchesConnectes.tsx,
  // devenu orphelin — voir plan du projet).
  const [codeOuvert, setCodeOuvert] = useState(false)
  const [code, setCode] = useState('')
  const [envoiCode, setEnvoiCode] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const conns = await fetchProchesRecusClient()
      const enriched = await Promise.all(
        conns.map(async (c) => {
          const { data, error: rpcError } = await supabase.rpc('fn_proches_public_view', {
            p_code: c.invite_code,
          })
          if (rpcError) return { connection: c, partage: null }
          const { partage } = interpreterReponseRpcProche(data)
          return { connection: c, partage }
        })
      )
      setEntrees(enriched)
    } catch {
      setError('Impossible de charger les données reçues.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function chargerDetail(c: ProcheConnection) {
    if (details[c.id] !== undefined) return
    setLoadingDetailId(c.id)
    try {
      const { data, error: rpcError } = await supabase.rpc('fn_proches_public_view', {
        p_code: c.invite_code,
      })
      if (rpcError) {
        setDetails((prev) => ({ ...prev, [c.id]: null }))
        return
      }
      const { partage } = interpreterReponseRpcProche(data)
      setDetails((prev) => ({ ...prev, [c.id]: partage }))
    } finally {
      setLoadingDetailId((prev) => (prev === c.id ? null : prev))
    }
  }

  async function envoyerCode() {
    const nettoye = code.trim().toUpperCase()
    if (!nettoye) return
    if (!CODE_INVITATION_REGEX.test(nettoye)) {
      toast.error('Format invalide. Utilise GAIA-XXXX (ex: GAIA-4X7K).')
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
      const j = (await res.json()) as { success?: boolean; error?: string; already?: boolean }
      if (!res.ok || !j.success) {
        toast.error(j.error || 'Demande impossible')
        return
      }
      toast.success(j.already ? 'Tu es déjà liée à ce code.' : 'Demande envoyée !')
      setCode('')
      setCodeOuvert(false)
      await load()
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setEnvoiCode(false)
    }
  }

  return (
    <section className="mb-8 space-y-3" aria-labelledby="donnees-recues-titre">
      <h2 id="donnees-recues-titre" className="sr-only">
        Données reçues
      </h2>

      <Collapsible
        open={codeOuvert}
        onOpenChange={setCodeOuvert}
        className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
      >
        <CollapsibleTrigger
          className={cn(
            'w-full p-3 text-left flex items-center justify-between gap-2',
            'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors'
          )}
        >
          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">Ajouter un code</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400 transition-transform',
              codeOuvert && 'rotate-180'
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Entre le code d&apos;invitation que ton proche t&apos;a envoyé pour suivre son cycle.
          </p>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="GAIA-4X7K"
              className="h-9 text-sm"
              aria-label="Code d'invitation"
            />
            <Button
              type="button"
              size="sm"
              className="h-9 shrink-0"
              disabled={envoiCode || !code.trim()}
              onClick={() => void envoyerCode()}
            >
              {envoiCode ? 'Envoi…' : 'Rejoindre'}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {loading ? (
        <p className="text-sm text-muted-foreground py-2">Chargement…</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400 py-2">{error}</p>
      ) : entrees.length === 0 ? (
        <p className="text-sm text-muted-foreground">Personne ne partage encore ses données avec toi.</p>
      ) : (
        <div className="space-y-3">
          {entrees.map(({ connection, partage }) => {
            const detail = details[connection.id] ?? partage
            return (
              <CarteDonneeRecue
                key={connection.id}
                connection={connection}
                partage={detail}
                detailEnChargement={loadingDetailId === connection.id}
                onExpand={() => void chargerDetail(connection)}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
