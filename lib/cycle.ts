import {
  differenceInDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns'
import type { Phase } from '@/types'

// ------------------------------------------------------------
// Calculs du cycle
// ------------------------------------------------------------

export function getPhaseForDay(day: number, cycleLength: number): Phase {
  if (day <= 4) return 'menstruation'
  if (day <= Math.round(cycleLength * 0.42)) return 'folliculaire'
  if (day <= Math.round(cycleLength * 0.54)) return 'ovulation'
  return 'luteale'
}

export function getCycleDay(
  lastStartDate: Date,
  today: Date,
  cycleLength: number
): number {
  const diff = differenceInDays(today, lastStartDate)
  // Si la date de début est dans le futur, on est au jour 1
  if (diff < 0) return 1
  return (diff % cycleLength) + 1
}

// ------------------------------------------------------------
// Informations et conseils par phase
// ------------------------------------------------------------

export interface InfosPhase {
  label: string
  couleurFond: string
  couleurTexte: string
  couleurBadge: string
  conseilSport: string
  conseilAlimentation: string
}

const INFOS_PAR_PHASE: Record<Phase, InfosPhase> = {
  menstruation: {
    label: 'Menstruation',
    couleurFond: 'bg-teal-50 dark:bg-teal-950/40',
    couleurTexte: 'text-teal-700 dark:text-teal-300',
    couleurBadge: 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200',
    conseilSport: 'Repos et douceur — yoga yin ou marche légère. Écoute ton corps.',
    conseilAlimentation: 'Privilégie le fer (légumineuses, épinards), le magnésium et le chocolat noir.',
  },
  folliculaire: {
    label: 'Folliculaire',
    couleurFond: 'bg-amber-50 dark:bg-amber-950/40',
    couleurTexte: 'text-amber-700 dark:text-amber-300',
    couleurBadge: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
    conseilSport: 'Énergie en hausse — idéal pour la musculation et les séances intenses.',
    conseilAlimentation: 'Aliments fermentés, protéines maigres et oméga-3 pour soutenir l\'ovulation.',
  },
  ovulation: {
    label: 'Ovulation',
    couleurFond: 'bg-red-50 dark:bg-red-950/40',
    couleurTexte: 'text-red-700 dark:text-red-300',
    couleurBadge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    conseilSport: 'Pic d\'énergie ! Parfait pour les défis : HIIT, escalade, natation intensive.',
    conseilAlimentation: 'Fibres, légumes crucifères et antioxydants pour équilibrer les œstrogènes.',
  },
  luteale: {
    label: 'Lutéale',
    couleurFond: 'bg-purple-50 dark:bg-purple-950/40',
    couleurTexte: 'text-purple-700 dark:text-purple-300',
    couleurBadge: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    conseilSport: 'Préfère le yoga flow ou la natation douce. Réduis l\'intensité progressivement.',
    conseilAlimentation: 'Magnésium (noix, graines), glucides complexes et évite la caféine.',
  },
}

export function getInfosPhase(phase: Phase): InfosPhase {
  return INFOS_PAR_PHASE[phase]
}

// ------------------------------------------------------------
// Calendrier mensuel
// ------------------------------------------------------------

/**
 * Génère la grille du calendrier (semaines × jours) pour un mois donné.
 * mois : 0-indexé (0 = janvier), comme le constructeur Date standard.
 */
export function genererJoursCalendrier(annee: number, mois: number): Date[][] {
  const debutMois = startOfMonth(new Date(annee, mois))
  const finMois = endOfMonth(debutMois)
  const debutGrille = startOfWeek(debutMois, { weekStartsOn: 1 }) // Semaine commence lundi
  const finGrille = endOfWeek(finMois, { weekStartsOn: 1 })

  const tousJours = eachDayOfInterval({ start: debutGrille, end: finGrille })

  // Découpe en lignes de 7 jours
  const semaines: Date[][] = []
  for (let i = 0; i < tousJours.length; i += 7) {
    semaines.push(tousJours.slice(i, i + 7))
  }
  return semaines
}

/**
 * Retourne la phase et le jour du cycle pour une date donnée.
 */
export function getInfosJour(
  date: Date,
  lastStartDate: Date,
  cycleLength: number
): { phase: Phase; jourDuCycle: number } {
  const jourDuCycle = getCycleDay(lastStartDate, date, cycleLength)
  const phase = getPhaseForDay(jourDuCycle, cycleLength)
  return { phase, jourDuCycle }
}
