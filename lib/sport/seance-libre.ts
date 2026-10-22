import type { SaisieChargeSeance } from '@/lib/db/charges'
import type { DerniereCharge, LigneSeanceLibre } from '@/types'

/**
 * Logique pure des séances libres (« autre sport ») : création de lignes,
 * lecture sûre du jsonb stocké en base, extraction des charges à mémoriser.
 */

function nouvelId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function nouvelExercice(): LigneSeanceLibre {
  return { type: 'exercice', id: nouvelId(), nom: '', series: 3, reps: 10, unite: 'reps', charge_kg: null }
}

export function nouveauBloc(): LigneSeanceLibre {
  return { type: 'bloc', id: nouvelId(), nom: '', duree_min: null, distance_m: null }
}

function nombreOuNull(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN
  return Number.isFinite(n) ? n : null
}

/** Lit le jsonb `contenu` sans jamais faire confiance à sa forme. */
export function parseContenuSeanceLibre(raw: unknown): LigneSeanceLibre[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((x): LigneSeanceLibre[] => {
    if (!x || typeof x !== 'object') return []
    const o = x as Record<string, unknown>
    const id = typeof o.id === 'string' ? o.id : nouvelId()
    const nom = typeof o.nom === 'string' ? o.nom : ''
    if (o.type === 'exercice') {
      return [{
        type: 'exercice', id, nom,
        series: nombreOuNull(o.series),
        reps: nombreOuNull(o.reps),
        unite: o.unite === 'secondes' ? 'secondes' : 'reps',
        charge_kg: nombreOuNull(o.charge_kg),
      }]
    }
    if (o.type === 'bloc') {
      return [{ type: 'bloc', id, nom, duree_min: nombreOuNull(o.duree_min), distance_m: nombreOuNull(o.distance_m) }]
    }
    return []
  })
}

/** Copie des lignes avec de nouveaux identifiants (charger un modèle sans le lier). */
export function copierLignes(lignes: LigneSeanceLibre[]): LigneSeanceLibre[] {
  return lignes.map((l) => ({ ...l, id: nouvelId() }))
}

/** Retire les lignes sans nom (ajoutées puis laissées vides). */
export function lignesRenseignees(lignes: LigneSeanceLibre[]): LigneSeanceLibre[] {
  return lignes.filter((l) => l.nom.trim() !== '').map((l) => ({ ...l, nom: l.nom.trim() }))
}

/**
 * Charge effective d'un exercice : celle saisie, sinon la dernière mémorisée
 * (affichée en gris clair dans le champ), comme en muscu.
 */
export function chargeEffective(l: LigneSeanceLibre, dernieres: Map<string, DerniereCharge>): number | null {
  if (l.type !== 'exercice') return null
  return l.charge_kg ?? dernieres.get(l.nom.trim())?.weight_kg ?? null
}

/** Charges à mémoriser dans `dernieres_charges` après l'enregistrement. */
export function chargesAMemoriser(lignes: LigneSeanceLibre[]): SaisieChargeSeance[] {
  return lignes.flatMap((l) =>
    l.type === 'exercice' && l.charge_kg != null && l.charge_kg > 0
      ? [{ exercise_name: l.nom, weight_kg: l.charge_kg, reps: l.reps ?? 0, sets: l.series ?? 0 }]
      : []
  )
}

/** Durée totale des blocs, proposée quand la durée de la séance n'est pas saisie. */
export function dureeBlocsMin(lignes: LigneSeanceLibre[]): number | null {
  const t = lignes.reduce((s, l) => s + (l.type === 'bloc' ? l.duree_min ?? 0 : 0), 0)
  return t > 0 ? Math.round(t) : null
}
