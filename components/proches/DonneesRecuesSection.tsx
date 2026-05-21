'use client'

import { useCallback, useEffect, useState } from 'react'
import { CarteDonneeRecue } from '@/components/proches/CarteDonneeRecue'
import { interpreterReponseRpcProche } from '@/lib/proches'
import { fetchProchesRecusClient } from '@/lib/proches-page-client'
import { supabase } from '@/lib/supabase'
import type { ProcheConnection, ProchePartageData } from '@/types'

type EntreeRecue = {
  connection: ProcheConnection
  partage: ProchePartageData | null
}

export function DonneesRecuesSection() {
  const [entrees, setEntrees] = useState<EntreeRecue[]>([])
  const [details, setDetails] = useState<Record<string, ProchePartageData | null>>({})
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <section className="mb-8" aria-labelledby="donnees-recues-titre">
      <h2 id="donnees-recues-titre" className="sr-only">
        Données reçues
      </h2>

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
