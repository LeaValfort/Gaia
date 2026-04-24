import { EXERCICES } from '@/lib/data/exercises'
import type { Exercice, ExerciceCustom, Lieu, TypeSeanceMuscu, TypeSeanceMuscle } from '@/types'

export function typeMuscuVersPlanning(t: TypeSeanceMuscle): TypeSeanceMuscu {
  return t === 'full_body' ? 'muscu_full' : 'muscu_upper'
}

export function planningVersTypeMuscu(t: TypeSeanceMuscu): TypeSeanceMuscle {
  return t === 'muscu_full' ? 'full_body' : 'upper_lower'
}

export function exerciceVersCustom(e: Exercice, ordre: number): ExerciceCustom {
  return {
    nom: e.nom,
    seriesDefaut: e.seriesDefaut,
    repsDefaut: e.repsDefaut,
    unite: e.unite,
    reposSecondes: e.reposSecondes,
    ordre,
  }
}

export function exercicesToCustom(list: Exercice[]): ExerciceCustom[] {
  return list.map((e, i) => exerciceVersCustom(e, i))
}

/**
 * Reconstruit des {@link Exercice} affichables à partir d’une liste custom
 * (même ordre) en réinjectant le catalogue quand c’est possible.
 */
export function exercicesDepuisCustom(
  customs: ExerciceCustom[],
  type: TypeSeanceMuscle,
  _lieu: Lieu
): Exercice[] {
  return [...customs]
    .sort((a, b) => a.ordre - b.ordre)
    .map((c) => {
      const base = EXERCICES.find((ex) => ex.nom === c.nom)
      if (base) {
        return {
          ...base,
          seriesDefaut: c.seriesDefaut,
          repsDefaut: c.repsDefaut,
          unite: c.unite,
          reposSecondes: c.reposSecondes,
        }
      }
      return {
        nom: c.nom,
        muscles: [] as string[],
        categorie: 'isolation' as const,
        seance: type,
        lieu: 'both' as const,
        seriesDefaut: c.seriesDefaut,
        repsDefaut: c.repsDefaut,
        unite: c.unite,
        reposSecondes: c.reposSecondes,
        description: '',
        conseil: '',
        progression: '',
      }
    })
}
