// Logique métier nutrition + constantes partagées entre composants.
// Les données statiques de la checklist vivent dans lib/data/nutrition.ts.

import { startOfWeek, format } from 'date-fns'
import type { Phase, TypeJournee, MacrosCiblesJour } from '@/types'
import type { ItemChecklist } from '@/lib/data/nutrition'
import { MACROS_PAR_JOURNEE } from '@/lib/data/nutrition'

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
  menstruation: { pill: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',     border: 'border-teal-300 dark:border-teal-700',   bg: 'bg-teal-50 dark:bg-teal-900/20' },
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
 * Calcule les macros cibles du jour selon la phase et le type de journée.
 * Si phase = menstruation, le type est forcé sur 'regles'.
 */
export function calculerMacrosJour(phase: Phase, typeJournee: TypeJournee): MacrosCiblesJour {
  const typeEffectif: TypeJournee = phase === 'menstruation' ? 'regles' : typeJournee
  const macros = MACROS_PAR_JOURNEE[typeEffectif]
  const labelType: Record<TypeJournee, string> = { sport: 'Jour de sport', yoga: 'Séance yoga', repos: 'Jour de repos', regles: 'Phase de règles' }
  const labelPhase: Record<Phase, string> = { menstruation: 'règles', folliculaire: 'folliculaire', ovulation: 'ovulatoire', luteale: 'lutéale' }
  return { ...macros, typeJournee: typeEffectif, phase, message: `${labelType[typeEffectif]} — phase ${labelPhase[phase]}` }
}
