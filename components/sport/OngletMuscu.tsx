'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loggerSeanceMuscu } from '@/lib/db/workouts'
import type { Lieu } from '@/types'
import { format } from 'date-fns'

interface ExerciceForm {
  nom: string
  series: string
  reps: string
  poids: string
}

const EXERCICE_VIDE: ExerciceForm = { nom: '', series: '', reps: '', poids: '' }

export function OngletMuscu() {
  const router = useRouter()
  const [location, setLocation] = useState<Lieu>('maison')
  const [exercices, setExercices] = useState<ExerciceForm[]>([{ ...EXERCICE_VIDE }])
  const [ressenti, setRessenti] = useState(0)
  const [notes, setNotes] = useState('')
  const [chargement, setChargement] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)

  function mettreAJour(i: number, champ: keyof ExerciceForm, val: string) {
    setExercices((prev) => prev.map((e, idx) => idx === i ? { ...e, [champ]: val } : e))
  }

  async function sauvegarder() {
    setChargement(true)
    try {
      await loggerSeanceMuscu({
        date: format(new Date(), 'yyyy-MM-dd'),
        location,
        feeling: ressenti || null,
        notes: notes || null,
        exercices: exercices.map((e) => ({
          nom: e.nom,
          series: parseInt(e.series) || null,
          reps: parseInt(e.reps) || null,
          poids: parseFloat(e.poids) || null,
        })),
      })
      setSauvegarde(true)
      setExercices([{ ...EXERCICE_VIDE }])
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

      {/* Lieu */}
      <div className="flex gap-2">
        {(['maison', 'salle'] as Lieu[]).map((l) => (
          <button
            key={l}
            onClick={() => setLocation(l)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all
              ${location === l ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Exercices */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wide px-1">
          <span className="col-span-5">Exercice</span>
          <span className="col-span-2 text-center">Séries</span>
          <span className="col-span-2 text-center">Reps</span>
          <span className="col-span-2 text-center">Kg</span>
          <span className="col-span-1" />
        </div>
        {exercices.map((e, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <Input className="col-span-5 h-9 text-sm" placeholder="Squat, PDC..." value={e.nom} onChange={(ev) => mettreAJour(i, 'nom', ev.target.value)} />
            <Input className="col-span-2 h-9 text-sm text-center" placeholder="3" type="number" min={1} value={e.series} onChange={(ev) => mettreAJour(i, 'series', ev.target.value)} />
            <Input className="col-span-2 h-9 text-sm text-center" placeholder="12" type="number" min={1} value={e.reps} onChange={(ev) => mettreAJour(i, 'reps', ev.target.value)} />
            <Input className="col-span-2 h-9 text-sm text-center" placeholder="0" type="number" min={0} step={0.5} value={e.poids} onChange={(ev) => mettreAJour(i, 'poids', ev.target.value)} />
            <button onClick={() => setExercices((p) => p.filter((_, idx) => idx !== i))} disabled={exercices.length === 1} className="col-span-1 flex justify-center text-neutral-300 hover:text-red-500 disabled:opacity-20 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setExercices((p) => [...p, { ...EXERCICE_VIDE }])} className="w-fit flex items-center gap-1.5">
          <Plus size={14} /> Ajouter un exercice
        </Button>
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
