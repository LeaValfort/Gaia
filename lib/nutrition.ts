// Logique métier nutrition + constantes partagées entre composants.
// Les données statiques de la checklist vivent dans lib/data/nutrition.ts.

import { startOfWeek, format } from 'date-fns'
import type { Phase, TypeJournee, MacrosCiblesJour } from '@/types'
import type { ItemChecklist } from '@/lib/data/nutrition'

// ------------------------------------------------------------
// Macros par type de journée
// ------------------------------------------------------------

export const MACROS_JOURNEE: Record<TypeJournee, {
  kcal: number; proteines: number; glucides: number; lipides: number
}> = {
  sport:  { kcal: 1800, proteines: 120, glucides: 200, lipides: 55 },
  yoga:   { kcal: 1700, proteines: 120, glucides: 170, lipides: 58 },
  repos:  { kcal: 1620, proteines: 120, glucides: 155, lipides: 62 },
  regles: { kcal: 1800, proteines: 115, glucides: 175, lipides: 65 },
}

export const LABELS_JOURNEE: Record<TypeJournee, string> = {
  sport: '🏋️ Sport', yoga: '🧘 Yoga', repos: '😌 Repos', regles: '🩸 Règles',
}

// ------------------------------------------------------------
// Aliments stars et styles par phase
// ------------------------------------------------------------

export const ALIMENTS_STARS: Record<Phase, string[]> = {
  menstruation: ['Lentilles 🫘', 'Épinards', 'Chocolat noir 🍫', 'Gingembre 🫚', 'Saumon 🐟', 'Amandes'],
  folliculaire: ['Saumon 🐟', 'Kéfir', 'Pois chiches', 'Graines courge 🌰', 'Avocat 🥑', 'Maquereau'],
  ovulation:    ['Brocoli 🥦', 'Betterave', 'Grenade 🍷', 'Myrtilles 🫐', 'Lin', 'Chou kale'],
  luteale:      ['Patate douce 🍠', 'Avoine', 'Noix 🥜', 'Quinoa', 'Chocolat noir 🍫', 'Banane 🍌'],
}

