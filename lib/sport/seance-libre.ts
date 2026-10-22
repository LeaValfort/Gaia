import type { SaisieChargeSeance } from '@/lib/db/charges'
import type { DerniereCharge, LigneSeanceLibre, MouvementCircuit, TypeLigneSeanceLibre } from '@/types'

/**
 * Logique pure des séances libres : création de lignes, lecture sûre du jsonb
 * stocké en base, durée totale, extraction des charges à mémoriser.
 */

export function nouvelId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function nouveauMouvementCircuit(): MouvementCircuit {
  return { id: nouvelId(), nom: '', duree_sec: 30, reps: null }
}

export function nouvelleLigne(type: TypeLigneSeanceLibre): LigneSeanceLibre {
  const id = nouvelId()
  switch (type) {
    case 'exercice':
      return { type, id, nom: '', series: 3, reps: 10, unite: 'reps', charge_kg: null }
    case 'bloc':
      return { type, id, nom: '', series: 1, duree_min: null, distance_m: null }
    case 'mouvement':
      return { type, id, nom: '', series: 1, duree_sec: null }
    case 'intervalles':
      return { type, id, nom: 'Fractionné', tours: 8, effort_sec: 30, recup_sec: 30 }
    case 'circuit':
      return { type, id, nom: 'Circuit', tours: 3, repos_sec: 60, mouvements: [nouveauMouvementCircuit()] }
    case 'voie':
      return { type, id, nom: '', cotation: '', reussie: true }
  }
}

function n(v: unknown): number | null {
  const x = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN
  return Number.isFinite(x) ? x : null
}
const txt = (v: unknown) => (typeof v === 'string' ? v : '')

/** Lit le jsonb `contenu` sans jamais faire confiance à sa forme. */
export function parseContenuSeanceLibre(raw: unknown): LigneSeanceLibre[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((x): LigneSeanceLibre[] => {
    if (!x || typeof x !== 'object') return []
    const o = x as Record<string, unknown>
    const id = typeof o.id === 'string' && o.id ? o.id : nouvelId()
    const nom = txt(o.nom)
    switch (o.type) {
      case 'exercice':
        return [{ type: 'exercice', id, nom, series: n(o.series), reps: n(o.reps), unite: o.unite === 'secondes' ? 'secondes' : 'reps', charge_kg: n(o.charge_kg) }]
      case 'bloc':
        // `series` absent sur les blocs enregistrés avant le 22/10 → 1.
        return [{ type: 'bloc', id, nom, series: n(o.series) ?? 1, duree_min: n(o.duree_min), distance_m: n(o.distance_m) }]
      case 'mouvement':
        return [{ type: 'mouvement', id, nom, series: n(o.series), duree_sec: n(o.duree_sec) }]
      case 'intervalles':
        return [{ type: 'intervalles', id, nom, tours: n(o.tours), effort_sec: n(o.effort_sec), recup_sec: n(o.recup_sec) }]
      case 'circuit': {
        const mvts = Array.isArray(o.mouvements) ? o.mouvements : []
        const mouvements = mvts.flatMap((m): MouvementCircuit[] => {
          if (!m || typeof m !== 'object') return []
          const r = m as Record<string, unknown>
          return [{ id: typeof r.id === 'string' && r.id ? r.id : nouvelId(), nom: txt(r.nom), duree_sec: n(r.duree_sec), reps: n(r.reps) }]
        })
        return [{ type: 'circuit', id, nom, tours: n(o.tours), repos_sec: n(o.repos_sec), mouvements }]
      }
      case 'voie':
        return [{ type: 'voie', id, nom, cotation: txt(o.cotation), reussie: o.reussie !== false }]
      default:
        return []
    }
  })
}

/** Copie avec de nouveaux identifiants (charger un modèle sans le lier). */
export function copierLignes(lignes: LigneSeanceLibre[]): LigneSeanceLibre[] {
  return lignes.map((l) =>
    l.type === 'circuit'
      ? { ...l, id: nouvelId(), mouvements: l.mouvements.map((m) => ({ ...m, id: nouvelId() })) }
      : { ...l, id: nouvelId() }
  )
}

/** Garde les lignes renseignées (une voie peut n'avoir qu'une cotation). */
export function lignesRenseignees(lignes: LigneSeanceLibre[]): LigneSeanceLibre[] {
  return lignes.flatMap((l): LigneSeanceLibre[] => {
    const nom = l.nom.trim()
    if (l.type === 'voie') return nom || l.cotation.trim() ? [{ ...l, nom, cotation: l.cotation.trim() }] : []
    if (l.type === 'circuit') {
      const mouvements = l.mouvements.filter((m) => m.nom.trim()).map((m) => ({ ...m, nom: m.nom.trim() }))
      return mouvements.length ? [{ ...l, nom: nom || 'Circuit', mouvements }] : []
    }
    if (l.type === 'intervalles') return [{ ...l, nom: nom || 'Fractionné' }]
    return nom ? [{ ...l, nom }] : []
  })
}

/** Charge effective : saisie, sinon la dernière mémorisée (placeholder gris clair). */
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

/** Durée d'une ligne en secondes, quand elle est calculable. */
export function dureeLigneSec(l: LigneSeanceLibre): number {
  switch (l.type) {
    case 'bloc':
      return (l.series ?? 1) * (l.duree_min ?? 0) * 60
    case 'mouvement':
      return (l.series ?? 1) * (l.duree_sec ?? 0)
    case 'intervalles':
      return (l.tours ?? 0) * ((l.effort_sec ?? 0) + (l.recup_sec ?? 0))
    case 'circuit':
      return (l.tours ?? 0) * (l.mouvements.reduce((s, m) => s + (m.duree_sec ?? 0), 0) + (l.repos_sec ?? 0))
    default:
      return 0
  }
}

/** Durée totale (min), proposée quand la durée de la séance n'est pas saisie. */
export function dureeBlocsMin(lignes: LigneSeanceLibre[]): number | null {
  const t = lignes.reduce((s, l) => s + dureeLigneSec(l), 0)
  return t > 0 ? Math.round(t / 60) : null
}
