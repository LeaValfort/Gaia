import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { GoogleCalendarEvent, NouvelEvenement } from '@/types'

/** « 14h30 » à partir d’une chaîne ISO datetime ou date seule */
export function formaterHeure(iso: string): string {
  if (!iso) return '—'
  try {
    const s = iso.includes('T') ? iso : `${iso}T12:00:00`
    return format(parseISO(s), 'HH:mm', { locale: fr }).replace(':', 'h')
  } catch {
    return '—'
  }
}

export function formaterEvenement(event: GoogleCalendarEvent): {
  heure: string
  titre: string
  lieu: string | null
  hasMeet: boolean
} {
  if (event.estToutJournee) {
    return { heure: 'Toute la journée', titre: event.titre, lieu: event.lieu, hasMeet: Boolean(event.lienMeet) }
  }
  return {
    heure: `${formaterHeure(event.debut)} → ${formaterHeure(event.fin)}`,
    titre: event.titre,
    lieu: event.lieu,
    hasMeet: Boolean(event.lienMeet),
  }
}

export type ResultatFetchAgenda = { ok: true; evenements: GoogleCalendarEvent[] } | {
  ok: false
  erreur: 'auth' | 'token' | 'serveur'
}

export async function fetchEvenementsJour(date: string): Promise<ResultatFetchAgenda> {
  const res = await fetch(`/api/calendar/events?date=${encodeURIComponent(date)}`, {
    credentials: 'same-origin',
  })
  if (res.status === 401) {
    const j = (await res.json()) as { erreur?: string }
    return { ok: false, erreur: j.erreur?.includes('Token') ? 'token' : 'auth' }
  }
  if (!res.ok) return { ok: false, erreur: 'serveur' }
  const data = (await res.json()) as { evenements?: GoogleCalendarEvent[] }
  return { ok: true, evenements: data.evenements ?? [] }
}

export async function creerEvenement(evenement: NouvelEvenement): Promise<boolean> {
  const res = await fetch('/api/calendar/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(evenement),
  })
  return res.ok
}
