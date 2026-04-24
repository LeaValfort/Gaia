'use client'

import Link from 'next/link'
import { addDays, isBefore, isSameDay, startOfDay, startOfWeek } from 'date-fns'
import { designPhaseAffichage, PHASES_DESIGN } from '@/lib/data/phases-design'
import { LABELS_PLANNING } from '@/lib/planning-sport'
import type { Phase, PlanningSport, TypePlanningJour } from '@/types'
import { cn } from '@/lib/utils'

const JOURS: { cle: keyof PlanningSport; court: string }[] = [
  { cle: 'lundi', court: 'Lun' },
  { cle: 'mardi', court: 'Mar' },
  { cle: 'mercredi', court: 'Mer' },
  { cle: 'jeudi', court: 'Jeu' },
  { cle: 'vendredi', court: 'Ven' },
  { cle: 'samedi', court: 'Sam' },
  { cle: 'dimanche', court: 'Dim' },
]

function court(t: TypePlanningJour): string {
  const u: Record<TypePlanningJour, string> = {
    muscu_full: 'Full',
    muscu_upper: 'Upper',
    yoga: 'Yoga',
    natation: 'Nata.',
    autre: 'Autre',
    repos: 'Repos',
  }
  return u[t]
}

function conseils(phase: Phase | null, p: PlanningSport): string[] {
  if (!phase) return ['Adapte tes séances à ton énergie du moment.']
  const o: string[] = []
  const paires: [keyof PlanningSport, string][] = JOURS.map((j) => [j.cle, j.court])
  for (const [cle, label] of paires) {
    const a = p[cle]
    if ((a === 'muscu_full' || a === 'muscu_upper') && (phase === 'menstruation' || phase === 'luteale')) {
      o.push(`${label} : muscu allégée (-30%)`)
    }
    if (a === 'yoga' && (phase === 'menstruation' || phase === 'luteale')) {
      o.push(`${label} : yoga yin ✓ (parfait)`)
    }
  }
  return o.length ? o : ['Ta semaine est cohérente avec ta phase.']
}

export function OngletPlanification({ phase, planning }: { phase: Phase | null; planning: PlanningSport }) {
  const d0 = startOfWeek(new Date(), { weekStartsOn: 1 })
  const today = new Date()
  const dPhase = designPhaseAffichage(phase, { sansCycle: !phase })
  const nomPhase = phase ? PHASES_DESIGN[phase].label : 'personnelle'

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] sm:gap-2 sm:text-xs">
        {JOURS.map(({ cle, court: cr }, i) => {
          const d = addDays(d0, i)
          const t = planning[cle]
          const m = LABELS_PLANNING[t]
          const estJ = isSameDay(d, today)
          const passe = isBefore(startOfDay(d), startOfDay(today))
          return (
            <div
              key={cle}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg p-1.5 sm:p-2',
                passe && !estJ ? 'opacity-60' : '',
                estJ
                  ? 'outline outline-2'
                  : 'border border-neutral-200 dark:border-neutral-700'
              )}
              style={estJ ? { outlineColor: dPhase.accent } : undefined}
            >
              <span className="font-semibold text-neutral-500">{cr}</span>
              <span className="text-lg" aria-hidden>
                {m.emoji}
              </span>
              <span
                className={cn(
                  'line-clamp-2 rounded px-1 py-0.5 text-[10px] text-neutral-800 dark:text-neutral-200',
                  m.couleur,
                  'dark:opacity-90'
                )}
              >
                {court(t)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="rounded-xl border border-amber-200/80 bg-[#FFFBEB]/90 p-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="mb-2 font-semibold">💡 Cette semaine tu es en phase {nomPhase}</p>
        <p className="mb-2 text-amber-900/90 dark:text-amber-200/90">Gaia suggère d’adapter tes séances :</p>
        <ul className="list-inside list-disc space-y-1">
          {conseils(phase, planning).map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
      <p className="text-center text-sm">
        <Link href="/parametres" className="font-medium text-rose-600 underline dark:text-rose-400">
          Modifier mon planning
        </Link>{' '}
        → Paramètres
      </p>
    </div>
  )
}
