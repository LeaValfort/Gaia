import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const nom = searchParams.get('name')

  const url = nom
    ? `https://yoga-api-nzy4.onrender.com/v1/poses?name=${encodeURIComponent(nom)}`
    : `https://yoga-api-nzy4.onrender.com/v1/poses`

  const reponse = await fetch(url, { next: { revalidate: 86400 } })

  if (!reponse.ok) {
    return NextResponse.json({ erreur: 'API yoga indisponible' }, { status: 500 })
  }

  const data: unknown = await reponse.json()
  return NextResponse.json(data)
}
