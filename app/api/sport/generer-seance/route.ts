import { NextResponse, type NextRequest } from 'next/server'
import { creerClientServeur } from '@/lib/supabase-server'
import { genererSeance } from '@/lib/ia/creation-seance'
import type { CriteresSeance, Phase, SportAide } from '@/types'

export const maxDuration = 60

const SPORTS: SportAide[] = ['muscu', 'natation', 'yoga', 'libre']
const PHASES: Phase[] = ['menstruation', 'folliculaire', 'ovulation', 'luteale']
const txt = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const textes = (v: unknown) => (Array.isArray(v) ? v.map((x) => txt(x, 60)).filter(Boolean).slice(0, 10) : [])

/** POST CriteresSeance → séance proposée par l'IA (pas encore enregistrée). */
export async function POST(request: NextRequest) {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erreur: 'Non authentifiée' }, { status: 401 })

  const b = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!b || !SPORTS.includes(b.sport as SportAide)) return NextResponse.json({ erreur: 'Sport manquant.' }, { status: 400 })

  // Validation champ par champ : le corps vient du navigateur.
  const criteres: CriteresSeance = {
    sport: b.sport as SportAide,
    objectif: txt(b.objectif),
    niveau: txt(b.niveau, 40),
    duree_min: typeof b.duree_min === 'number' ? Math.min(180, Math.max(10, Math.round(b.duree_min))) : 45,
    materiel: textes(b.materiel),
    zones: textes(b.zones),
    envies: txt(b.envies, 500),
    phase: PHASES.includes(b.phase as Phase) ? (b.phase as Phase) : null,
    type_muscu: b.type_muscu === 'upper_lower' ? 'upper_lower' : 'full_body',
    lieu: b.lieu === 'salle' || b.lieu === 'street' ? b.lieu : 'maison',
    sport_libre: txt(b.sport_libre, 60) || undefined,
  }

  const seance = await genererSeance(criteres)
  if (!seance) return NextResponse.json({ erreur: 'La création de la séance a échoué, réessaie.' }, { status: 502 })
  return NextResponse.json({ seance })
}
