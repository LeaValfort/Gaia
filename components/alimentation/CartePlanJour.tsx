'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Phase, TypeJournee, MealPlan, MealPlanComplet, BudgetMacroJour, Recipe, OptionPetitDej } from '@/types'
import { PHASE_STYLES, MACROS_JOURNEE } from '@/lib/nutrition'
import SlotRepas from './SlotRepas'

const LABELS_PHASE: Record<Phase, string> = {
  menstruation: 'Règles 🩸', folliculaire: 'Folliculaire 🌱',
  ovulation: 'Ovulation 🌸', luteale: 'Lutéale 🍂',
}
const LABELS_JOURNEE: Record<TypeJournee, string> = {
  sport: '🏋️ Sport', yoga: '🧘 Yoga', repos: '😌 Repos', regles: '🩸 Règles',
}

interface CartePlanJourProps {
  date: string
  weekStart: string
  phase: Phase
  typeJournee: TypeJournee
  sansSuiviCycle?: boolean
  plans: MealPlanComplet[]
  budget: BudgetMacroJour
  recettesDisponibles: Recipe[]
  optionsPetitDej: OptionPetitDej[]
  onUpdate: (plan: Omit<MealPlan, 'id' | 'user_id' | 'created_at'>) => void
  onDelete: (planId: string) => void
}

export default function CartePlanJour({
  date,
  weekStart,
  phase,
  typeJournee,
  sansSuiviCycle,
  plans,
  budget,
  recettesDisponibles,
  optionsPetitDej,
  onUpdate,
  onDelete,
}: CartePlanJourProps) {
  const [etendu, setEtendu] = useState(false)
  const styles = sansSuiviCycle
    ? {
        border: 'border-emerald-200 dark:border-emerald-800',
        bg: 'bg-emerald-50/60 dark:bg-emerald-950/25',
        pill: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100',
      }
    : PHASE_STYLES[phase]
  const typeEffectif: TypeJournee =
    sansSuiviCycle ? typeJournee : phase === 'menstruation' ? 'regles' : typeJournee
  const cibles = MACROS_JOURNEE[typeEffectif]

  const planPd    = plans.find((p) => p.type_repas === 'petit-dej')  ?? null
  const planDej   = plans.find((p) => p.type_repas === 'dejeuner')   ?? null
  const planColl  = plans.find((p) => p.type_repas === 'collation')  ?? null
  const planDiner = plans.find((p) => p.type_repas === 'diner')      ?? null
  const nbRepasPlus = [planColl, planDiner].filter(Boolean).length

  return (
    <div className={`rounded-2xl border ${styles.border} bg-white dark:bg-neutral-900 overflow-hidden`}>
      {/* En-tête */}
      <div className={`flex items-center justify-between px-4 py-3 ${styles.bg}`}>
        <div>
          <p className="font-semibold text-neutral-800 dark:text-neutral-100 capitalize">
            {format(parseISO(date), 'EEEE d MMMM', { locale: fr })}
          </p>
          <div className="flex gap-2 mt-0.5 flex-wrap items-center">
            {sansSuiviCycle ? null : (
              <Badge className={`text-xs px-2 py-0 ${styles.pill}`}>{LABELS_PHASE[phase]}</Badge>
            )}
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{LABELS_JOURNEE[typeJournee]}</span>
          </div>
        </div>
        <div className="text-right text-xs text-neutral-500 dark:text-neutral-400">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">{cibles.kcal} kcal</p>
          <p>{cibles.proteines}g P · {cibles.glucides}g G</p>
        </div>
      </div>

      {/* Corps — petit-déj + déjeuner toujours visibles */}
      <div className="flex flex-col gap-3 p-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-neutral-400 mb-1">🌅 Petit-déj</p>
            <SlotRepas
              typeRepas="petit-dej"
              plan={planPd}
              recettesDisponibles={recettesDisponibles}
              optionsPetitDej={optionsPetitDej}
              date={date}
              weekStart={weekStart}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">☀️ Déjeuner</p>
            <SlotRepas
              typeRepas="dejeuner"
              plan={planDej}
              recettesDisponibles={recettesDisponibles}
              optionsPetitDej={optionsPetitDej}
              date={date}
              weekStart={weekStart}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          </div>
        </div>

        {/* Collation + Dîner — repliés par défaut */}
        {etendu && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <div>
              <p className="text-xs text-neutral-400 mb-1">🍎 Collation</p>
              <SlotRepas typeRepas="collation" plan={planColl} recettesDisponibles={recettesDisponibles} optionsPetitDej={optionsPetitDej} date={date} weekStart={weekStart} onUpdate={onUpdate} onDelete={onDelete} />
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">🌙 Dîner</p>
              <SlotRepas typeRepas="diner" plan={planDiner} recettesDisponibles={recettesDisponibles} optionsPetitDej={optionsPetitDej} date={date} weekStart={weekStart} onUpdate={onUpdate} onDelete={onDelete} />
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-neutral-400 hover:text-neutral-600 self-center"
          onClick={() => setEtendu(!etendu)}
        >
          {etendu ? <><ChevronUp size={12} className="mr-1" />Réduire</> : <><ChevronDown size={12} className="mr-1" />Collation + Dîner {nbRepasPlus > 0 && `(${nbRepasPlus})`}</>}
        </Button>
      </div>
    </div>
  )
}
