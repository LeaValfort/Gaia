'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExerciceRangee, type ExerciceFormData } from './ExerciceRangee'
import { RessentiBoutons } from './RessentiBoutons'
import { getExercicesParSeance, EXERCICES } from '@/lib/data/exercises'
import { loggerSeanceMuscu } from '@/lib/db/workouts'
import { modifierSeanceMuscu } from '@/lib/db/workoutsModifier'
import type { Lieu, TypeSeanceMuscle, WorkoutMuscuComplet } from '@/types'
import { format } from 'date-fns'

const EXERCICE_VIDE: ExerciceFormData = { nom: '', series: '3', reps: '10', poids: '', inclus: true, estCustom: true }
const LABELS_SEANCE: Record<TypeSeanceMuscle, string> = { full_body: 'Full body', upper_lower: 'Upper / Lower' }
const NOTES_TO_SEANCE: Record<string, TypeSeanceMuscle> = { 'Full body': 'full_body', 'Upper / Lower': 'upper_lower' }

interface OngletMuscuProps { seanceExistante?: WorkoutMuscuComplet | null }

export function OngletMuscu({ seanceExistante }: OngletMuscuProps) {
  const router = useRouter()
  const estEnEdition = !!seanceExistante

  const [typeSeance, setTypeSeance] = useState<TypeSeanceMuscle | null>(
    seanceExistante?.notes ? (NOTES_TO_SEANCE[seanceExistante.notes] ?? null) : null
  )
  const [lieu, setLieu] = useState<Lieu>(seanceExistante?.location ?? 'maison')
  const [exercices, setExercices] = useState<ExerciceFormData[]>(
    seanceExistante?.sets.map((s) => ({
      nom: s.exercise_name, series: String(s.sets ?? 3), reps: String(s.reps ?? 10),
      poids: s.weight_kg != null ? String(s.weight_kg) : '', inclus: true, estCustom: true,
    })) ?? []
  )
  const [ressenti, setRessenti] = useState(seanceExistante?.feeling ?? 0)
  const [chargement, setChargement] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)

  useEffect(() => {
    if (!typeSeance || estEnEdition) return
    const liste = getExercicesParSeance(typeSeance, lieu)
    setExercices(liste.map((e) => ({
      nom: e.nom, series: String(e.seriesDefaut), reps: String(e.repsDefaut),
      poids: '', inclus: true, estCustom: false,
    })))
  }, [typeSeance, lieu, estEnEdition])

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
      const exData = inclus.map((e) => ({
        nom: e.nom, series: parseInt(e.series) || null,
        reps: parseInt(e.reps) || null, poids: parseFloat(e.poids) || null,
      }))
      const params = { location: lieu, feeling: ressenti || null, notes: typeSeance ? LABELS_SEANCE[typeSeance] : null, exercices: exData }
      if (estEnEdition && seanceExistante) {
        await modifierSeanceMuscu(seanceExistante.id, params)
      } else {
        await loggerSeanceMuscu({ date: format(new Date(), 'yyyy-MM-dd'), ...params })
      }
      setSauvegarde(true)
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

      {!typeSeance && !estEnEdition ? (
        <p className="text-sm text-neutral-400 text-center py-4">Choisis un type de séance pour voir les exercices recommandés.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Exercices ({exercices.filter(e => e.inclus).length} sélectionnés)</p>
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

      <RessentiBoutons valeur={ressenti} onChange={setRessenti} />

      <Button onClick={sauvegarder} disabled={chargement || !exercices.some(e => e.inclus && e.nom.trim())} className="w-full sm:w-auto sm:self-start">
        {chargement ? 'Sauvegarde...' : sauvegarde ? '✓ Séance enregistrée !' : estEnEdition ? 'Modifier la séance' : 'Enregistrer la séance'}
      </Button>
    </div>
  )
}
