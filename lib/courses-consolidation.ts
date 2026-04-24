import type { ShoppingItemComplet } from '@/types'
import { normaliserAffichageArticleCourses, nettoyerSuffixeQuantite } from '@/lib/nutrition'

/** Clé stable pour regrouper (nom d’ingrédient normalisé). */
export function cleIngredientCourses(nom: string, quantite: string | null): string {
  const aff = normaliserAffichageArticleCourses(nom, quantite)
  return aff.nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9àâäéèêëïîôùûüçœæ\s-]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extraireNombreEtUnite(q: string): { n: number; suffixe: string } | null {
  const t = nettoyerSuffixeQuantite(q).trim()
  const seul = t.match(/^(\d+(?:[.,]\d+)?)$/i)
  if (seul) {
    return { n: parseFloat(seul[1].replace(',', '.')), suffixe: '' }
  }
  const m = t.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/i)
  if (!m) return null
  return {
    n: parseFloat(m[1].replace(',', '.')),
    suffixe: m[2].trim().toLowerCase().replace(/\s+/g, ' '),
  }
}

function suffixeBrutPourAffichage(q: string): string {
  const t = nettoyerSuffixeQuantite(q).trim()
  if (/^\d+(?:[.,]\d+)?$/i.test(t)) return ''
  const m = t.match(/^[\d.,]+\s*(.+)$/i)
  return m?.[1]?.trim() ?? t
}

/**
 * Fusionne les quantités : somme si même unité (ex. 20 × « 340.2 g » → « 6804 g »),
 * ou « N × q » si chaînes identiques sans nombre en tête.
 */
export function fusionnerQuantitesGroupe(quantites: (string | null)[]): string | null {
  const qs = quantites
    .map((q) => (q == null ? '' : nettoyerSuffixeQuantite(q.trim())))
    .filter((q) => q.length > 0)
  if (qs.length === 0) return null

  const unique = [...new Set(qs)]
  if (unique.length === 1) {
    const q = unique[0]
    const parsed = extraireNombreEtUnite(q)
    if (parsed && qs.length > 1) {
      const total = parsed.n * qs.length
      const arrondi =
        Math.abs(total - Math.round(total)) < 1e-6
          ? String(Math.round(total))
          : String(Math.round(total * 10) / 10).replace(/\.0$/, '')
      const aff = suffixeBrutPourAffichage(q)
      return aff ? `${arrondi} ${aff}`.trim() : arrondi
    }
    if (qs.length > 1) return `${qs.length} × ${q}`
    return q
  }

  const parsedAll = qs.map((x) => extraireNombreEtUnite(x))
  if (parsedAll.every((p): p is NonNullable<typeof p> => p !== null)) {
    const u0 = parsedAll[0].suffixe
    if (parsedAll.every((p) => p.suffixe === u0)) {
      const sum = parsedAll.reduce((acc, p) => acc + p.n, 0)
      const arrondi =
        Math.abs(sum - Math.round(sum)) < 1e-6
          ? String(Math.round(sum))
          : String(Math.round(sum * 10) / 10).replace(/\.0$/, '')
      const aff = suffixeBrutPourAffichage(qs[0])
      return aff ? `${arrondi} ${aff}`.trim() : arrondi
    }
  }
  return qs.join(' + ')
}

export interface ArticleCourseGroupe {
  cle: string
  nomAffiche: string
  ids: string[]
  quantiteAffiche: string | null
  tousFaits: boolean
}

function meilleurNomAffiche(list: ShoppingItemComplet[]): string {
  const noms = list.map((x) => normaliserAffichageArticleCourses(x.nom, x.quantite).nom)
  const propre = noms.find((n) => !n.includes('{') && !/"nom"\s*:/i.test(n))
  return propre ?? noms[0]
}

export function grouperArticlesCourses(articles: ShoppingItemComplet[]): ArticleCourseGroupe[] {
  const buckets = new Map<string, ShoppingItemComplet[]>()
  for (const a of articles) {
    const cle = cleIngredientCourses(a.nom, a.quantite)
    const list = buckets.get(cle) ?? []
    list.push(a)
    buckets.set(cle, list)
  }

  const groupes: ArticleCourseGroupe[] = []
  for (const [, list] of buckets) {
    const quantites = list.map((x) => normaliserAffichageArticleCourses(x.nom, x.quantite).quantite)
    const qFusion = fusionnerQuantitesGroupe(quantites)
    groupes.push({
      cle: cleIngredientCourses(list[0].nom, list[0].quantite),
      nomAffiche: meilleurNomAffiche(list),
      ids: list.map((x) => x.id),
      quantiteAffiche: qFusion,
      tousFaits: list.every((x) => x.fait),
    })
  }

  groupes.sort((a, b) => a.nomAffiche.localeCompare(b.nomAffiche, 'fr'))
  return groupes
}
