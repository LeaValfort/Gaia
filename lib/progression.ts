import { format, getISOWeek, getISOWeekYear, parseISO, startOfWeek, subWeeks, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { DailyLog, Mensuration, PointGraphique, PointSportHebdo, TypeSeance, Workout } from '@/types'

export {
  formaterDonneesDouleurs,
  plagesPhasesPourAxeCycle,
  COULEUR_PHASE_FOND,
} from '@/lib/progression-douleur'
export type { CycleDouleurMeta, DonneesDouleursChart } from '@/lib/progression-douleur'

export function formaterDonneesEnergie(logs: DailyLog[]): PointGraphique[] {
  return [...logs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((l) => ({
      date: format(parseISO(l.date), 'dd/MM', { locale: fr }),
      valeur: l.energy,
      douleur: l.pain,
      phase: l.phase,
      humeur: l.mood,
      label: l.date,
    }))
}

const LABELS_TYPES: Record<TypeSeance, string> = {
  muscu: 'Muscu',
  natation: 'Natation',
  yoga: 'Yoga',
  escalade: 'Escalade',
  autre: 'Autre',
}

export const COULEUR_TYPE: Record<TypeSeance, string> = {
  muscu: '#3b82f6',
  natation: '#06b6d4',
  yoga: '#a855f7',
  escalade: '#f97316',
  autre: '#94a3b8',
}

export function formaterDonneesSport(workouts: Workout[], nbSemaines = 16): PointSportHebdo[] {
  const objectif = 4
  const maintenant = new Date()
  const result: PointSportHebdo[] = []

  for (let i = 0; i < nbSemaines; i++) {
    const debut = startOfWeek(subWeeks(maintenant, nbSemaines - 1 - i), { weekStartsOn: 1 })
    const fin = endOfWeek(debut, { weekStartsOn: 1 })
    const wk = getISOWeek(debut)
    const yr = getISOWeekYear(debut)
    const seances = workouts.filter((w) => {
      const d = parseISO(w.date)
      return d >= debut && d <= fin
    })
    const counts: Partial<Record<TypeSeance, number>> = {}
    for (const s of seances) counts[s.type] = (counts[s.type] ?? 0) + 1
    let dominant: TypeSeance | null = null
    let maxC = 0
    for (const t of Object.keys(counts) as TypeSeance[]) {
      const c = counts[t] ?? 0
      if (c > maxC) {
        maxC = c
        dominant = t
      }
    }
    const detail = seances.length
      ? seances.map((s) => `${format(parseISO(s.date), 'EEE d', { locale: fr })} · ${LABELS_TYPES[s.type]}`).join('\n')
      : 'Aucune séance'
    result.push({
      cle: `${yr}-W${String(wk).padStart(2, '0')}`,
      label: `Sem ${wk}`,
      seances: seances.length,
      objectif,
      typeDominant: dominant,
      detail,
    })
  }
  return result
}

function moyenne(a: number | null, b: number | null): number | null {
  if (a == null && b == null) return null
  if (a == null) return b
  if (b == null) return a
  return Math.round(((a + b) / 2) * 10) / 10
}

export function formaterDonneesMensurations(mensurations: Mensuration[]): {
  poids: PointGraphique[]
  taille: PointGraphique[]
  hanches: PointGraphique[]
  bras: PointGraphique[]
  cuisses: PointGraphique[]
} {
  const tri = [...mensurations].sort((a, b) => a.date.localeCompare(b.date))
  const labelDate = (d: string) => format(parseISO(d), 'dd/MM', { locale: fr })
  return {
    poids: tri.map((m) => ({
      date: labelDate(m.date),
      valeur: m.poids_kg,
      label: m.date,
    })),
    taille: tri.map((m) => ({
      date: labelDate(m.date),
      valeur: m.tour_taille,
      label: m.date,
    })),
    hanches: tri.map((m) => ({
      date: labelDate(m.date),
      valeur: m.tour_hanches,
      label: m.date,
    })),
    bras: tri.map((m) => ({
      date: labelDate(m.date),
      valeur: moyenne(m.tour_bras_g, m.tour_bras_d),
      label: m.date,
    })),
    cuisses: tri.map((m) => ({
      date: labelDate(m.date),
      valeur: moyenne(m.tour_cuisse_g, m.tour_cuisse_d),
      label: m.date,
    })),
  }
}

export function calculerVariation(points: PointGraphique[]): {
  debut: number | null
  fin: number | null
  variation: number | null
  pourcentage: number | null
} {
  const vals = points.map((p) => p.valeur).filter((v): v is number => v !== null && !Number.isNaN(v))
  if (vals.length === 0) return { debut: null, fin: null, variation: null, pourcentage: null }
  const debut = vals[0]
  const fin = vals[vals.length - 1]
  const variation = Math.round((fin - debut) * 10) / 10
  const pourcentage =
    debut !== 0 ? Math.round((variation / Math.abs(debut)) * 1000) / 10 : null
  return { debut, fin, variation, pourcentage }
}
