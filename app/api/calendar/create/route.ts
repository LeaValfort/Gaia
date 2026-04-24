import { addDays, format, parseISO } from 'date-fns'
import { NextResponse, type NextRequest } from 'next/server'
import { creerClientServeur } from '@/lib/supabase-server'
import type { NouvelEvenement } from '@/types'

const TZ = process.env.NEXT_PUBLIC_CALENDAR_TZ ?? 'Europe/Paris'

function corpsValide(b: unknown): b is NouvelEvenement {
  if (!b || typeof b !== 'object') return false
  const o = b as Record<string, unknown>
  return (
    typeof o.titre === 'string' &&
    typeof o.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(o.date) &&
    typeof o.heureDebut === 'string' &&
    typeof o.heureFin === 'string' &&
    typeof o.lieu === 'string' &&
    typeof o.description === 'string' &&
    typeof o.estToutJournee === 'boolean'
  )
}

export async function POST(request: NextRequest) {
  const supabase = await creerClientServeur()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  }
  const token = session.provider_token
  if (!token) {
    return NextResponse.json({ erreur: 'Token Google manquant' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ erreur: 'JSON invalide' }, { status: 400 })
  }
  if (!corpsValide(body) || !body.titre.trim()) {
    return NextResponse.json({ erreur: 'Données invalides' }, { status: 400 })
  }

  const endJournee = format(addDays(parseISO(body.date), 1), 'yyyy-MM-dd')
  const evenement = body.estToutJournee
    ? {
        summary: body.titre.trim(),
        location: body.lieu.trim() || undefined,
        description: body.description.trim() || undefined,
        start: { date: body.date },
        end: { date: endJournee },
      }
    : {
        summary: body.titre.trim(),
        location: body.lieu.trim() || undefined,
        description: body.description.trim() || undefined,
        start: { dateTime: `${body.date}T${body.heureDebut}:00`, timeZone: TZ },
        end: { dateTime: `${body.date}T${body.heureFin}:00`, timeZone: TZ },
      }

  const reponse = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(evenement),
      cache: 'no-store',
    },
  )
  if (!reponse.ok) {
    return NextResponse.json({ erreur: 'Création refusée' }, { status: 502 })
  }
  const data = (await reponse.json()) as { id?: string }
  return NextResponse.json({ id: data.id, success: true })
}
