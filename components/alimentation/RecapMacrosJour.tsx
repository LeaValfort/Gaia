'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { TrendingUp, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getDailyMealIntakesJour } from '@/lib/db/dailyMealIntake'
import { fusionIntakesJour, calculerRecapDepuisIntakes, ORDRE_TYPES_REPAS } from '@/lib/recapManuel'
import { couleurResteKcal } from '@/lib/recapjour'
import { MACROS_JOURNEE, PHASE_STYLES, getTypeJourneeEffectifMacros } from '@/lib/nutrition'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PanneauRepasJour } from '@/components/alimentation/PanneauRepasJour'
import { PanneauImportRecetteJournal } from '@/components/alimentation/PanneauImportRecetteJournal'
import { FormRecettePersoRapide } from '@/components/alimentation/FormRecettePersoRapide'
import type { Phase, TypeJournee, DailyMealIntake, TypeRepas } from '@/types'

const LIB_CRENEAU: Record<TypeRepas, string> = {
  'petit-dej': '🌅 Petit-déj',
  dejeuner: '🌞 Déjeuner',
  collation: '🍎 Collation',
  diner: '🌙 Dîner',
}

interface RecapMacrosJourProps {
  userId: string
  date: string
  phase: Phase
  typeJournee: TypeJournee
  weekStart: string
  sansSuiviCycle?: boolean
}

const STYLES_NEUTRE = {
  border: 'border-emerald-200 dark:border-emerald-800',
  bg: 'bg-emerald-50/70 dark:bg-emerald-950/25',
}