export const PHASE_STYLES: Record<Phase, { pill: string; border: string; bg: string }> = {
  menstruation: { pill: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',         border: 'border-red-300 dark:border-red-700',     bg: 'bg-red-50 dark:bg-red-900/20' },
  folliculaire: { pill: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ovulation:    { pill: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  luteale:      { pill: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700', bg: 'bg-purple-50 dark:bg-purple-900/20' },
}

export const LISTE_COURSES_PHASE: Record<Phase, string[]> = {
  menstruation: ['Lentilles', 'Épinards', 'Viande rouge maigre', 'Saumon', 'Lait végétal', 'Amandes', 'Chocolat noir 85%', 'Graines de lin', 'Bananes', 'Myrtilles', 'Quinoa', 'Brocoli', 'Patate douce', 'Sardines', 'Gingembre frais'],
  folliculaire: ['Saumon', 'Maquereau', 'Tofu', 'Kéfir', 'Avocat', 'Pois chiches', 'Graines de courge', 'Noix de cajou', 'Quinoa', 'Riz complet', 'Framboises', 'Citron', 'Hummus', 'Yaourt grec', 'Graines de lin'],
  ovulation:    ['Brocoli', 'Chou-fleur', 'Chou kale', 'Betterave', 'Grenade', 'Myrtilles', 'Graines de lin', 'Pois chiches', 'Lentilles corail', 'Saumon', 'Crevettes', 'Curcuma', 'Lait de coco', 'Quinoa', 'Tahini'],
  luteale:      ['Patate douce', 'Quinoa', 'Avoine', 'Noix', 'Amandes', 'Chocolat noir 85%', 'Bananes', 'Lentilles', 'Riz complet', 'Lait de coco', 'Gingembre', 'Cannelle', "Beurre d'amande", 'Graines de lin', 'Dattes'],
}

// ------------------------------------------------------------
// Fonctions utilitaires
// ------------------------------------------------------------

/**
 * Retourne le lundi de la semaine pour une date donnée.
 * Format ISO "YYYY-MM-DD".
 */
export function getLundiSemaine(date: Date): string {
  const lundi = startOfWeek(date, { weekStartsOn: 1 })
  return format(lundi, 'yyyy-MM-dd')
}

/**
 * Calcule le score de la checklist (ex: { fait: 11, total: 15, pourcentage: 73 }).
 */
export function calculerScoreChecklist(
  checklist: Record<string, boolean>,
  items: ItemChecklist[]
): { fait: number; total: number; pourcentage: number } {
  const total = items.length
  const fait = items.filter((item) => checklist[item.id] === true).length
  const pourcentage = total > 0 ? Math.round((fait / total) * 100) : 0
  return { fait, total, pourcentage }
}

/**
 * Retourne un message d'encouragement selon le score.
 */
export function getMessageScore(pourcentage: number): string {
  if (pourcentage <= 30) return "C'est un début 💪"
  if (pourcentage <= 60) return 'Bonne semaine !'
  if (pourcentage <= 90) return 'Très bien ! 🌿'
  return 'Semaine parfaite 🌟'
}

// ------------------------------------------------------------
// Type de journée selon le planning hebdomadaire
// ------------------------------------------------------------

const PLANNING_SEMAINE: Record<number, TypeJournee> = {
  0: 'repos', 1: 'sport', 2: 'yoga', 3: 'sport', 4: 'yoga', 5: 'sport', 6: 'repos',
}

/** Retourne le type de journée pour une date selon le planning. */
export function getTypeJournee(date: Date): TypeJournee {
  return PLANNING_SEMAINE[date.getDay()]
}

/**
 * Type de journée utilisé pour les cibles macros (plan, jour, récap).
 * En suivi cycle : les jours de menstruation utilisent les objectifs « règles ».
 */
export function getTypeJourneeEffectifMacros(
  phase: Phase,
  typeJournee: TypeJournee,
  sansSuiviCycle?: boolean
): TypeJournee {
  if (sansSuiviCycle) return typeJournee
  return phase === 'menstruation' ? 'regles' : typeJournee
}

function macrosNumeriquesDepuisTypeEffectif(typeEffectif: TypeJournee): Pick<
  MacrosCiblesJour,
  'calories' | 'proteines' | 'glucides' | 'lipides'
> {
  const m = MACROS_JOURNEE[typeEffectif]
  return {
    calories: m.kcal,
    proteines: m.proteines,
    glucides: m.glucides,
    lipides: m.lipides,
  }
}

/**
 * Calcule les macros cibles du jour selon la phase et le type de journée.
 * Même table `MACROS_JOURNEE` que le plan hebdo et le récap repas.
 */
export function calculerMacrosJour(phase: Phase, typeJournee: TypeJournee): MacrosCiblesJour {
  const typeEffectif = getTypeJourneeEffectifMacros(phase, typeJournee, false)
  const macros = macrosNumeriquesDepuisTypeEffectif(typeEffectif)
  const labelType: Record<TypeJournee, string> = { sport: 'Jour de sport', yoga: 'Séance yoga', repos: 'Jour de repos', regles: 'Phase de règles' }
  const labelPhase: Record<Phase, string> = { menstruation: 'règles', folliculaire: 'folliculaire', ovulation: 'ovulatoire', luteale: 'lutéale' }
  return { ...macros, typeJournee: typeEffectif, phase, message: `${labelType[typeEffectif]} — phase ${labelPhase[phase]}` }
}

/** Macros du jour sans suivi de cycle (type de journée uniquement, anti-inflammatoire général). */
export function calculerMacrosJourSansCycle(typeJournee: TypeJournee): MacrosCiblesJour {
  const macros = macrosNumeriquesDepuisTypeEffectif(typeJournee)
  const labelType: Record<TypeJournee, string> = {
    sport: 'Jour de sport',
    yoga: 'Séance yoga',
    repos: 'Jour de repos',
    regles: 'Jour réconfort',
  }
  return {
    ...macros,
    typeJournee,
    phase: 'folliculaire',
    message: `${labelType[typeJournee]} — objectifs anti-inflammatoires généraux`,
  }
}

// ------------------------------------------------------------
// Ingrédients (texte ou ancien JSON stringifié en base)
// ------------------------------------------------------------

/** Retire les morceaux de JSON / guillemets collés par erreur (ex. `c. à s."}`). */
export function nettoyerSuffixeQuantite(q: string): string {
  return q
    .replace(/"\s*,?\s*"?\s*quantite.*$/i, '')
    .replace(/"\s*\}\s*$/g, '')
    .replace(/,\s*"?\s*\}\s*$/g, '')
    .replace(/"+$/g, '')
    .trim()
}

/** Retire une fusion « … 20 × … » collée par erreur dans le nom (fin ou milieu du libellé). */
function nettoyerFusionFuiteDansNom(nom: string): string {
  let s = nom.trim()
  s = s.replace(/\s+\d+\s*×\s+(?=[a-zàâäéèêëïîôùûüçœæ])/giu, ' ')
  s = s.replace(/\s+\d+\s*×\s*.+$/u, '').trim()
  s = s.replace(/["\s,}]+\s*$/u, '').trim()
  return s.replace(/\s+/g, ' ').trim()
}

/** Extrait nom / quantité même si le JSON est tronqué ou mal formé. */
function extraireChampsJsonIngredient(t: string): { nom: string; quantite: string | null } | null {
  if (!/"nom"\s*:/i.test(t)) return null
  const nomM = t.match(/"nom"\s*:\s*"((?:[^"\\]|\\.)*)"/i)
  const nom = nomM?.[1]?.replace(/\\"/g, '"') || null
  if (!nom) return null
  const qStrM = t.match(/"quantite"\s*:\s*"((?:[^"\\]|\\.)*)"/i)
  const qNumM = t.match(/"quantite"\s*:\s*(\d+(?:[.,]\d+)?)(?=\s*[,}])/i)
  let quantite: string | null = qStrM?.[1]?.replace(/\\"/g, '"') ?? null
  if (quantite == null && qNumM) quantite = qNumM[1].replace(',', '.')
  if (quantite) quantite = nettoyerSuffixeQuantite(quantite)
  return { nom: nettoyerFusionFuiteDansNom(nom), quantite }
}

/** Détecte les lignes du type {"nom":"basil","quantite":"2 c. à s."} */
export function parseIngredientLine(ligne: string): {
  nom: string
  quantite: string | null
  source: 'json' | 'texte'
} {
  const t = ligne.trim().replace(/^\uFEFF/, '')

  // Toujours tenter l’extraction regex si une clé "nom" est présente (JSON cassé, texte mélangé, etc.)
  if (/"nom"\s*:/i.test(t)) {
    const ext = extraireChampsJsonIngredient(t)
    if (ext && ext.nom.length > 0) {
      return { nom: ext.nom, quantite: ext.quantite, source: 'json' }
    }
    try {
      const debut = t.indexOf('{')
      const fin = t.lastIndexOf('}')
      const slice = debut >= 0 && fin > debut ? t.slice(debut, fin + 1) : t
      const o = JSON.parse(slice) as { nom?: string; quantite?: string | number | null }
      const nom = typeof o.nom === 'string' ? o.nom : null
      if (nom) {
        const q =
          o.quantite != null && String(o.quantite).trim() !== ''
            ? nettoyerSuffixeQuantite(String(o.quantite).trim())
            : null
        return { nom: nettoyerFusionFuiteDansNom(nom), quantite: q, source: 'json' }
      }
    } catch {
      /* ignore */
    }
  }

  const sansFuite = nettoyerFusionFuiteDansNom(t)
  return { nom: sansFuite, quantite: null, source: 'texte' }
}

/** Affichage sur une ligne (recettes, listes). */
export function formaterLigneIngredient(ligne: string): string {
  const { nom, quantite, source } = parseIngredientLine(ligne)
  if (source === 'json' && quantite) return `${quantite} ${nom}`.trim()
  if (source === 'json') return nom
  return ligne.trim()
}

/** Nom / quantité pour articles de courses (corrige les anciens JSON dans `nom`). */
export function normaliserAffichageArticleCourses(
  nom: string,
  quantite: string | null
): { nom: string; quantite: string | null } {
  const p = parseIngredientLine(nom)
  let qCol = quantite?.trim() ? nettoyerSuffixeQuantite(quantite.trim()) : null
  if (qCol && /"nom"\s*:/i.test(qCol)) {
    const pq = parseIngredientLine(qCol)
    if (pq.source === 'json') {
      qCol = pq.quantite ?? pq.nom
    }
  }
  if (p.source === 'json') {
    return {
      nom: p.nom,
      quantite: p.quantite ?? (qCol && !qCol.startsWith('{') ? qCol : null),
    }
  }
  const nomOut = nettoyerFusionFuiteDansNom(p.nom)
  return { nom: nomOut, quantite: qCol || null }
}
