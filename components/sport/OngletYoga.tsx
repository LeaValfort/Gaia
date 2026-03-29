'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { TimerYoga } from './TimerYoga'
import { RessentiBoutons } from './RessentiBoutons'
import { getSeanceYoga, getSeanceParPhase, SEANCES_YOGA } from '@/lib/data/yoga'
import { loggerSeanceYoga } from '@/lib/db/workouts'
import { modifierSeanceYoga } from '@/lib/db/workoutsModifier'
import type { Phase, TypeYoga, WorkoutYogaComplet } from '@/types'
import { format } from 'date-fns'

// Parse le typeYoga depuis le champ notes au format "[type] notes optionnel"
function parseTypeYoga(notes: string | null): TypeYoga | null {
  if (!notes) return null
  const match = notes.match(/^\[(\w+)\]/)
  const type = match?.[1]
  if (type === 'yin' || type === 'flow' || type === 'power') return type
  return null
}

interface OngletYogaProps {
  phase: Phase | null
  seanceExistante?: WorkoutYogaComplet | null
}

export function OngletYoga({ phase, seanceExistante }: OngletYogaProps) {
  const router = useRouter()
  const estEnEdition = !!seanceExistante

  const typeParDefaut = parseTypeYoga(seanceExistante?.notes ?? null)
    ?? (phase ? getSeanceParPhase(phase).type : SEANCES_YOGA[1].type)

  const [typeYoga, setTypeYoga] = useState<TypeYoga>(typeParDefaut)
  const [timerOuvert, setTimerOuvert] = useState(false)
  const [ressenti, setRessenti] = useState(seanceExistante?.feeling ?? 0)
  const [notes, setNotes] = useState(() => {
    if (!seanceExistante?.notes) return ''
    return seanceExistante.notes.replace(/^\[\w+\]\s*/, '')
  })
  const [chargement, setChargement] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)

  const seance = getSeanceYoga(typeYoga)
  const seanceParDefaut = phase ? getSeanceParPhase(phase) : SEANCES_YOGA[1]

  async function sauvegarder() {
    setChargement(true)
    try {
      const params = { type: typeYoga, dureeMin: seance.dureeMin, feeling: ressenti || null, notes: notes || null }
      if (estEnEdition && seanceExistante) {
        await modifierSeanceYoga(seanceExistante.id, params)
      } else {
        await loggerSeanceYoga({ date: format(new Date(), 'yyyy-MM-dd'), ...params })
      }
      setSauvegarde(true)
      if (!estEnEdition) { setNotes(''); setRessenti(0) }
      setTimeout(() => setSauvegarde(false), 3000)
      router.refresh()
    } finally { setChargement(false) }
  }

  return (
    <div className="flex flex-col gap-5">
      {estEnEdition && (
        <div className="flex items-center gap-2 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 px-4 py-2.5 text-sm text-violet-700 dark:text-violet-300">
          <Pencil size={14} /> Séance du jour déjà enregistrée — formulaire pré-rempli pour modification
        </div>
      )}

      {phase && !estEnEdition && (
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">
          💡 Phase <span className="font-medium capitalize">{phase}</span> → séance recommandée :{' '}
          <span className="font-semibold">{seanceParDefaut.nom}</span>
        </div>
      )}

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

      <div className="text-sm text-neutral-500 dark:text-neutral-400 px-1">{seance.description}</div>

      <div>
        {!timerOuvert ? (
          <button onClick={() => setTimerOuvert(true)}
            className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-sm text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-all text-center">
            🧘 Ouvrir le timer guidé posture par posture
          </button>
        ) : (
          <TimerYoga postures={seance.postures} onTermine={() => setSauvegarde(false)} />
        )}
      </div>

      <RessentiBoutons valeur={ressenti} onChange={setRessenti} />

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Notes</p>
        <Textarea placeholder="Observations, ressentis, variantes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none text-sm" rows={2} />
      </div>

      <Button onClick={sauvegarder} disabled={chargement} className="w-full sm:w-auto sm:self-start">
        {chargement ? 'Sauvegarde...' : sauvegarde ? '✓ Séance enregistrée !' : estEnEdition ? 'Modifier la séance' : 'Enregistrer la séance'}
      </Button>
    </div>
  )
}
