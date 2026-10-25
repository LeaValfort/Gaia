import { NextResponse, type NextRequest } from 'next/server'
import { envoyerRappelsPilule } from '@/lib/push/rappel-pilule'

export const maxDuration = 60

/**
 * Rappel de pilule. Le plan Vercel gratuit n'autorise qu'un cron par jour :
 * cette route est appelée toutes les ~10 min par GitHub Actions
 * (.github/workflows/rappel-pilule.yml) avec `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 })
  }
  return NextResponse.json(await envoyerRappelsPilule())
}
