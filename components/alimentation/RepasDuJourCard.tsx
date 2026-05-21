'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getDailyMealIntakesJour } from '@/lib/db/dailyMealIntake'
import { fusionIntakesJour, ORDRE_TYPES_REPAS } from '@/lib/recapManuel'
import { PanneauRepasJour } from '@/components/alimentation/PanneauRepasJour'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { DailyMealIntake, TypeJournee, TypeRepas } from '@/types'

const LIB_REPAS: Record<TypeRepas, { emoji: string; label: string }> = {
  'petit-dej': { emoji: '🌅', label: 'Petit-déj' },
  dejeuner: { emoji: '🌞', label: 'Déjeuner' },
  collation: { emoji: '🍎', label: 'Collation' },
  diner: { emoji: '🌙', label: 'Dîner' },
}

interface RepasDuJourCardProps {
  userId: string
  date: string
  typeJournee: TypeJournee
}

export function RepasDuJourCard({ userId, date, typeJournee }: RepasDuJourCardProps) {
  const [lignes, setLignes] = useState<DailyMealIntake[]>([])
  const [chargement, setChargement] = useState(true)
  const [creneauOuvert, setCreneauOuvert] = useState<TypeRepas | null>(null)

  const charger = useCallback(async () => {
    setChargement(true)
    const rows = await getDailyMealIntakesJour(supabase, userId, date)
    setLignes(fusionIntakesJour(date, rows))
    setChargement(false)
  }, [userId, date])

  useEffect(() => {
    void charger()
  }, [charger])

  if (chargement) {
    return <Skeleton className="h-44 w-full rounded-xl" />
  }

  return (
    <>
      <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          Repas du jour
        </h2>
        <ul className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
          {ORDRE_TYPES_REPAS.map((type) => {
            const intake = lignes.find((l) => l.type_repas === type)
            if (!intake) return null
            const { emoji, label } = LIB_REPAS[type]
            const rempli = intake.calories > 0

            return (
              <li key={type}>
                <button
                  type="button"
                  onClick={() => setCreneauOuvert(type)}
                  className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {emoji}
                  </span>
                  <span className="min-w-0 flex-1 font-medium text-neutral-900 dark:text-neutral-50">
                    {label}
                    {rempli ? (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {intake.calories} kcal
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs text-muted-foreground">+ Ajouter</span>
                  <ChevronRight className="size-4 shrink-0 text-neutral-400" aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <Dialog open={creneauOuvert != null} onOpenChange={(o) => !o && setCreneauOuvert(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {creneauOuvert ? LIB_REPAS[creneauOuvert].emoji : ''}{' '}
              {creneauOuvert ? LIB_REPAS[creneauOuvert].label : 'Repas'}
            </DialogTitle>
          </DialogHeader>
          {creneauOuvert && intakeFor(lignes, creneauOuvert) ? (
            <PanneauRepasJour
              userId={userId}
              intake={intakeFor(lignes, creneauOuvert)!}
              typeJournee={typeJournee}
              onEnregistre={() => {
                void charger()
                setCreneauOuvert(null)
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function intakeFor(lignes: DailyMealIntake[], type: TypeRepas): DailyMealIntake | undefined {
  return lignes.find((l) => l.type_repas === type)
}
