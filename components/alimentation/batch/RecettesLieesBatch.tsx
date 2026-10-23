'use client'

import { useState } from 'react'
import { Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { insertRecetteGeneree } from '@/lib/db/recettes'
import { demanderRecettesLiees } from '@/lib/ia/batch-client'
import type { Phase, Recipe, RecetteGeneree } from '@/types'

interface RecettesLieesBatchProps {
  userId: string
  phase: Phase
  /** Recettes enregistrées : ajoutées à la sélection du batch. */
  onEnregistrees: (recettes: Recipe[]) => void
}

/** Gaia propose 4 recettes qui partagent des bases communes, à enregistrer en un clic. */
export function RecettesLieesBatch({ userId, phase, onEnregistrees }: RecettesLieesBatchProps) {
  const [envie, setEnvie] = useState('')
  const [idees, setIdees] = useState<RecetteGeneree[]>([])
  const [ch, setCh] = useState<'idees' | 'enregistrement' | null>(null)

  async function proposer() {
    setCh('idees')
    try {
      setIdees(await demanderRecettesLiees({ phase, envie: envie.trim() }))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Génération impossible')
    } finally {
      setCh(null)
    }
  }

  async function enregistrer() {
    setCh('enregistrement')
    const creees = (await Promise.all(idees.map((r) => insertRecetteGeneree(supabase, userId, r)))).filter((r): r is Recipe => !!r)
    setCh(null)
    if (!creees.length) {
      toast.error('Enregistrement impossible')
      return
    }
    toast.success(`${creees.length} recettes enregistrées`)
    setIdees([])
    onEnregistrees(creees)
  }

  return (
    <section className="space-y-2 rounded-xl border border-dashed border-amber-300 p-3 dark:border-amber-800">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
        <Link2 className="size-4 text-amber-600" aria-hidden /> Recettes liées par Gaia
      </h3>
      <p className="text-xs text-muted-foreground">4 recettes qui partagent des bases (céréale, légumes, protéine) cuisinées une seule fois.</p>
      <div className="flex gap-2">
        <Input value={envie} onChange={(e) => setEnvie(e.target.value)} placeholder="Envie ? (optionnel, ex. poulet, végétarien)" className="h-9" />
        <Button type="button" variant="outline" size="sm" onClick={() => void proposer()} disabled={!!ch} className="h-9 shrink-0">
          {ch === 'idees' ? '…' : 'Proposer'}
        </Button>
      </div>
      {idees.length ? (
        <>
          <ul className="space-y-1">
            {idees.map((r) => (
              <li key={r.nom} className="rounded-lg bg-amber-50/70 px-3 py-2 text-sm dark:bg-amber-950/30">
                <span className="font-medium">{r.nom}</span>
                <span className="block text-xs text-muted-foreground">
                  {r.portions} portions{r.calories ? ` · ${r.calories} kcal/portion` : ''} · {r.temps_min} min
                </span>
              </li>
            ))}
          </ul>
          <Button type="button" size="sm" onClick={() => void enregistrer()} disabled={!!ch} className="w-full">
            {ch === 'enregistrement' ? 'Enregistrement…' : 'Enregistrer ces 4 recettes'}
          </Button>
        </>
      ) : null}
    </section>
  )
}
