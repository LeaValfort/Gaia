import type { DerniereCharge, Exercice, ExerciceAdapte } from '@/types'

const SANS_REGlageCharge = new Set<string>([
  'Pompes',
  'Fentes alternées',
  'Planche',
  'Dips sur chaise',
  'Squat',
])

export function exCatalogVersAdapte(e: Exercice): ExerciceAdapte {
  return {
    nom: e.nom,
    muscles: e.muscles,
    categorie: e.categorie,
    seriesDefaut: e.seriesDefaut,
    repsDefaut: e.repsDefaut,
    unite: e.unite,
    reposSecondes: e.reposSecondes,
    description: e.description,
    conseil: e.conseil,
    seriesAdaptees: e.seriesDefaut,
    repsAdaptees: e.repsDefaut,
    chargeProposee: null,
    chargeOriginale: null,
    estAdapte: false,
  }
}

export function exSansChargeDumbbell(nom: string): boolean {
  return SANS_REGlageCharge.has(nom)
}

export function pctAdapte(ex: ExerciceAdapte): number | null {
  if (!ex.estAdapte) return null
  if (ex.repsDefaut > 0 && ex.repsAdaptees !== ex.repsDefaut) {
    return Math.round((1 - ex.repsAdaptees / ex.repsDefaut) * 100)
  }
  return -30
}

export function enrichirDepuisCatalog(ad: ExerciceAdapte[], cat: Exercice[]): ExerciceAdapte[] {
  const m = new Map(cat.map((e) => [e.nom, e]))
  return ad.map((x) => {
    const c = m.get(x.nom)
    if (!c) return x
    return {
      ...x,
      muscles: c.muscles,
      description: c.description,
      conseil: c.conseil,
      categorie: c.categorie,
    }
  })
}

export function avecDernierPoids(
  a: ExerciceAdapte,
  d: DerniereCharge | undefined
): ExerciceAdapte {
  if (!d) return a
  return {
    ...a,
    chargeOriginale: d.weight_kg,
    chargeProposee: a.chargeProposee ?? d.weight_kg,
  }
}

export function dureeFaitsSecondes(faits: string[], list: ExerciceAdapte[]): number {
  const done = new Set(faits)
  let s = 0
  for (const e of list) {
    if (!done.has(e.nom)) continue
    if (e.unite === 'secondes') s += e.seriesAdaptees * e.repsAdaptees
    else s += e.seriesAdaptees * e.repsAdaptees * 45
    s += Math.max(0, e.seriesAdaptees - 1) * e.reposSecondes
  }
  return s
}