export function RecapMacrosJour({
  userId,
  date,
  phase,
  typeJournee,
  weekStart: _weekStart,
  sansSuiviCycle,
}: RecapMacrosJourProps) {
  const [lignes, setLignes] = useState<DailyMealIntake[]>([])
  const [chargement, setChargement] = useState(true)
  const [ongletRecap, setOngletRecap] = useState('repas')
  const [creneau, setCreneau] = useState<TypeRepas>('petit-dej')
  const styles = sansSuiviCycle ? STYLES_NEUTRE : PHASE_STYLES[phase]

  const charger = useCallback(
    async (soft = false) => {
      if (!soft) setChargement(true)
      const rows = await getDailyMealIntakesJour(supabase, userId, date)
      setLignes(fusionIntakesJour(date, rows))
      setChargement(false)
    },
    [userId, date]
  )

  useEffect(() => {
    void charger(false)
  }, [charger])

  const rechargerSilencieux = useCallback(() => void charger(true), [charger])

  const typeJourneeMacros = useMemo(
    () => getTypeJourneeEffectifMacros(phase, typeJournee, sansSuiviCycle),
    [phase, typeJournee, sansSuiviCycle]
  )

  const { total, reste, pourcentageAtteint } = useMemo(
    () => calculerRecapDepuisIntakes(lignes, typeJourneeMacros),
    [lignes, typeJourneeMacros]
  )
  const cibles = MACROS_JOURNEE[typeJourneeMacros]

  if (chargement) return <Skeleton className="h-40 w-full rounded-xl" />

  const apresImport = () => {
    rechargerSilencieux()
    setOngletRecap('repas')
  }

  const piedTableau = (
    <div className="overflow-x-auto -mx-1 pt-2 border-t border-neutral-200 dark:border-neutral-700">
      <table className="w-full min-w-[260px] text-sm text-neutral-800 dark:text-neutral-200">
        <thead>
          <tr className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700">
            <th className="text-left font-medium py-1 pr-2" />
            <th className="text-right font-medium py-1">Calories (kcal)</th>
            <th className="text-right font-medium py-1 hidden sm:table-cell">Protéines (g)</th>
            <th className="text-right font-medium py-1 hidden sm:table-cell">Glucides (g)</th>
            <th className="text-right font-medium py-1 hidden sm:table-cell">Lipides / mat. grasses (g)</th>
            <th className="text-right font-medium py-1 sm:hidden">P·G·L (g)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="font-semibold border-b border-neutral-200 dark:border-neutral-700">
            <td className="py-1.5 pr-2">Total journée</td>
            <td className="py-1.5 text-right tabular-nums">{total.calories}</td>
            <td className="py-1.5 text-right hidden sm:table-cell text-xs tabular-nums">{total.proteines}</td>
            <td className="py-1.5 text-right hidden sm:table-cell text-xs tabular-nums">{total.glucides}</td>
            <td className="py-1.5 text-right hidden sm:table-cell text-xs tabular-nums">{total.lipides}</td>
            <td className="py-1.5 text-right sm:hidden text-xs tabular-nums">{total.proteines}·{total.glucides}·{total.lipides}</td>
          </tr>
          <tr className={`font-medium ${couleurResteKcal(total.calories, cibles.kcal)}`}>
            <td className="py-1.5 pr-2">Reste (cible − total)</td>
            <td className="py-1.5 text-right tabular-nums">{reste.calories}</td>
            <td className="py-1.5 text-right hidden sm:table-cell text-xs tabular-nums">{reste.proteines}</td>
            <td className="py-1.5 text-right hidden sm:table-cell text-xs tabular-nums">{reste.glucides}</td>
            <td className="py-1.5 text-right hidden sm:table-cell text-xs tabular-nums">{reste.lipides}</td>
            <td className="py-1.5 text-right sm:hidden text-xs tabular-nums">{reste.proteines}·{reste.glucides}·{reste.lipides}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )

  return (
    <div className={`rounded-xl border overflow-hidden ${styles.border} ${styles.bg}`}>
      <div className={`px-3 py-2 border-b ${styles.border} bg-black/5 dark:bg-white/5 flex items-center gap-2`}>
        <TrendingUp className="h-4 w-4 text-neutral-600 dark:text-neutral-400 shrink-0" aria-hidden />
        <CheckCircle2 className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          Récap du jour
          <span className="font-normal text-neutral-600 dark:text-neutral-400"> · {pourcentageAtteint}% kcal</span>
        </p>
      </div>
      <div className="p-3 space-y-3">
        <Progress value={Math.min(100, pourcentageAtteint)} className="h-2" />
        <Tabs value={ongletRecap} onValueChange={setOngletRecap}>
          <TabsList className="w-full grid grid-cols-2 h-auto min-h-9 text-xs py-1">
            <TabsTrigger value="repas">Par repas</TabsTrigger>
            <TabsTrigger value="import">Importer / créer</TabsTrigger>
          </TabsList>
          <TabsContent value="repas" className="mt-3 space-y-3 min-h-[80px]">
            <Tabs value={creneau} onValueChange={(v) => setCreneau(v as TypeRepas)}>
              <TabsList className="w-full flex overflow-x-auto gap-1 p-1 h-auto min-h-9 text-[10px] sm:text-xs justify-start">
                {ORDRE_TYPES_REPAS.map((t) => (
                  <TabsTrigger key={t} value={t} className="shrink-0 px-2">
                    {LIB_CRENEAU[t]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {ORDRE_TYPES_REPAS.map((t) => (
                <TabsContent key={t} value={t} className="mt-2">
                  <PanneauRepasJour
                    userId={userId}
                    intake={lignes.find((l) => l.type_repas === t)!}
                    typeJournee={typeJourneeMacros}
                    onEnregistre={rechargerSilencieux}
                  />
                </TabsContent>
              ))}
            </Tabs>
            {piedTableau}
          </TabsContent>
          <TabsContent value="import" keepMounted className="mt-3 space-y-4 min-h-[120px]">
            <PanneauImportRecetteJournal userId={userId} date={date} onApplique={apresImport} />
            <FormRecettePersoRapide userId={userId} onCree={rechargerSilencieux} />
            {piedTableau}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
