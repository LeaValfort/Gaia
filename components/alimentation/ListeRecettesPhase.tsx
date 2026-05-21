'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ConseilPhaseAlimentation } from '@/components/alimentation/ConseilPhaseAlimentation'
import { Skeleton } from '@/components/ui/skeleton'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import type { Phase, RecetteSpoonacular, TypeJournee } from '@/types'

const EMOJI_PHASE: Record<Phase, string> = {
  menstruation: '🩸',
  folliculaire: '🌱',
  ovulation: '🌸',
  luteale: '🍂',
}

interface ListeRecettesPhaseProps {
  phase: Phase
  typeJournee: TypeJournee
  allergies: string[]
  tempsMax: number
  sansSuiviCycle?: boolean
}

export function ListeRecettesPhase({
  phase,
  typeJournee,
  allergies,
  tempsMax,
  sansSuiviCycle,
}: ListeRecettesPhaseProps) {
  const [offset, setOffset] = useState(0)
  const [recettes, setRecettes] = useState<RecetteSpoonacular[]>([])
  const [chargement, setChargement] = useState(true)
  const [chargementPlus, setChargementPlus] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  async function chargerRecettes(nextOffset: number, append: boolean) {
    if (append) setChargementPlus(true)
    else setChargement(true)
    setErreur(null)
    try {
      const params = new URLSearchParams({
        typeJournee,
        allergies: allergies.join(','),
        tempsMax: String(tempsMax),
        phase,
        offset: String(nextOffset),
      })
      const rep = await fetch(`/api/spoonacular?${params}`)
      if (!rep.ok) throw new Error('Impossible de charger les recettes.')
      const { recettes: data, erreur: err } = (await rep.json()) as {
        recettes?: RecetteSpoonacular[]
        erreur?: string
      }
      if (err) throw new Error(err)
      const batch = (data ?? []).slice(0, 8)
      setRecettes((prev) => (append ? [...prev, ...batch] : batch))
      setOffset(nextOffset)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur de chargement.')
      if (!append) setRecettes([])
    } finally {
      setChargement(false)
      setChargementPlus(false)
    }
  }

  useEffect(() => {
    void chargerRecettes(0, false)
  }, [phase, typeJournee, allergies, tempsMax])

  return (
    <div className="flex flex-col gap-4">
      {!sansSuiviCycle ? <ConseilPhaseAlimentation phase={phase} /> : null}

      {erreur ? (
        <p className="text-sm text-muted-foreground">{erreur}</p>
      ) : null}

      {chargement ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : recettes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune recette trouvée pour le moment.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {recettes.map((r) => (
            <li key={r.id}>
              <Link
                href={`/alimentation/recette/${r.id}`}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:bg-neutral-900"
              >
                <span className="text-xl leading-none" aria-hidden>
                  🍽️
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-neutral-900 dark:text-neutral-50">
                    {r.titre}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
                      {EMOJI_PHASE[phase]} {PHASES_DESIGN[phase].label}
                    </span>
                    <span>{r.tempsMin} min</span>
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-neutral-400" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={chargementPlus}
        onClick={() => void chargerRecettes(offset + 8, true)}
        className="text-sm text-muted-foreground transition-colors hover:text-neutral-900 disabled:opacity-50 dark:hover:text-neutral-200"
      >
        {chargementPlus ? 'Chargement…' : 'Voir plus de recettes →'}
      </button>
    </div>
  )
}
