'use client'

import { useEffect, useState, useCallback } from 'react'
import { addDays, format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Sparkles, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { getMealPlanSemaine, upsertMealPlan, deleteMealPlan, getRecettesPourPlanning } from '@/lib/db/mealplan'
import { addShoppingItem } from '@/lib/db/courses'
import { getLundiSemaine, getTypeJournee } from '@/lib/nutrition'
import { getPhasePourDateCalendrier } from '@/lib/cycle'
import { calculerBudgetMacroJour, genererPlanAuto, extraireIngredientsSemaine } from '@/lib/mealplan'
import { devinerAssignation } from '@/lib/data/courses'
import { OPTIONS_PETIT_DEJ } from '@/lib/data/petitsdejeuners'
import type { CycleStats, MealPlan, MealPlanComplet, BudgetMacroJour, Phase, Recipe } from '@/types'
import CartePlanJour from './CartePlanJour'

interface PlanSemaineProps {
  userId: string
  weekStart: string
  sansSuiviCycle?: boolean
  /** Début du cycle courant (dernier en base ou préférence) — pour calculer la phase par jour */
  effectiveStart: string | null
  cycleLength: number
  stats: CycleStats | null
}

function phasePourDatePlan(
  dateIso: string,
  sansSuivi: boolean | undefined,
  effectiveStart: string | null,
  cycleLength: number,
  stats: CycleStats | null
): Phase {
  if (sansSuivi || !effectiveStart) return 'folliculaire'
  return getPhasePourDateCalendrier(dateIso, effectiveStart, cycleLength, stats)
}

export default function PlanSemaine({
  userId,
  weekStart: weekStartInitial,
  sansSuiviCycle,
  effectiveStart,
  cycleLength,
  stats,
}: PlanSemaineProps) {
  const [weekStart, setWeekStart] = useState(weekStartInitial)
  const [plans, setPlans]           = useState<MealPlan[]>([])
  const [recettes, setRecettes]     = useState<Recipe[]>([])
  const [chargement, setChargement] = useState(true)
  const [generant, setGenerant]     = useState(false)
  const [exportant, setExportant]   = useState(false)
  const [erreur, setErreur]         = useState<string | null>(null)

  const dates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(parseISO(weekStart), i), 'yyyy-MM-dd')
  )

  const charger = useCallback(async () => {
    setChargement(true); setErreur(null)
    try {
      const [p, r] = await Promise.all([
        getMealPlanSemaine(supabase, userId, weekStart),
        getRecettesPourPlanning(supabase, userId),
      ])
      setPlans(p); setRecettes(r)
    } catch { setErreur('Impossible de charger le planning.') }
    finally { setChargement(false) }
  }, [userId, weekStart, sansSuiviCycle, effectiveStart, cycleLength, stats])

  useEffect(() => { charger() }, [charger])

  const semainePrecedente = () => setWeekStart(getLundiSemaine(addDays(parseISO(weekStart), -7)))
  const semaineSuivante   = () => setWeekStart(getLundiSemaine(addDays(parseISO(weekStart),  7)))

  const plansComplets: MealPlanComplet[] = plans.map((p) => ({
    ...p,
    recette:  p.recette_id   ? recettes.find((r) => r.id === p.recette_id)   ?? null : null,
    petitDej: p.petit_dej_id ? OPTIONS_PETIT_DEJ.find((pd) => pd.id === p.petit_dej_id) ?? null : null,
  }))

  const budgets: BudgetMacroJour[] = dates.map((date) => {
    const pdPlan = plansComplets.find((p) => p.date === date && p.type_repas === 'petit-dej')
    const phaseDuJour = phasePourDatePlan(date, sansSuiviCycle, effectiveStart, cycleLength, stats)
    return calculerBudgetMacroJour(
      date,
      phaseDuJour,
      getTypeJournee(parseISO(date)),
      pdPlan?.petitDej ?? null,
      pdPlan?.portions ?? 1,
      { sansSuiviCycle: Boolean(sansSuiviCycle) }
    )
  })

  const handleUpdate = async (plan: Omit<MealPlan, 'id' | 'user_id' | 'created_at'>) => {
    await upsertMealPlan(supabase, userId, plan)
    await charger()
  }

  const handleDelete = async (planId: string) => {
    await deleteMealPlan(supabase, planId)
    setPlans((prev) => prev.filter((p) => p.id !== planId))
  }

  const handleGenerer = async () => {
    setGenerant(true)
    try {
      const phases = dates.map((d) => phasePourDatePlan(d, sansSuiviCycle, effectiveStart, cycleLength, stats))
      const types = dates.map((d) => getTypeJournee(parseISO(d)))
      const nouveaux = genererPlanAuto(dates, phases, types, recettes, OPTIONS_PETIT_DEJ, {
        sansSuiviCycle: Boolean(sansSuiviCycle),
      })
      for (const p of nouveaux) {
        await upsertMealPlan(supabase, userId, p)
      }
      await charger()
    } finally { setGenerant(false) }
  }

  const handleExportCourses = async () => {
    setExportant(true)
    try {
      const ingredients = extraireIngredientsSemaine(plansComplets)
      for (const ing of ingredients) {
        const { rayon, enseigne } = devinerAssignation(ing.nom)
        await addShoppingItem(supabase, userId, { week_start: weekStart, nom: ing.nom, quantite: ing.quantite || null, enseigne, rayon, source: 'manuel' })
      }
      alert(`${ingredients.length} ingrédients ajoutés à la liste de courses !`)
    } finally { setExportant(false) }
  }

  const labelSemaine = format(parseISO(weekStart), "'Semaine du' d MMMM yyyy", { locale: fr })

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation + boutons */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={semainePrecedente}><ChevronLeft size={16} /></Button>
          <span className="text-sm font-medium min-w-[200px] text-center text-neutral-700 dark:text-neutral-300">
            {labelSemaine}
          </span>
          <Button variant="outline" size="icon" onClick={semaineSuivante}><ChevronRight size={16} /></Button>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Button size="sm" onClick={handleGenerer} disabled={generant || chargement} className="alimentation-btn-primaire">
            <Sparkles size={14} className="mr-1.5" />{generant ? 'Génération…' : 'Générer la semaine'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportCourses} disabled={exportant}>
            <ShoppingCart size={14} className="mr-1.5" />{exportant ? 'Export…' : 'Vers les courses'}
          </Button>
        </div>
      </div>

      {recettes.length === 0 && !chargement && (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
          💡 Sauvegarde d&apos;abord quelques recettes dans l&apos;onglet &ldquo;Suggestions&rdquo; pour que la génération automatique puisse les utiliser. Les petit-déjeuners sont toujours générés automatiquement.
        </p>
      )}

      {chargement ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      ) : erreur ? (
        <p className="text-sm text-red-500">{erreur}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {dates.map((date, i) => (
            <CartePlanJour
              key={date}
              date={date}
              weekStart={weekStart}
              phase={phasePourDatePlan(date, sansSuiviCycle, effectiveStart, cycleLength, stats)}
              typeJournee={getTypeJournee(parseISO(date))}
              sansSuiviCycle={sansSuiviCycle}
              plans={plansComplets.filter((p) => p.date === date)}
              budget={budgets[i]!}
              recettesDisponibles={recettes}
              optionsPetitDej={OPTIONS_PETIT_DEJ}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
