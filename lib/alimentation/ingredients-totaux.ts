import { parseIngredientLine } from '@/lib/nutrition'
import type { Recipe } from '@/types'

/**
 * Liste totale des ingrédients de plusieurs recettes (session de batch cooking) :
 * mêmes ingrédients regroupés, quantités additionnées quand l'unité le permet
 * (g/kg → g, ml/cl/l → ml, nombres sans unité). Sinon, quantités listées telles quelles.
 */

export interface IngredientTotal {
  nom: string
  quantite: string
  recettes: string[]
}

const UNITES: Record<string, { base: 'g' | 'ml'; facteur: number }> = {
  g: { base: 'g', facteur: 1 },
  gr: { base: 'g', facteur: 1 },
  kg: { base: 'g', facteur: 1000 },
  ml: { base: 'ml', facteur: 1 },
  cl: { base: 'ml', facteur: 10 },
  l: { base: 'ml', facteur: 1000 },
}

function cle(nom: string): string {
  return nom.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()
}

/** « 120 g poulet » → { n: 120, unite: 'g', nom: 'poulet' } ; JSON ou texte libre gérés aussi. */
function analyser(ligne: string): { nom: string; n: number | null; unite: string; brut: string | null } {
  const p = parseIngredientLine(ligne)
  const texte = p.source === 'json' ? `${p.quantite ?? ''} ${p.nom}`.trim() : ligne.trim()
  const m = texte.match(/^(\d+(?:[.,]\d+)?)\s*(kg|gr|g|ml|cl|l)?\.?\s+(.+)$/i)
  if (!m) return { nom: p.source === 'json' ? p.nom : texte, n: null, unite: '', brut: p.quantite }
  return { nom: m[3].replace(/^(de |d’|d')/i, '').trim(), n: parseFloat(m[1].replace(',', '.')), unite: (m[2] ?? '').toLowerCase(), brut: null }
}

const fr = (n: number) => String(n).replace('.', ',')

function formater(total: number, base: string): string {
  if (base === 'g' && total >= 1000) return `${fr(Math.round(total / 100) / 10)} kg`
  if (base === 'ml' && total >= 1000) return `${fr(Math.round(total / 100) / 10)} L`
  return base ? `${Math.round(total)} ${base}` : fr(Math.round(total * 10) / 10)
}

export function ingredientsTotaux(recettes: Recipe[]): IngredientTotal[] {
  const groupes = new Map<string, { nom: string; totaux: Map<string, number>; autres: string[]; recettes: Set<string> }>()

  for (const r of recettes) {
    for (const ligne of r.ingredients) {
      const a = analyser(ligne)
      if (!a.nom) continue
      const k = cle(a.nom)
      const g = groupes.get(k) ?? { nom: a.nom, totaux: new Map<string, number>(), autres: [], recettes: new Set<string>() }
      g.recettes.add(r.nom)
      if (a.n != null) {
        const u = UNITES[a.unite]
        const base = u?.base ?? ''
        g.totaux.set(base, (g.totaux.get(base) ?? 0) + a.n * (u?.facteur ?? 1))
      } else if (a.brut) {
        g.autres.push(a.brut)
      }
      groupes.set(k, g)
    }
  }

  return [...groupes.values()]
    .map((g) => ({
      nom: g.nom,
      quantite: [...[...g.totaux].map(([base, t]) => formater(t, base)), ...g.autres].join(' + ') || 'selon ton goût',
      recettes: [...g.recettes],
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
}
