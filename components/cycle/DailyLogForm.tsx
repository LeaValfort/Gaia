'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { upsertDailyLog } from '@/lib/db/dailyLog'
import type { DailyLog, Phase } from '@/types'
import { ENERGY_MIN, ENERGY_MAX, PAIN_MIN, PAIN_MAX } from '@/types'

interface DailyLogFormProps {
  date: string
  phase: Phase
  jourDuCycle: number
  logInitial: DailyLog | null
}

export function DailyLogForm({ date, phase, jourDuCycle, logInitial }: DailyLogFormProps) {
  const router = useRouter()
  const [energie, setEnergie] = useState<number>(logInitial?.energy ?? 0)
  const [douleur, setDouleur] = useState<number>(logInitial?.pain ?? 0)
  const [humeur, setHumeur] = useState(logInitial?.mood ?? '')
  const [notes, setNotes] = useState(logInitial?.notes ?? '')
  const [chargement, setChargement] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)

  async function sauvegarder() {
    setChargement(true)
    try {
      await upsertDailyLog({
        date,
        phase,
        cycle_day: jourDuCycle,
        energy: energie || null,
        pain: douleur,
        mood: humeur || null,
        notes: notes || null,
      })
      setSauvegarde(true)
      setTimeout(() => setSauvegarde(false), 2000)
      router.refresh()
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-5">
      <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Journal du jour</h2>

      {/* Énergie 1-5 */}
      <div>
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
          Énergie
        </p>
        <div className="flex gap-2">
          {Array.from({ length: ENERGY_MAX }, (_, i) => i + ENERGY_MIN).map((val) => (
            <button
              key={val}
              onClick={() => setEnergie(val)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all
                ${energie === val
                  ? 'bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 scale-110'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Douleur 0-10 */}
      <div>
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
          Douleur
        </p>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: PAIN_MAX + 1 }, (_, i) => i + PAIN_MIN).map((val) => (
            <button
              key={val}
              onClick={() => setDouleur(val)}
              className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all
                ${douleur === val
                  ? 'bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 scale-110'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Humeur */}
      <div>
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
          Humeur
        </p>
        <input
          type="text"
          value={humeur}
          onChange={(e) => setHumeur(e.target.value)}
          placeholder="Comment tu te sens ? (ex: motivée, fatiguée, zen...)"
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        />
      </div>

      {/* Notes */}
      <div>
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
          Notes libres
        </p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observations, symptômes, pensées du jour..."
          className="resize-none text-sm"
          rows={3}
        />
      </div>

      <Button onClick={sauvegarder} disabled={chargement} className="w-full sm:w-auto sm:self-end">
        {chargement ? 'Sauvegarde...' : sauvegarde ? '✓ Sauvegardé' : 'Sauvegarder'}
      </Button>
    </div>
  )
}
