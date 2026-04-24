import { NextResponse, type NextRequest } from 'next/server'
import { fromZonedTime } from 'date-fns-tz'
import { creerClientServeur } from '@/lib/supabase-server'
import type { GoogleCalendarEvent } from '@/types'

const TZ = process.env.NEXT_PUBLIC_CALENDAR_TZ ?? 'Europe/Paris'

type GCalStart = { dateTime?: string; date?: string }
type GCalItem = {
  id?: string
  summary?: string
  start?: GCalStart
  end?: GCalStart
  location?: string
  description?: string
  hangoutLink?: string
  colorId?: string
}

function versEvenement(item: GCalItem): GoogleCalendarEvent {
  const estToutJournee = Boolean(item.start?.date && !item.start?.dateTime)
  const debut = item.start?.dateTime ?? item.start?.date ?? ''
  const fin = item.end?.dateTime ?? item.end?.date ?? ''
  return {
    id: item.id ?? '',
    titre: item.summary?.trim() || 'Sans titre',
    debut,
    fin,
    lieu: item.location ?? null,
    description: item.description ?? null,
    lienMeet: item.hangoutLink ?? null,
    couleur: item.colorId ?? null,
    estToutJournee,
  }
}

export async function GET(request: NextRequest) {
  const supabase = await creerClientServeur()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  }
  const token = session.provider_token
  if (!token) {
    return NextResponse.json(
      { erreur: 'Token Google manquant — reconnecte-toi' },
      { status: 401 },
    )
  }

  const date = new URL(request.url).searchParams.get('date') ?? ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ erreur: 'Date invalide' }, { status: 400 })
  }

  const timeMin = fromZonedTime(`${date}T00:00:00`, TZ).toISOString()
  const timeMax = fromZonedTime(`${date}T23:59:59.999`, TZ).toISOString()
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
  url.searchParams.set('timeMin', timeMin)
  url.searchParams.set('timeMax', timeMax)
  url.searchParams.set('singleEvents', 'true')
  url.searchParams.set('orderBy', 'startTime')
  url.searchParams.set('maxResults', '50')

  const reponse = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!reponse.ok) {
    return NextResponse.json({ erreur: 'Google Calendar indisponible' }, { status: 502 })
  }
  const data = (await reponse.json()) as { items?: GCalItem[] }
  const evenements = (data.items ?? []).map(versEvenement).filter((e) => e.id)
  return NextResponse.json({ evenements })
}
