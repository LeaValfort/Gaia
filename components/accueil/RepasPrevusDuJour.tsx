'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, UtensilsCrossed } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { upsertDailyMealIntake } from '@/lib/db/dailyMealIntake'
import { LIBELLES_REPAS_COURTS } from '@/lib/alimentation/repas-prevus'
import { supabase } from '@/lib/supabase'
import type { RepasPrevu, TypeRepas } from '@/types'

interface RepasPrevusDuJourProps {
  userId: string
  date: string
  repas: RepasPrevu[]
  /** Créneaux déjà renseignés dans le journal du jour (calories > 0). */
  dejaNotes: TypeRepas[]
}

/** Accueil : repas prévus au planning aujourd'hui, à cocher comme mangés (ajoutés au journal). */
export function RepasPrevusDuJour({ userId, date, repas, dejaNotes }: RepasPrevusDuJourProps) {
  const router = useRouter()
  const [envoi, setEnvoi] = useState<TypeRepas | null>(null)
  if (!repas.length) return null

  async function mange(r: RepasPrevu) {
    setEnvoi(r.type_repas)
    const res = await upsertDailyMealIntake(supabase, userId, {
      date,
      type_repas: r.type_repas,
      quantite_realisee: 1,
      quantite_cible: 1,
      calories: r.calories,
      proteines: r.proteines,
      glucides: r.glucides,
      lipides: r.lipides,
      nom_personnalise: r.recette_id ? null : r.nom,
      source_recipe_id: r.recette_id,
      objectif_calories: null,
      objectif_proteines: null,
      objectif_glucides: null,
      objectif_lipides: null,
    })
    setEnvoi(null)
    if (!res.ok) {
      toast.error(res.message ?? 'Enregistrement impossible')
      return
    }
    toast.success('Ajouté à ton journal du jour')
    router.refresh()
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-amber-900/50 dark:bg-neutral-900">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
        <UtensilsCrossed className="size-4 text-amber-600" aria-hidden /> Au menu aujourd’hui
      </h2>
      <ul className="space-y-1.5">
        {repas.map((r) => {
          const note = dejaNotes.includes(r.type_repas)
          return (
            <li key={r.type_repas} className="flex items-center gap-2 text-sm">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">{LIBELLES_REPAS_COURTS[r.type_repas]}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-neutral-800 dark:text-neutral-200">{r.nom}</span>
                <span className="text-xs text-muted-foreground">{r.calories} kcal</span>
              </span>
              <Button
                type="button"
                size="sm"
                variant={note ? 'ghost' : 'outline'}
                disabled={envoi === r.type_repas}
                onClick={() => void mange(r)}
                className="shrink-0"
              >
                {note ? <Check className="size-4 text-green-600" aria-label="Déjà noté" /> : envoi === r.type_repas ? '…' : 'Mangé'}
              </Button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
