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

// —— Ajustement par type de journée (vs jour de sport) ——
const REDUCTION_KCAL_REPOS = 200
const REDUCTION_KCAL_CYCLE = 100

// —— Ajustement sommeil ——
const SOMMEIL_HEURES_SANS_AJUST = 7
const SOMMEIL_HEURES_6 = 6
const SOMMEIL_HEURES_COURT_MAX = 5
const RATIO_GLUCIDES_BONUS_6H = 1.05
const RATIO_GLUCIDES_BONUS_5H_ET_MOINS = 1.1
const RATIO_GLUCIDES_NEUTRE = 1
const REDUCTION_DEFICIT_SOMMEIL_COURT_KCAL = 50

// —— Phase menstruation (jour de règles uniquement) ——
const AJUSTEMENT_KCAL_MENSTRUATION = -100

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

/** Ajustement kcal selon sport / repos / règles (par rapport au jour de sport). */
function ajustementTypeJournee(typeJournee: TypeJourneeMacros, phase: Phase): number {
  switch (typeJournee) {
    case 'sport':
      return 0
    case 'repos':
      return -REDUCTION_KCAL_REPOS
    case 'cycle':
      return (
        -REDUCTION_KCAL_CYCLE +
        (phase === 'menstruation' ? AJUSTEMENT_KCAL_MENSTRUATION : 0)
      )
    default:
      return 0
  }
}

function repartirMacros(kcalTotal: number, poidsKg: number, sommeilHeures: number): MacrosJour {
  const proteines = Math.round(poidsKg * COEFF_PROTEINES_PAR_KG)
  const lipides = Math.round((kcalTotal * PART_KCAL_LIPIDES) / KCAL_PAR_GRAMME_LIPIDES)
  const kcalRestantes =
    kcalTotal - proteines * KCAL_PAR_GRAMME_PROTEINES - lipides * KCAL_PAR_GRAMME_LIPIDES
  let glucides = Math.round(kcalRestantes / KCAL_PAR_GRAMME_GLUCIDES)
  glucides = Math.round(glucides * ratioGlucidesSommeil(sommeilHeures))
  return { kcal: Math.round(kcalTotal), proteines, glucides, lipides }
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
 * Sport : TDEE − déficit · Repos : −200 kcal · Règles : −100 kcal + phase menstruation.
 */
export function calculerMacrosJour(
  profil: MacroProfile,
  phase: Phase,
  typeJournee: TypeJourneeMacros
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
  kcalTotal += ajustementTypeJournee(typeJournee, phase)
  kcalTotal += ajustementSommeilKcal(profil.sommeil_heures)

  return repartirMacros(kcalTotal, profil.poids_kg, profil.sommeil_heures)
}
