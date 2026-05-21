import { NextRequest, NextResponse } from 'next/server'
import { fetchRecetteDetail } from '@/lib/spoonacular'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id?.trim()) {
    return NextResponse.json({ erreur: 'Code produit invalide' }, { status: 400 })
  }

  try {
    const recette = await fetchRecetteDetail(id)

    if (!recette) {
      return NextResponse.json({ erreur: 'Produit introuvable ou erreur réseau' }, { status: 404 })
    }

    return NextResponse.json({ recette })
  } catch (erreur) {
    console.error('Erreur détail produit:', erreur)
    return NextResponse.json({ erreur: 'Erreur lors du chargement du produit' }, { status: 500 })
  }
}
