import {
  addDays,
  differenceInCalendarDays,
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { CONSEILS_PHASE_DETAILS, type ConseilsPhaseDetail } from '@/lib/data/conseils-phase-cycle'
import type { Cycle, CycleStats, Phase, PredictionPhase, UserPreferences } from '@/types'

// ------------------------------------------------------------
// Calculs du cycle
// ------------------------------------------------------------

export function getPhaseForDay(day: number, cycleLength: number): Phase {
  if (day <= 4) return 'menstruation'
  if (day <= Math.round(cycleLength * 0.42)) return 'folliculaire'
  if (day <= Math.round(cycleLength * 0.54)) return 'ovulation'
  return 'luteale'
}

/**
 * Jour du cycle (1..L) par rapport à l’ancre = premier jour des dernières règles enregistrées.
 * Cycles de longueur L se répètent toutes les L jours. Pour une date *avant* l’ancre, on
 * replie le cycle en arrière (sinon toute la grille passée s’affichait à tort en jour 1 = règles).
 */
export function getCycleDay(
  lastStartDate: Date,
  day: Date,
  cycleLength: number
): number {
  const L = Math.max(1, Math.round(cycleLength))
  const anchor = startOfDay(lastStartDate)
  const t = startOfDay(day)
  const diff = differenceInDays(t, anchor)
  if (diff >= 0) {
    return (diff % L) + 1
  }
  const daysBefore = -diff
  const back = L * Math.ceil(daysBefore / L)
  const cycleStart = addDays(anchor, -back)
  return differenceInDays(t, cycleStart) + 1
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
    couleurFond: 'bg-red-50 dark:bg-red-950/40',
    couleurTexte: 'text-red-700 dark:text-red-300',
    couleurBadge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
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
    couleurFond: 'bg-rose-50 dark:bg-rose-950/40',
    couleurTexte: 'text-rose-700 dark:text-rose-300',
    couleurBadge: 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200',
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

/** Phase du jour + infos conseils (pour la page Cycle ou l’accueil). */
export function getPhaseEtConseilAujourdhui(
  prefs: Pick<UserPreferences, 'last_cycle_start' | 'cycle_length'> | null
): { jourDuCycle: number; phase: Phase; infos: InfosPhase } | null {
  if (!prefs?.last_cycle_start) return null
  const today = new Date()
  const lastStart = new Date(prefs.last_cycle_start)
  const jourDuCycle = getCycleDay(lastStart, today, prefs.cycle_length)
  const phase = getPhaseForDay(jourDuCycle, prefs.cycle_length)
  return { jourDuCycle, phase, infos: getInfosPhase(phase) }
}

// ------------------------------------------------------------
// Apprentissage (historique cycles + stats)
// ------------------------------------------------------------

const F_RATIO_APP = 7 / 22
const O_RATIO_APP = 3 / 22

/** Durée en jours entre le début d’un cycle et le début du suivant. */
export function calculerDureeCycleReel(debutISO: string, debutSuivantISO: string): number {
  return differenceInDays(parseISO(debutSuivantISO), parseISO(debutISO))
}

export function detecterNouveauCycle(
  nouvelleDateDebutISO: string,
  dernierDebutConnuISO: string | null
): boolean {
  if (!dernierDebutConnuISO) return true
  return parseISO(nouvelleDateDebutISO).getTime() >= parseISO(dernierDebutConnuISO).getTime()
}

type StatsPhases = Pick<
  CycleStats,
  | 'phase_menstruation_j'
  | 'phase_folliculaire_j'
  | 'phase_ovulation_j'
  | 'phase_luteale_j'
  | 'nb_cycles_utilise'
>

function normalisePhasesDepuisStats(
  stats: StatsPhases,
  cycleLength: number
): [number, number, number, number] {
  let m = Math.max(1, Math.round(stats.phase_menstruation_j ?? 4))
  let f = Math.max(0, Math.round(stats.phase_folliculaire_j ?? 0))
  let o = Math.max(0, Math.round(stats.phase_ovulation_j ?? 0))
  let l = Math.max(0, Math.round(stats.phase_luteale_j ?? 0))
  const sum = m + f + o + l
  if (sum <= 0) {
    const menst = Math.min(4, Math.max(1, cycleLength - 3))
    const rest = Math.max(4, cycleLength - menst)
    const f0 = Math.round(rest * F_RATIO_APP)
    const o0 = Math.round(rest * O_RATIO_APP)
    const l0 = Math.max(0, rest - f0 - o0)
    return [menst, f0, o0, l0]
  }
  const scale = cycleLength / sum
  m = Math.max(1, Math.round(m * scale))
  f = Math.max(0, Math.round(f * scale))
  o = Math.max(0, Math.round(o * scale))
  l = cycleLength - m - f - o
  l = Math.max(0, l)
  return [m, f, o, l]
}

/** Phase du jour à partir des moyennes apprises ; sinon modèle proportionnel. */
export function getPhaseAvecStats(
  jourDuCycle: number,
  stats: StatsPhases | null,
  cycleLength: number
): Phase {
  if (!stats || stats.nb_cycles_utilise < 1) {
    return getPhaseForDay(jourDuCycle, cycleLength)
  }
  const [m, f, o] = normalisePhasesDepuisStats(stats, cycleLength)
  const c1 = m
  const c2 = c1 + f
  const c3 = c2 + o
  if (jourDuCycle <= c1) return 'menstruation'
  if (jourDuCycle <= c2) return 'folliculaire'
  if (jourDuCycle <= c3) return 'ovulation'
  return 'luteale'
}

/**
 * Phase du cycle pour une date calendaire (ISO `yyyy-MM-dd`), projetée depuis le
 * dernier début de cycle connu. À utiliser pour les vues semaine (plan repas, etc.).
 */
export function getPhasePourDateCalendrier(
  dateISO: string,
  effectiveStartISO: string,
  cycleLength: number,
  stats: CycleStats | null
): Phase {
  const jourDuCycle = getCycleDay(parseISO(effectiveStartISO), parseISO(dateISO), cycleLength)
  return getPhaseAvecStats(jourDuCycle, stats, cycleLength)
}

type EchantillonCycle = {
  L: number
  P: number
  f: number
  o: number
  l: number
  m: number
}

/**
 * Moyennes pondérées (×1,5 sur les deux derniers intervalles valides).
 * Intervalles &lt;18 ou &gt;45 j exclus.
 */
export function calculerStatsCycles(cyclesAsc: Cycle[]): Omit<
  CycleStats,
  'user_id' | 'derniere_maj'
> {
  const sorted = [...cyclesAsc].sort((a, b) => a.start_date.localeCompare(b.start_date))
  const n = sorted.length
  const samples: EchantillonCycle[] = []

  for (let i = 0; i < n - 1; i++) {
    const L = calculerDureeCycleReel(sorted[i].start_date, sorted[i + 1].start_date)
    if (L < 18 || L > 45) continue
    const P =
      sorted[i].period_length != null
        ? Math.min(Math.max(1, sorted[i].period_length!), L - 4)
        : Math.min(4, Math.max(1, L - 14))
    const nonMenst = Math.max(4, L - P)
    const f = Math.round(nonMenst * F_RATIO_APP)
    const o = Math.round(nonMenst * O_RATIO_APP)
    const l = nonMenst - f - o
    samples.push({ L, P, f, o, l, m: P })
  }

  if (samples.length === 0) {
    return {
      cycle_length_moyen: null,
      period_length_moyen: null,
      phase_menstruation_j: null,
      phase_folliculaire_j: null,
      phase_ovulation_j: null,
      phase_luteale_j: null,
      nb_cycles_utilise: 0,
      fiabilite: 'faible',
    }
  }

  const k = samples.length
  const weights = samples.map((_, i) => (i >= k - 2 ? 1.5 : 1))
  const wsum = weights.reduce((a, b) => a + b, 0)

  const moyennePonderee = (extract: (s: EchantillonCycle) => number) =>
    samples.reduce((acc, s, i) => acc + extract(s) * weights[i], 0) / wsum

  const cycle_length_moyen = Math.round(moyennePonderee((s) => s.L))
  const period_length_moyen = Math.round(moyennePonderee((s) => s.P))
  const phase_menstruation_j = Math.round(moyennePonderee((s) => s.m))
  const phase_folliculaire_j = Math.round(moyennePonderee((s) => s.f))
  const phase_ovulation_j = Math.round(moyennePonderee((s) => s.o))
  const phase_luteale_j = Math.round(moyennePonderee((s) => s.l))

  const nb_cycles_utilise = k
  const fiabilite: CycleStats['fiabilite'] =
    k >= 5 ? 'haute' : k >= 2 ? 'moyenne' : 'faible'

  return {
    cycle_length_moyen,
    period_length_moyen,
    phase_menstruation_j,
    phase_folliculaire_j,
    phase_ovulation_j,
    phase_luteale_j,
    nb_cycles_utilise,
    fiabilite,
  }
}

/** Intervalle couvrant la grille du mois (semaines complètes). */
export function getIntervalGrilleCalendrier(annee: number, mois: number): {
  debut: Date
  fin: Date
} {
  const debutMois = startOfMonth(new Date(annee, mois))
  const finMois = endOfMonth(debutMois)
  const debutGrille = startOfWeek(debutMois, { weekStartsOn: 1 })
  const finGrille = endOfWeek(finMois, { weekStartsOn: 1 })
  return { debut: debutGrille, fin: finGrille }
}

/** Date prévue du prochain début de règles à partir de l’ancre d’affichage (même logique que le calendrier). */
export function datePrevueProchainesReglesDepuisAncre(
  anchorISO: string,
  cycleLengthEffectif: number,
  stats: CycleStats | null
): Date {
  const n = Math.round(Number(stats?.cycle_length_moyen ?? cycleLengthEffectif))
  const start = startOfDay(parseISO(anchorISO))
  return addDays(start, n)
}

/** Date prévue du prochain début de règles (ligne `cycles` la plus récente). */
export function datePrevueProchainesRegles(
  dernierCycle: Cycle,
  stats: CycleStats | null
): Date {
  return datePrevueProchainesReglesDepuisAncre(
    dernierCycle.start_date,
    dernierCycle.cycle_length,
    stats
  )
}

/**
 * Détecte le retard à partir de l’ancre réellement affichée (`effectiveStart`), y compris si aucune
 * ligne n’existe encore dans `cycles` (ancre = préférences uniquement).
 */
export function detecterRetardDepuisAncre(
  anchorISO: string,
  cycleLengthEffectif: number,
  stats: CycleStats | null,
  today: Date
): number | null {
  const today0 = startOfDay(today)
  const start = startOfDay(parseISO(anchorISO))
  if (isAfter(start, today0)) return null

  const n = Math.round(Number(stats?.cycle_length_moyen ?? cycleLengthEffectif))
  if (!Number.isFinite(n) || n < 10 || n > 60) return null

  const datePrevue = addDays(start, n)
  const limiteGraceFin = addDays(datePrevue, 1)
  if (!isAfter(today0, limiteGraceFin)) return null

  return differenceInCalendarDays(today0, limiteGraceFin)
}

/**
 * Détecte si les règles sont en retard.
 * Retourne null si pas de retard, sinon le nombre de jours après la fin de la fenêtre de grâce
 * (jour prévu + 1).
 */
export function detecterRetardRegles(
  dernierCycle: Cycle,
  stats: CycleStats | null,
  today: Date
): number | null {
  return detecterRetardDepuisAncre(
    dernierCycle.start_date,
    dernierCycle.cycle_length,
    stats,
    today
  )
}

/** Premier jour du calendrier à colorer en « retard » (J+2 après la date prévue des règles). */
export function premierJourAffichageRetardDepuisAncre(
  anchorISO: string,
  cycleLengthEffectif: number,
  stats: CycleStats | null
): string {
  const datePrevue = datePrevueProchainesReglesDepuisAncre(anchorISO, cycleLengthEffectif, stats)
  return format(addDays(datePrevue, 2), 'yyyy-MM-dd')
}

export function premierJourAffichageRetardISO(
  dernierCycle: Cycle,
  stats: CycleStats | null
): string {
  return premierJourAffichageRetardDepuisAncre(
    dernierCycle.start_date,
    dernierCycle.cycle_length,
    stats
  )
}

export function getConseilsPhase(phase: Phase): ConseilsPhaseDetail {
  return CONSEILS_PHASE_DETAILS[phase]
}

export type { ConseilsPhaseDetail }

export function genererPredictionsParIntervalle(
  debut: Date,
  fin: Date,
  anchorISO: string,
  cycleLength: number,
  stats: CycleStats | null,
  maintenant: Date = new Date()
): Record<string, PredictionPhase> {
  const anchor = parseISO(anchorISO)
  const today0 = startOfDay(maintenant)
  const map: Record<string, PredictionPhase> = {}
  const jours = eachDayOfInterval({ start: debut, end: fin })
  const fiabilite = stats?.fiabilite ?? 'faible'

  for (const d of jours) {
    const key = format(d, 'yyyy-MM-dd')
    const jourDuCycle = getCycleDay(anchor, d, cycleLength)
    const phase = getPhaseAvecStats(jourDuCycle, stats, cycleLength)
    const estPrediction = isAfter(startOfDay(d), today0)
    map[key] = { phase, jourDuCycle, estPrediction, fiabilite }
  }
  return map
}

/** Phase du jour avec stats + longueur effective (moyenne apprise ou préférence). */
export function getPhaseEtConseilAvecApprentissage(
  _prefs: Pick<UserPreferences, 'last_cycle_start' | 'cycle_length'> | null,
  stats: CycleStats | null,
  anchorISO: string | null,
  cycleLengthEffectif: number
): { jourDuCycle: number; phase: Phase; infos: InfosPhase; fiabilite: CycleStats['fiabilite'] } | null {
  if (!anchorISO) return null
  const today = new Date()
  const lastStart = parseISO(anchorISO)
  const jourDuCycle = getCycleDay(lastStart, today, cycleLengthEffectif)
  const phase = getPhaseAvecStats(jourDuCycle, stats, cycleLengthEffectif)
  const fiabilite = stats?.fiabilite ?? 'faible'
  return { jourDuCycle, phase, infos: getInfosPhase(phase), fiabilite }
}

export {
  PHASES_DESIGN,
  PHASE_DESIGN_ACCUEIL_NEUTRE,
  type PhaseDesign,
  designPhaseAffichage,
} from '@/lib/data/phases-design'

/** Courte phrase sous la barre de progression (page Aujourd’hui). */
export const CITATION_HERO_PAR_PHASE: Record<Phase, string> = {
  menstruation: 'Prends soin de toi 🌸',
  folliculaire: 'Ton énergie monte — avance à ton rythme ✨',
  ovulation: 'Pic de vitalité — écoute ton corps 🌿',
  luteale: 'Ralentis, hydrate-toi, sois douce avec toi 🌙',
}
