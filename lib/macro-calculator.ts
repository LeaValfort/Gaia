import type {
  MacroProfile,
  MacrosJour,
  NiveauActivite,
  Objectif,
  Phase,
} from '@/types'

/** Type de journée pour le calcul des macros (profil personnalisé). */
export type TypeJourneeMacros = 'sport' | 'repos' | 'cycle'

// —— Mifflin-St Jeor (femme) ——
const POIDS_COEFF_MB = 10
const TAILLE_COEFF_MB = 6.25
const AGE_COEFF_MB = 5
const OFFSET_MB_FEMME = 161

// —— Multiplicateurs d'activité (TDEE) ——
const MULT_SEDENTAIRE = 1.2
const MULT_LEGER = 1.375
const MULT_MODERE = 1.55
const MULT_ACTIF = 1.725

const MULTIPLICATEUR_ACTIVITE: Record<NiveauActivite, number> = {
  sedentaire: MULT_SEDENTAIRE,
  leger: MULT_LEGER,
  modere: MULT_MODERE,
  actif: MULT_ACTIF,
}

// —— Ajustement pas quotidiens ——
const PAS_SEUIL_BAS = 5000
const PAS_SEUIL_MOYEN = 8000
const PAS_SEUIL_HAUT = 12000
const AJUSTEMENT_PAS_BAS = -50
const AJUSTEMENT_PAS_MOYEN = 0
const AJUSTEMENT_PAS_ELEVE = 100
const AJUSTEMENT_PAS_TRES_ELEVE = 200

// —— Ajustement sommeil ——
const SOMMEIL_HEURES_SANS_AJUST = 7
const SOMMEIL_HEURES_6 = 6
const SOMMEIL_HEURES_COURT_MAX = 5
const RATIO_GLUCIDES_BONUS_6H = 1.05
const RATIO_GLUCIDES_BONUS_5H_ET_MOINS = 1.1
const RATIO_GLUCIDES_NEUTRE = 1
const REDUCTION_DEFICIT_SOMMEIL_COURT_KCAL = 50

// —— Ajustement phase du cycle ——
const AJUSTEMENT_KCAL_MENSTRUATION = -100
const AJUSTEMENT_KCAL_FOLLICULAIRE = 0
const AJUSTEMENT_KCAL_OVULATION = 0
const AJUSTEMENT_KCAL_LUTEALE = 150

const AJUSTEMENT_PHASE: Record<Phase, number> = {
  menstruation: AJUSTEMENT_KCAL_MENSTRUATION,
  folliculaire: AJUSTEMENT_KCAL_FOLLICULAIRE,
  ovulation: AJUSTEMENT_KCAL_OVULATION,
  luteale: AJUSTEMENT_KCAL_LUTEALE,
}

// —— Ajustement objectif ——
const AJUSTEMENT_KCAL_PERTE_GRAS = -300
const AJUSTEMENT_KCAL_RECOMPO = -100
const AJUSTEMENT_KCAL_MAINTIEN = 0

const AJUSTEMENT_OBJECTIF: Record<Objectif, number> = {
  perte_gras: AJUSTEMENT_KCAL_PERTE_GRAS,
  recompo: AJUSTEMENT_KCAL_RECOMPO,
  maintien: AJUSTEMENT_KCAL_MAINTIEN,
}

// —— Répartition macros ——
const COEFF_PROTEINES_PAR_KG = 2
const PART_KCAL_LIPIDES = 0.25
const KCAL_PAR_GRAMME_LIPIDES = 9
const KCAL_PAR_GRAMME_PROTEINES = 4
const KCAL_PAR_GRAMME_GLUCIDES = 4

function ajustementPasQuotidiens(pas: number): number {
  if (pas < PAS_SEUIL_BAS) return AJUSTEMENT_PAS_BAS
  if (pas < PAS_SEUIL_MOYEN) return AJUSTEMENT_PAS_MOYEN
  if (pas < PAS_SEUIL_HAUT) return AJUSTEMENT_PAS_ELEVE
  return AJUSTEMENT_PAS_TRES_ELEVE
}

function ajustementSommeilKcal(sommeilHeures: number): number {
  if (sommeilHeures <= SOMMEIL_HEURES_COURT_MAX) return REDUCTION_DEFICIT_SOMMEIL_COURT_KCAL
  return 0
}

function ratioGlucidesSommeil(sommeilHeures: number): number {
  if (sommeilHeures >= SOMMEIL_HEURES_SANS_AJUST) return RATIO_GLUCIDES_NEUTRE
  if (sommeilHeures <= SOMMEIL_HEURES_COURT_MAX) return RATIO_GLUCIDES_BONUS_5H_ET_MOINS
  if (sommeilHeures >= SOMMEIL_HEURES_6) return RATIO_GLUCIDES_BONUS_6H
  return RATIO_GLUCIDES_NEUTRE
}

/**
 * Métabolisme de base — Mifflin-St Jeor (femme).
 * MB = (10 × poids) + (6.25 × taille) - (5 × âge) - 161
 */
export function calculerMB(poids: number, taille: number, age: number): number {
  const mb =
    POIDS_COEFF_MB * poids + TAILLE_COEFF_MB * taille - AGE_COEFF_MB * age - OFFSET_MB_FEMME
  return Math.round(mb)
}

/**
 * Dépense énergétique totale estimée (MB × activité + ajustement pas).
 */
export function calculerTDEE(mb: number, activite: NiveauActivite, pas: number): number {
  const multiplicateur = MULTIPLICATEUR_ACTIVITE[activite]
  const tdee = mb * multiplicateur + ajustementPasQuotidiens(pas)
  return Math.round(tdee)
}

/**
 * Macros du jour selon le profil, la phase et le type de journée.
 * Pipeline : TDEE → phase → objectif → sommeil (kcal) → répartition → bonus glucides sommeil.
 */
export function calculerMacrosJour(
  profil: MacroProfile,
  phase: Phase,
  typeJournee: TypeJourneeMacros
): MacrosJour {
  void typeJournee

  const mb = calculerMB(profil.poids_kg, profil.taille_cm, profil.age)
  let kcalTotal = calculerTDEE(mb, profil.activite, profil.pas_quotidiens)
  kcalTotal += AJUSTEMENT_PHASE[phase]
  kcalTotal += AJUSTEMENT_OBJECTIF[profil.objectif]
  kcalTotal += ajustementSommeilKcal(profil.sommeil_heures)

  const proteines = Math.round(profil.poids_kg * COEFF_PROTEINES_PAR_KG)
  const lipides = Math.round((kcalTotal * PART_KCAL_LIPIDES) / KCAL_PAR_GRAMME_LIPIDES)
  const kcalRestantes =
    kcalTotal - proteines * KCAL_PAR_GRAMME_PROTEINES - lipides * KCAL_PAR_GRAMME_LIPIDES
  let glucides = Math.round(kcalRestantes / KCAL_PAR_GRAMME_GLUCIDES)
  glucides = Math.round(glucides * ratioGlucidesSommeil(profil.sommeil_heures))

  return {
    kcal: kcalTotal,
    proteines,
    glucides,
    lipides,
  }
}
