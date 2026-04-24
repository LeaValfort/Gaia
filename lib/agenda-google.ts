import { format, parseISO } from 'date-fns'

/** Vue « Jour » dans Google Agenda (navigateur, compte Google connecté). */
export function lienGoogleAgendaJour(dateIso: string): string {
  const ymd = format(parseISO(dateIso), 'yyyyMMdd')
  return `https://calendar.google.com/calendar/u/0/r/day/${ymd}`
}

/** Création rapide d’un événement (titre vide, à compléter dans Google). */
export function lienGoogleNouvelEvenement(): string {
  return 'https://calendar.google.com/calendar/u/0/r/eventedit'
}
