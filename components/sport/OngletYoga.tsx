'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { loggerSeanceYoga } from '@/lib/db/workouts'
import { getConseilYoga, type TypeYoga } from '@/lib/sport'
import type { Phase } from '@/types'
import { format } from 'date-fns'

interface OngletYogaProps {
  phase: Phase | null
}

const TYPES_YOGA: { value: TypeYoga; label: string; description: string }[] = [
  { value: 'yin',   label: 'Yin',   description: 'Postures longues, repos, restauration' },
  { value: 'flow',  label: 'Flow',  description: 'Enchaînements fluides, respiration' },
  { value: 'power', label: 'Power', description: 'Dynamique, force, endurance' },
]

export function OngletYoga({ phase }: OngletYogaProps) {
  const router = useRouter()
  const conseilPhase = phase ? getConseilYoga(phase) : null
  const [typeYoga, setTypeYoga] = useState<TypeYoga>(conseilPhase?.typeRecommande ?? 'flow')
  const [duree, setDuree] = useState('40')
  const [ressenti, setRessenti] = useState(0)
  const [notes, setNotes] = useState('')
  const [chargement, setChargement] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)

  async function sauvegarder() {
    setChargement(true)
    try {
      await loggerSeanceYoga({
        date: format(new Date(), 'yyyy-MM-dd'),
        type: typeYoga,
        dureeMin: parseInt(duree) || 40,
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

      {/* Conseil selon la phase */}
      {conseilPhase && (
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">
          💡 {conseilPhase.conseil}
        </div>
      )}

      {/* Type de yoga */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Type de yoga</p>
        <div className="flex flex-col sm:flex-row gap-2">
          {TYPES_YOGA.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => setTypeYoga(value)}
              className={`flex-1 px-4 py-3 rounded-xl text-left transition-all
                ${typeYoga === value ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}
            >
              <span className="font-semibold block text-sm">{label}</span>
              <span className="text-xs opacity-70">{description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Durée */}
      <div className="flex flex-col gap-1.5 sm:max-w-[180px]">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Durée (minutes)</p>
        <Input type="number" min={10} max={120} value={duree} onChange={(e) => setDuree(e.target.value)} />
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Notes</p>
        <Textarea placeholder="Observations, ressentis, routine suivie..." value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none text-sm" rows={3} />
      </div>

      {/* Ressenti */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Ressenti</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button key={val} onClick={() => setRessenti(val)} className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${ressenti === val ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 scale-110' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>{val}</button>
          ))}
        </div>
      </div>

      <Button onClick={sauvegarder} disabled={chargement} className="w-full sm:w-auto sm:self-start">
        {chargement ? 'Sauvegarde...' : sauvegarde ? '✓ Séance enregistrée !' : 'Enregistrer la séance'}
      </Button>
    </div>
  )
}
