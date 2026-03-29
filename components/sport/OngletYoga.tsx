'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { TimerYoga } from './TimerYoga'
import { getSeanceYoga, getSeanceParPhase, SEANCES_YOGA } from '@/lib/data/yoga'
import { loggerSeanceYoga } from '@/lib/db/workouts'
import type { Phase, TypeYoga } from '@/types'
import { format } from 'date-fns'

interface OngletYogaProps {
  phase: Phase | null
}

export function OngletYoga({ phase }: OngletYogaProps) {
  const router = useRouter()
  const seanceParDefaut = phase ? getSeanceParPhase(phase) : SEANCES_YOGA[1]
  const [typeYoga, setTypeYoga] = useState<TypeYoga>(seanceParDefaut.type)
  const [timerOuvert, setTimerOuvert] = useState(false)
  const [ressenti, setRessenti] = useState(0)
  const [notes, setNotes] = useState('')
  const [chargement, setChargement] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)

  const seance = getSeanceYoga(typeYoga)

  async function sauvegarder() {
    setChargement(true)
    try {
      await loggerSeanceYoga({
        date: format(new Date(), 'yyyy-MM-dd'),
        type: typeYoga,
        dureeMin: seance.dureeMin,
        feeling: ressenti || null,
        notes: notes || null,
      })
      setSauvegarde(true)
      setNotes('')
      setRessenti(0)
      setTimeout(() => setSauvegarde(false), 3000)
      router.refresh()
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Recommandation selon la phase */}
      {phase && (
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">
          💡 Phase <span className="font-medium capitalize">{phase}</span> → séance recommandée :{' '}
          <span className="font-semibold">{seanceParDefaut.nom}</span>
        </div>
      )}

      {/* Choix du type */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Type de yoga</p>
        <div className="flex flex-col sm:flex-row gap-2">
          {SEANCES_YOGA.map((s) => (
            <button key={s.type} onClick={() => { setTypeYoga(s.type); setTimerOuvert(false) }}
              className={`flex-1 px-4 py-3 rounded-xl text-left transition-all
                ${typeYoga === s.type ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
              <span className="font-semibold block text-sm">{s.nom}</span>
              <span className="text-xs opacity-70">{s.dureeMin} min · {s.postures.length} postures</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description de la séance */}
      <div className="text-sm text-neutral-500 dark:text-neutral-400 px-1">
        {seance.description}
      </div>

      {/* Timer guidé */}
      <div>
        {!timerOuvert ? (
          <button
            onClick={() => setTimerOuvert(true)}
            className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-sm text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-all text-center"
          >
            🧘 Ouvrir le timer guidé posture par posture
          </button>
        ) : (
          <TimerYoga
            postures={seance.postures}
            onTermine={() => setSauvegarde(false)}
          />
        )}
      </div>

      {/* Ressenti */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Ressenti</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button key={val} onClick={() => setRessenti(val)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all
                ${ressenti === val ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 scale-110' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Notes</p>
        <Textarea placeholder="Observations, ressentis, variantes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none text-sm" rows={2} />
      </div>

      <Button onClick={sauvegarder} disabled={chargement} className="w-full sm:w-auto sm:self-start">
        {chargement ? 'Sauvegarde...' : sauvegarde ? '✓ Séance enregistrée !' : 'Enregistrer la séance'}
      </Button>
    </div>
  )
}
