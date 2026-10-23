import { NextResponse, type NextRequest } from 'next/server'
import { envoyerRecapsProches } from '@/lib/push/recap-proches'

export const maxDuration = 60

/**
 * Récap quotidien des proches, appelé par Vercel Cron (voir vercel.json).
 * Vercel envoie `Authorization: Bearer <CRON_SECRET>` quand la variable existe.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 })
  }
  const r = await envoyerRecapsProches()
  return NextResponse.json(r)
}
