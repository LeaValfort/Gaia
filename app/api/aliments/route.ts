import { NextResponse, type NextRequest } from 'next/server'
import { alimentsParCodes, rechercherAliments } from '@/lib/nutrition/recherche-aliments'

/**
 * GET /api/aliments?q=pomme → aliments CIQUAL correspondants (pour 100 g).
 * GET /api/aliments?codes=13039,13005 → aliments précis (raccourcis « pomme », « banane »…).
 * Données publiques (ANSES), pas d'accès à la base : aucune authentification requise.
 */
export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const codes = searchParams.get('codes')
  if (codes) return NextResponse.json(alimentsParCodes(codes.split(',').slice(0, 30)))
  return NextResponse.json(rechercherAliments(searchParams.get('q') ?? ''))
}
