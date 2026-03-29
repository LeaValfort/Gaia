'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExerciceRangee, type ExerciceFormData } from './ExerciceRangee'
import { getExercicesParSeance, EXERCICES } from '@/lib/data/exercises'
import { loggerSeanceMuscu } from '@/lib/db/workouts'
import type { Lieu, TypeSeanceMuscle } from '@/types'
import { format } from 'date-fns'

const EXERCICE_VIDE: ExerciceFormData = { nom: '', series: '3', reps: '10', poids: '', inclus: true, estCustom: true }

const LABELS_SEANCE: Record<TypeSeanceMuscle, string> = {
  full_body: 'Full body',
  upper_lower: 'Upper / Lower',
}

export function OngletMuscu() {
  const router = useRouter()
  const [typeSeance, setTypeSeance] = useState<TypeSeanceMuscle | null>(null)
  const [lieu, setLieu] = useState<Lieu>('maison')
  const [exercices, setExercices] = useState<ExerciceFormData[]>([])
  const [ressenti, setRessenti] = useState(0)
  const [chargement, setChargement] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)

  // Pré-remplit les exercices quand le type de séance ou le lieu change
  useEffect(() => {
    if (!typeSeance) return
    const liste = getExercicesParSeance(typeSeance, lieu)
    setExercices(liste.map((e) => ({
      nom: e.nom,
      series: String(e.seriesDefaut),
      reps: String(e.repsDefaut),
      poids: '',
      inclus: true,
      estCustom: false,
    })))
  }, [typeSeance, lieu])

  function mettreAJour(i: number, champ: 'nom' | 'series' | 'reps' | 'poids', val: string) {
    setExercices((prev) => prev.map((e, idx) => idx === i ? { ...e, [champ]: val } : e))
  }

  function toggleInclus(i: number) {
    setExercices((prev) => prev.map((e, idx) => idx === i ? { ...e, inclus: !e.inclus } : e))
  }

  function supprimer(i: number) {
    setExercices((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function sauvegarder() {
    const inclus = exercices.filter((e) => e.inclus && e.nom.trim())
    if (!inclus.length) return
    setChargement(true)
    try {
      await loggerSeanceMuscu({
        date: format(new Date(), 'yyyy-MM-dd'),
        location: lieu,
        feeling: ressenti || null,
        notes: typeSeance ? LABELS_SEANCE[typeSeance] : null,
        exercices: inclus.map((e) => ({
          nom: e.nom,
          series: parseInt(e.series) || null,
          reps: parseInt(e.reps) || null,
          poids: parseFloat(e.poids) || null,
        })),
      })
      setSauvegarde(true)
      setTimeout(() => setSauvegarde(false), 3000)
      router.refresh()
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Type de séance */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Type de séance</p>
        <div className="flex gap-2">
          {(Object.entries(LABELS_SEANCE) as [TypeSeanceMuscle, string][]).map(([val, label]) => (
            <button key={val} onClick={() => setTypeSeance(val)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${typeSeance === val ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lieu */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Lieu</p>
        <div className="flex gap-2">
          {(['maison', 'salle'] as Lieu[]).map((l) => (
            <button key={l} onClick={() => setLieu(l)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all
                ${lieu === l ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Exercices */}
      {!typeSeance ? (
        <p className="text-sm text-neutral-400 text-center py-4">Choisis un type de séance pour voir les exercices recommandés.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            Exercices ({exercices.filter(e => e.inclus).length} sélectionnés)
          </p>
          {exercices.map((e, i) => (
            <ExerciceRangee key={i} data={e}
              muscles={!e.estCustom ? EXERCICES.find(ex => ex.nom === e.nom)?.muscles : undefined}
              onToggle={() => toggleInclus(i)}
              onChange={(champ, val) => mettreAJour(i, champ, val)}
              onSupprimer={() => supprimer(i)}
            />
          ))}
          <Button variant="outline" size="sm" onClick={() => setExercices((p) => [...p, { ...EXERCICE_VIDE }])}
            className="w-fit flex items-center gap-1.5 mt-1">
            <Plus size={14} /> Ajouter un exercice
          </Button>
        </div>
      )}

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

      <Button onClick={sauvegarder} disabled={chargement || !exercices.some(e => e.inclus && e.nom.trim())} className="w-full sm:w-auto sm:self-start">
        {chargement ? 'Sauvegarde...' : sauvegarde ? '✓ Séance enregistrée !' : 'Enregistrer la séance'}
      </Button>
    </div>
  )
}
