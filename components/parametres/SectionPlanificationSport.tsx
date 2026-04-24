'use client'

import { addDays, format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useCallback, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { actionGetPlanningSportSemaine, actionSavePlanningSportSemaine } from '@/lib/db/planning-sport-actions'
import type { ActivitePlanifieeSport } from '@/lib/db/planning-sport'
import type { Phase } from '@/types'
import { cn } from '@/lib/utils'

type Act = 'muscu' | 'yoga' | 'natation' | 'repos' | 'autre' | null
const ACTS: { id: Act; l: string; c: string }[] = [
  { id: 'muscu', l: 'Muscu', c: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50' },
  { id: 'yoga', l: 'Yoga', c: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50' },
  { id: 'natation', l: 'Natation', c: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50' },
  { id: 'repos', l: 'Repos', c: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700' },
  { id: 'autre', l: 'Autre', c: 'bg-amber-100 text-amber-900 dark:bg-amber-900/50' },
]

function planVersStockage(plan: Record<string, Act>): Record<string, ActivitePlanifieeSport> {
  const o: Record<string, ActivitePlanifieeSport> = {}
  for (const [k, v] of Object.entries(plan)) {
    if (v) o[k] = v
  }
  return o
}

function stockageVersPlan(j: Record<string, ActivitePlanifieeSport>): Record<string, Act> {
  return Object.fromEntries(Object.entries(j).map(([k, v]) => [k, v as Act])) as Record<string, Act>
}

function suggestion(phase: Phase | null): string {
  if (!phase) return 'Planifie selon ton énergie du jour.'
  if (phase === 'menstruation' || phase === 'luteale') return 'Gaia : privilégie yoga yin ou un jour de repos.'
  if (phase === 'folliculaire') return 'Gaia : musculation légère ou natation vont bien.'
  if (phase === 'ovulation') return 'Gaia : muscu un peu plus intense ou un autre sport plaisir.'
  return ''
}

function badgeClasse(a: Act): string {
  return ACTS.find((x) => x.id === a)?.c ?? 'bg-neutral-200 text-neutral-600'
}
function labelAct(a: Act): string {
  return ACTS.find((x) => x.id === a)?.l ?? '—'
}

function PlanifCalendrierHebdo({
  phase,
  userId,
  weekStart,
  sansPreambule = false,
}: {
  phase: Phase | null
  userId: string
  weekStart: string
  sansPreambule?: boolean
}) {
  const [plan, setPlan] = useState<Record<string, Act>>({})
  const [pretSauvegarde, setPretSauvegarde] = useState(() => !userId)
  const [jourSel, setJourSel] = useState<string | null>(null)
  const d0 = parseISO(weekStart)
  const jours = Array.from({ length: 7 }, (_, i) => addDays(d0, i))
  const today = format(new Date(), 'yyyy-MM-dd')

  const appliquerActivite = useCallback((k: string, a: Act) => {
    setPlan((p) => {
      if (a == null) {
        const n = { ...p }
        delete n[k]
        return n
      }
      return { ...p, [k]: a }
    })
  }, [])

  useEffect(() => {
    if (!userId) {
      setPretSauvegarde(true)
      return
    }
    setPretSauvegarde(false)
    let annule = false
    void actionGetPlanningSportSemaine(weekStart).then((r) => {
      if (annule) return
      if (r?.jours && Object.keys(r.jours).length) {
        setPlan(stockageVersPlan(r.jours))
      } else {
        setPlan({})
      }
      setPretSauvegarde(true)
    })
    return () => {
      annule = true
    }
  }, [userId, weekStart])

  useEffect(() => {
    if (!pretSauvegarde || !userId) return
    const t = setTimeout(() => {
      void actionSavePlanningSportSemaine(weekStart, planVersStockage(plan)).catch(() => {})
    }, 500)
    return () => clearTimeout(t)
  }, [plan, pretSauvegarde, userId, weekStart])

  return (
    <div className="flex flex-col gap-4">
      {!sansPreambule && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {userId
            ? 'Semaine en cours (lundi–dimanche) — le planning est enregistré sur ton compte et se recharge automatiquement.'
            : 'Connecte-toi pour retrouver ton planning d’une session à l’autre. En navigation locale, il reste provisoire.'}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
        {jours.map((d) => {
          const k = format(d, 'yyyy-MM-dd')
          const a = plan[k] ?? null
          const estJ = k === today
          return (
            <button
              key={k}
              type="button"
              onClick={() => setJourSel(k)}
              className={cn(
                'flex flex-col rounded-xl border p-2 text-left text-sm transition-all',
                estJ ? 'outline outline-2 outline-rose-500' : 'border-neutral-200 dark:border-neutral-800'
              )}
            >
              <span className="text-[10px] font-semibold uppercase text-neutral-400">
                {format(d, 'EEE', { locale: fr })}
              </span>
              <span className="font-mono text-xs">{k}</span>
              <span className={cn('mt-1 inline-block w-fit rounded px-1.5 py-0.5 text-[10px]', a ? badgeClasse(a) : 'bg-neutral-100 text-neutral-500')}>
                {a ? labelAct(a) : '—'}
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{suggestion(phase)}</p>
      <Dialog open={jourSel != null} onOpenChange={() => setJourSel(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Activité du {jourSel}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {ACTS.filter((x) => x.id).map((x) => (
              <Button
                key={x.id!}
                type="button"
                variant="outline"
                className="justify-start"
                onClick={() => {
                  if (jourSel) appliquerActivite(jourSel, x.id)
                  setJourSel(null)
                }}
              >
                {x.l}
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (jourSel) appliquerActivite(jourSel, null)
                setJourSel(null)
              }}
            >
              Effacer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function SectionPlanificationSport({
  phase,
  userId,
  weekStart,
}: {
  phase: Phase | null
  userId: string
  weekStart: string
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white/90 p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Planification des séances sport</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Vue de la semaine (lundi–dimanche) : indique le type d’activité prévu chaque jour. C’est enregistré sur ton
          compte si tu es connectée.
        </p>
      </div>
      <PlanifCalendrierHebdo phase={phase} userId={userId} weekStart={weekStart} sansPreambule />
    </section>
  )
}
