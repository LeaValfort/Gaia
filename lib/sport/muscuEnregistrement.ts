import { actionUpdateChargesSeance } from '@/lib/db/charges-actions'
import { loggerSeanceMuscu } from '@/lib/db/workouts'
import { modifierSeanceMuscu } from '@/lib/db/workoutsModifier'
import { exSansChargeDumbbell } from '@/lib/sport/muscuExerciceAdapte'
import type { ExerciceAdapte, Lieu, TypeSeanceMuscle, WorkoutMuscuComplet } from '@/types'

const LTYPE: Record<TypeSeanceMuscle, string> = { full_body: 'Full body', upper_lower: 'Upper / Lower' }

export async function enregistrerSeanceMuscuComplet(opts: {
  date: string
  lieu: Lieu
  typeSeance: TypeSeanceMuscle
  ressenti: number | null
  afficher: ExerciceAdapte[]
  exercicesFaits: string[]
  charges: Record<string, number>
  edit: boolean
  seanceExistante: WorkoutMuscuComplet | null
}): Promise<void> {
  const { date, lieu, typeSeance, ressenti, afficher, exercicesFaits, charges, edit, seanceExistante } = opts
  const ok = afficher.filter((e) => exercicesFaits.includes(e.nom))
  if (!ok.length) return
  const ex = ok.map((e) => ({
    nom: e.nom,
    series: e.seriesAdaptees,
    reps: e.repsAdaptees,
    poids: exSansChargeDumbbell(e.nom) ? null : (charges[e.nom] ?? e.chargeProposee ?? null),
  }))
  const saisies = ok
    .filter((e) => !exSansChargeDumbbell(e.nom) && (charges[e.nom] != null || e.chargeProposee != null))
    .map((e) => ({
      exercise_name: e.nom,
      weight_kg: charges[e.nom] ?? e.chargeProposee ?? 0,
      reps: e.repsAdaptees,
      sets: e.seriesAdaptees,
    }))
  const params = { location: lieu, feeling: ressenti ?? null, notes: LTYPE[typeSeance], exercices: ex }
  if (edit && seanceExistante) await modifierSeanceMuscu(seanceExistante.id, params)
  else await loggerSeanceMuscu({ date, ...params })
  if (saisies.length) await actionUpdateChargesSeance(saisies, date)
}
