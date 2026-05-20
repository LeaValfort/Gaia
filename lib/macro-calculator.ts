import { PROFILS_DEFAUT } from '@/types'
import type {
  IntensiteEffort,
  MacroProfile,
  MacrosJour,
  NiveauActivite,
  Objectif,
  Phase,
  ProfilEffort,
  TypeEffort,
} from '@/types'

/** Type de journée pour le calcul des macros (profil personnalisé). */
export type TypeJourneeMacros = 'sport' | 'repos' | 'cycle'

const SEANCE_TYPE_SPORT_DEFAUT = 'muscu_full'
const SEANCE_TYPE_REPOS_DEFAUT = 'repos'

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

// —— Objectif de poids (déficit / surplus) ——
const KCAL_PAR_KG_POIDS = 7700
const JOURS_PAR_MOIS = 30
const DEFICIT_MAX_KCAL = 500
const DEFICIT_MIN_KCAL = 100
const SURPLUS_MAX_KCAL = 200
const TOLERANCE_POIDS_MAINTIEN_KG = 0.05

/** Déficit de repli si pas de poids cible renseigné (kcal à soustraire du TDEE). */
const DEFICIT_FALLBACK_OBJECTIF: Record<Objectif, number> = {
  perte_gras: 300,
  recompo: 100,
  maintien: 0,
}

// —— Ratios glucides (part du TDEE, divisée par kcal/g glucides) ——
const RATIO_GLUCIDES_AUCUN = 0.3
const RATIO_GLUCIDES_LEGERE_MOBILITE = 0.35
const RATIO_GLUCIDES_LEGERE_CARDIO = 0.38
const RATIO_GLUCIDES_MODEREE_CARDIO = 0.45
const RATIO_GLUCIDES_MODEREE_MIXTE = 0.43
const RATIO_GLUCIDES_INTENSE_FORCE = 0.48
const RATIO_GLUCIDES_INTENSE_CARDIO = 0.5
const RATIO_GLUCIDES_FALLBACK = 0.4

// —— Coefficients protéines (g par kg de poids) ——
const COEFF_PROTEINES_AUCUN = 1.8
const COEFF_PROTEINES_LEGERE = 2
const COEFF_PROTEINES_MODEREE = 2.1
const COEFF_PROTEINES_INTENSE = 2.2

// —— Lipides ——
const LIPIDES_MIN_GRAMMES = 35
const KCAL_PAR_GRAMME_LIPIDES = 9
const KCAL_PAR_GRAMME_PROTEINES = 4
const KCAL_PAR_GRAMME_GLUCIDES = 4

// —— Ajustement durée séance ——
const DUREE_SEUIL_1H = 60
const DUREE_SEUIL_1H30 = 90
const KCAL_BONUS_DUREE_SUP_1H = 100
const KCAL_BONUS_DUREE_SUP_1H30 = 200

// —— Ajustement phase du cycle ——
const AJUSTEMENT_KCAL_MENSTRUATION = 100
const GLUCIDES_BONUS_MENSTRUATION = 15
const AJUSTEMENT_KCAL_LUTEALE = 150

// —— Plancher sécurité ——
const PLANCHER_OFFSET_MB_KCAL = 200

const PROFIL_PAR_TYPE_JOURNEE: Record<TypeJourneeMacros, string> = {
  sport: SEANCE_TYPE_SPORT_DEFAUT,
  repos: SEANCE_TYPE_REPOS_DEFAUT,
  cycle: SEANCE_TYPE_REPOS_DEFAUT,
}

function ajustementPasQuotidiens(pas: number): number {
  if (pas < PAS_SEUIL_BAS) return AJUSTEMENT_PAS_BAS
  if (pas < PAS_SEUIL_MOYEN) return AJUSTEMENT_PAS_MOYEN
  if (pas < PAS_SEUIL_HAUT) return AJUSTEMENT_PAS_ELEVE
  return AJUSTEMENT_PAS_TRES_ELEVE
}

/**
 * Déficit calorique quotidien (kcal à soustraire du TDEE).
 * Positif = déficit, négatif = surplus. Retourne un entier arrondi.
 */
export function calculerDeficitKcalParJour(
  poidsActuel: number,
  poidsCible: number | null,
  delaiMois: number | null,
  objectif: Objectif
): number {
  if (
    poidsCible != null &&
    delaiMois != null &&
    delaiMois > 0 &&
    poidsActuel > 0
  ) {
    if (poidsCible > poidsActuel) {
      const surplusTotal = (poidsCible - poidsActuel) * KCAL_PAR_KG_POIDS
      const surplusJour = surplusTotal / (delaiMois * JOURS_PAR_MOIS)
      return -Math.min(SURPLUS_MAX_KCAL, Math.round(surplusJour))
    }
    if (Math.abs(poidsCible - poidsActuel) <= TOLERANCE_POIDS_MAINTIEN_KG) {
      return 0
    }
    const deficitTotal = (poidsActuel - poidsCible) * KCAL_PAR_KG_POIDS
    const brut = Math.round(deficitTotal / (delaiMois * JOURS_PAR_MOIS))
    return Math.min(DEFICIT_MAX_KCAL, Math.max(DEFICIT_MIN_KCAL, brut))
  }
  return DEFICIT_FALLBACK_OBJECTIF[objectif]
}

