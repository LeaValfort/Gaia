import { addMonths, addYears, differenceInCalendarDays, format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { RdvSante, RdvSanteAffiche, SanteProfil, TypeContraception } from '@/types'

/**
 * Rendez-vous santé : fusion des RDV saisis à la main et des rappels calculés
 * depuis la contraception (contrôle annuel et changement du stérilet / implant).
 * Les durées ne sont pas imposées par l'appli : c'est l'utilisatrice qui les
 * renseigne (elles dépendent du modèle, voir la notice ou le ou la gynéco).
 */

export const LIBELLES_CONTRACEPTION: Record<TypeContraception, string> = {
  aucune: 'Aucune',
  sterilet_cuivre: 'Stérilet cuivre',
  sterilet_hormonal: 'Stérilet hormonal',
  pilule: 'Pilule',
  implant: 'Implant',
  anneau: 'Anneau vaginal',
  patch: 'Patch',
  injection: 'Injection',
  preservatif: 'Préservatif',
  autre: 'Autre',
}

/** Contraceptions posées avec une durée de validité (date de pose + durée). */
export const AVEC_DATE_POSE: TypeContraception[] = ['sterilet_cuivre', 'sterilet_hormonal', 'implant']
const STERILETS: TypeContraception[] = ['sterilet_cuivre', 'sterilet_hormonal']

export const DUREES_ANS = [3, 5, 6, 8, 10] as const

const iso = (d: Date) => format(d, 'yyyy-MM-dd')

/** Prochain contrôle annuel : un an après le dernier contrôle (ou la pose), jamais dans le passé lointain. */
function prochainControle(p: SanteProfil, aujourdhui: Date): string | null {
  const base = p.dernier_controle ?? p.date_pose
  if (!base) return null
  let d = addYears(parseISO(base), 1)
  // Contrôle oublié depuis plusieurs années : on propose la prochaine échéance, pas une date de 2023.
  while (differenceInCalendarDays(d, aujourdhui) < -60) d = addYears(d, 1)
  return iso(d)
}

export function rdvDepuisProfil(p: SanteProfil | null, aujourdhui: Date): RdvSanteAffiche[] {
  if (!p || !AVEC_DATE_POSE.includes(p.contraception)) return []
  const nom = LIBELLES_CONTRACEPTION[p.contraception].toLowerCase()
  const liste: RdvSanteAffiche[] = []
  if (STERILETS.includes(p.contraception)) {
    liste.push({
      cle: 'controle_sterilet',
      titre: 'Contrôle annuel du stérilet (position)',
      date: prochainControle(p, aujourdhui),
      source: 'controle_sterilet',
      detail: p.date_pose ? undefined : 'Renseigne la date de pose pour calculer la date',
    })
  }
  liste.push({
    cle: 'changement_contraception',
    titre: `Changement du ${nom}`,
    date: p.date_pose && p.duree_ans ? iso(addYears(parseISO(p.date_pose), p.duree_ans)) : null,
    source: 'changement_contraception',
    detail: !p.date_pose ? 'Date de pose à renseigner' : !p.duree_ans ? 'Durée de validité à renseigner' : undefined,
  })
  return liste
}

export function rdvManuelsAffiches(rdvs: RdvSante[]): RdvSanteAffiche[] {
  return rdvs.filter((r) => !r.fait).map((r) => ({ cle: r.id, titre: r.titre, date: r.date, source: 'manuel', rdv: r }))
}

/** Tous les RDV à venir, triés par date (ceux sans date à la fin). */
export function tousLesRdv(p: SanteProfil | null, rdvs: RdvSante[], aujourdhui: Date): RdvSanteAffiche[] {
  return [...rdvDepuisProfil(p, aujourdhui), ...rdvManuelsAffiches(rdvs)].sort((a, b) =>
    a.date && b.date ? a.date.localeCompare(b.date) : a.date ? -1 : b.date ? 1 : 0
  )
}

/** Date suivante d'un RDV récurrent une fois fait (ex. frottis tous les 36 mois). */
export function dateSuivante(r: RdvSante): string | null {
  return r.recurrence_mois ? iso(addMonths(parseISO(r.date), r.recurrence_mois)) : null
}

export function joursAvant(date: string, aujourdhui: Date): number {
  return differenceInCalendarDays(parseISO(date), aujourdhui)
}

/** RDV à mettre en avant sur l'accueil : dans les 30 prochains jours ou en retard. */
export const FENETRE_ACCUEIL_JOURS = 30
export function rdvProches(liste: RdvSanteAffiche[], aujourdhui: Date): RdvSanteAffiche[] {
  return liste.filter((r) => r.date && joursAvant(r.date, aujourdhui) <= FENETRE_ACCUEIL_JOURS)
}

/** « Dans 12 j », « Aujourd'hui », « En retard de 3 j ». */
export function echeanceRdv(date: string): { texte: string; urgent: boolean } {
  const j = joursAvant(date, new Date())
  if (j < 0) return { texte: `En retard de ${-j} j`, urgent: true }
  if (j === 0) return { texte: "Aujourd'hui", urgent: true }
  if (j <= 30) return { texte: `Dans ${j} j`, urgent: j <= 7 }
  return { texte: format(parseISO(date), 'd MMM yyyy', { locale: fr }), urgent: false }
}

