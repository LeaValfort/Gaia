import { PHASES_DESIGN } from '@/lib/data/phases-design'
import { appliquerPourcentage } from '@/lib/planning-sport'
import type { LigneSeanceLibre, Phase, PostureYoga } from '@/types'

/**
 * « Séance Gaia » pour tous les sports : applique le pourcentage de la phase
 * aux durées, distances et charges. Les répétitions, séries et tours ne
 * changent pas (choix de l'utilisatrice).
 */

/** Valeur nullable ajustée, jamais en dessous de l'arrondi (une durée ne tombe pas à 0). */
function ajuster(v: number | null, pct: number, arrondi: number): number | null {
  if (v == null || v <= 0) return v
  return Math.max(arrondi, appliquerPourcentage(v, pct, arrondi))
}

export function adapterLignesGaia(lignes: LigneSeanceLibre[], pct: number): LigneSeanceLibre[] {
  if (!pct) return lignes
  return lignes.map((l): LigneSeanceLibre => {
    switch (l.type) {
      case 'exercice':
        // En secondes (gainage…), « reps » est une durée : on l'ajuste aussi.
        return { ...l, charge_kg: ajuster(l.charge_kg, pct, 0.5), reps: l.unite === 'secondes' ? ajuster(l.reps, pct, 5) : l.reps }
      case 'bloc':
        return { ...l, duree_min: ajuster(l.duree_min, pct, 1), distance_m: ajuster(l.distance_m, pct, 25) }
      case 'mouvement':
        return { ...l, duree_sec: ajuster(l.duree_sec, pct, 5) }
      case 'intervalles':
        // Seul l'effort change : la récupération reste identique.
        return { ...l, effort_sec: ajuster(l.effort_sec, pct, 5) }
      case 'circuit':
        return { ...l, mouvements: l.mouvements.map((m) => ({ ...m, duree_sec: ajuster(m.duree_sec, pct, 5) })) }
      default:
        return l
    }
  })
}

export function adapterPosturesGaia(postures: PostureYoga[], pct: number): PostureYoga[] {
  if (!pct) return postures
  return postures.map((p) => ({ ...p, dureeSec: ajuster(p.dureeSec, pct, 5) ?? p.dureeSec }))
}

/** Texte de la bannière pour les sports ajustés en durée / distance / charge. */
export function messageGaiaTousSports(phase: Phase, pct: number): string {
  const label = PHASES_DESIGN[phase].label
  if (pct === 0) return `${label} — pas d'ajustement particulier aujourd'hui.`
  return `${label} — durées, distances et charges ajustées de ${pct > 0 ? '+' : ''}${pct}% (réglable dans Paramètres).`
}