function ratioGlucidesTdee(intensite: IntensiteEffort, typeEffort: TypeEffort): number {
  if (typeEffort === 'aucun') return RATIO_GLUCIDES_AUCUN
  if (intensite === 'legere' && typeEffort === 'mobilite') return RATIO_GLUCIDES_LEGERE_MOBILITE
  if (intensite === 'legere' && typeEffort === 'cardio') return RATIO_GLUCIDES_LEGERE_CARDIO
  if (intensite === 'moderee' && typeEffort === 'cardio') return RATIO_GLUCIDES_MODEREE_CARDIO
  if (intensite === 'moderee' && typeEffort === 'mixte') return RATIO_GLUCIDES_MODEREE_MIXTE
  if (intensite === 'intense' && typeEffort === 'force') return RATIO_GLUCIDES_INTENSE_FORCE
  if (intensite === 'intense' && typeEffort === 'cardio') return RATIO_GLUCIDES_INTENSE_CARDIO
  return RATIO_GLUCIDES_FALLBACK
}

function coeffProteinesParKg(intensite: IntensiteEffort, typeEffort: TypeEffort): number {
  if (typeEffort === 'aucun') return COEFF_PROTEINES_AUCUN
  switch (intensite) {
    case 'legere':
      return COEFF_PROTEINES_LEGERE
    case 'moderee':
      return COEFF_PROTEINES_MODEREE
    case 'intense':
      return COEFF_PROTEINES_INTENSE
    default:
      return COEFF_PROTEINES_LEGERE
  }
}

function ajustementDureeKcal(dureeMin: number): number {
  if (dureeMin > DUREE_SEUIL_1H30) return KCAL_BONUS_DUREE_SUP_1H30
  if (dureeMin > DUREE_SEUIL_1H) return KCAL_BONUS_DUREE_SUP_1H
  return 0
}

function ajustementPhaseKcal(phase: Phase): number {
  switch (phase) {
    case 'menstruation':
      return AJUSTEMENT_KCAL_MENSTRUATION
    case 'luteale':
      return AJUSTEMENT_KCAL_LUTEALE
    case 'folliculaire':
    case 'ovulation':
    default:
      return 0
  }
}

function bonusGlucidesPhase(phase: Phase): number {
  return phase === 'menstruation' ? GLUCIDES_BONUS_MENSTRUATION : 0
}

function profilEffortDepuisTypeJournee(typeJournee: TypeJourneeMacros): ProfilEffort {
  const cle = PROFIL_PAR_TYPE_JOURNEE[typeJournee]
  const defaut = PROFILS_DEFAUT[cle]
  if (defaut) return defaut
  return PROFILS_DEFAUT[SEANCE_TYPE_REPOS_DEFAUT]
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
 * Macros du jour à partir du profil macro, du profil d'effort de séance et de la phase.
 */
export function calculerMacrosDepuisProfil(
  profil: MacroProfile,
  profilEffort: ProfilEffort,
  phase: Phase
): MacrosJour {
  const mb = calculerMB(profil.poids_kg, profil.taille_cm, profil.age)
  const tdee = calculerTDEE(mb, profil.activite, profil.pas_quotidiens)
  const deficit = calculerDeficitKcalParJour(
    profil.poids_kg,
    profil.poids_cible_kg,
    profil.delai_mois,
    profil.objectif
  )

  let kcalTotal = tdee - deficit
  kcalTotal += ajustementDureeKcal(profilEffort.duree_min)
  kcalTotal += ajustementPhaseKcal(phase)

  const plancher = mb + PLANCHER_OFFSET_MB_KCAL
  kcalTotal = Math.max(Math.round(kcalTotal), plancher)

  const ratioGlucides = ratioGlucidesTdee(profilEffort.intensite, profilEffort.type_effort)
  let glucides = Math.round((tdee * ratioGlucides) / KCAL_PAR_GRAMME_GLUCIDES)
  glucides += bonusGlucidesPhase(phase)

  const proteines = Math.round(
    profil.poids_kg * coeffProteinesParKg(profilEffort.intensite, profilEffort.type_effort)
  )

  const lipidesCalcules = Math.round(
    (kcalTotal - proteines * KCAL_PAR_GRAMME_PROTEINES - glucides * KCAL_PAR_GRAMME_GLUCIDES) /
      KCAL_PAR_GRAMME_LIPIDES
  )
  const lipides = Math.max(LIPIDES_MIN_GRAMMES, lipidesCalcules)

  return {
    kcal: kcalTotal,
    proteines,
    glucides,
    lipides,
  }
}

/**
 * Macros du jour selon le profil, la phase et le type de journée (profils d'effort par défaut).
 */
export function calculerMacrosJour(
  profil: MacroProfile,
  phase: Phase,
  typeJournee: TypeJourneeMacros
): MacrosJour {
  return calculerMacrosDepuisProfil(profil, profilEffortDepuisTypeJournee(typeJournee), phase)
}
