'use client'

import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Phase, TypeJournee, MealPlan, MealPlanComplet, BudgetMacroJour, Recipe } from '@/types'
import { PHASE_STYLES } from '@/lib/nutrition'
import SlotRepas from './SlotRepas'
import { OPTIONS_PETIT_DEJ } from '@/lib/data/petitsdejeuners'

const LABELS_PHASE: Record<Phase, string> = {
  menstruation: 'Règles',
  folliculaire: 'Follic.',
  ovulation:    'Ovul.',
  luteale:      'Lutéale',
}

const LABELS_JOURNEE: Record<TypeJournee, string> = {
  sport:  '🏋️',
  yoga:   '🧘',
  repos:  '😌',
  regles: '🩸',
}

interface JourPlanSemaineProps {
  date: string
  phase: Phase
  typeJournee: TypeJournee
  plans: MealPlanComplet[]
  budget: BudgetMacroJour
  recettesDisponibles: Recipe[]
  onUpdate: (plan: Omit<MealPlan, 'id' | 'user_id' | 'created_at'>) => void
  onDelete: (planId: string) => void
}

const TYPES_REPAS = ['petit-dej', 'dejeuner', 'collation', 'diner'] as const

export default function JourPlanSemaine({
  date, phase, typeJournee, plans, budget, recettesDisponibles, onUpdate, onDelete,
}: JourPlanSemaineProps) {
  const styles = PHASE_STYLES[phase]
  const dateObj = parseISO(date)
  const jourLabel  = format(dateObj, 'EEEE', { locale: fr })
  const dateLabel  = format(dateObj, 'd MMM', { locale: fr })

  // Couleur de la jauge selon % atteint
  const couleurJauge = budget.pourcentageAtteint < 50
    ? 'text-neutral-400'
    : budget.pourcentageAtteint < 85
    ? 'text-amber-500'
    : 'text-emerald-500'

  return (
    <div className="flex flex-col gap-2 w-40 lg:w-auto shrink-0">
      {/* En-tête du jour */}
      <div className={`rounded-xl p-2 text-center ${styles.bg}`}>
        <p className="text-xs font-semibold capitalize text-neutral-700 dark:text-neutral-200">
          {jourLabel}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{dateLabel}</p>
        <div className="flex justify-center gap-1 mt-1">
          <Badge className={`text-xs px-1.5 py-0 ${styles.pill}`}>
            {LABELS_PHASE[phase]}
          </Badge>
          <span className="text-xs">{LABELS_JOURNEE[typeJournee]}</span>
        </div>
      </div>

      {/* Jauge macros */}
      <div className="px-1">
        <Progress value={budget.pourcentageAtteint} className="h-1.5" />
        <p className={`text-xs text-right mt-0.5 ${couleurJauge}`}>
          {budget.totalCalories} kcal
        </p>
      </div>

      {/* Slots repas */}
      {TYPES_REPAS.map((typeRepas) => {
        const planDuSlot = plans.find((p) => p.type_repas === typeRepas) ?? null
        return (
          <SlotRepas
            key={typeRepas}
            typeRepas={typeRepas}
            plan={planDuSlot}
            recettesDisponibles={recettesDisponibles}
            optionsPetitDej={OPTIONS_PETIT_DEJ}
            date={date}
            weekStart={budget.date.slice(0, 10)}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        )
      })}
    </div>
  )
}
