import { NextRequest, NextResponse } from 'next/server'
import { fetchRecetteDetail } from '@/lib/spoonacular'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ erreur: 'ID recette invalide' }, { status: 400 })
  }

  if (!process.env.SPOONACULAR_API_KEY) {
    return NextResponse.json({ erreur: 'Clé API manquante' }, { status: 500 })
  }

  const recette = await fetchRecetteDetail(id)

  if (!recette) {
    return NextResponse.json({ erreur: 'Recette introuvable ou erreur réseau' }, { status: 404 })
  }

  return NextResponse.json({ recette })
}
