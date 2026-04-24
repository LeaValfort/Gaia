import type { DailyLog, Phase } from '@/types'

const COULEURS_CYCLES = ['#ef4444', '#3b82f6', '#a855f7', '#eab308', '#ec4899', '#22c55e']

export interface CycleDouleurMeta {
  cle: string
  numero: number
  couleur: string
}

export interface DonneesDouleursChart {
  rows: Record<string, number | string | null>[]
  cycles: CycleDouleurMeta[]
}

export function formaterDonneesDouleurs(logs: DailyLog[], cycleLength: number): DonneesDouleursChart {
  const avecJour = logs
    .filter((l) => l.cycle_day != null && l.cycle_day >= 1)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (avecJour.length === 0) return { rows: [], cycles: [] }

  const segments: { jour: number; douleur: number | null; date: string }[][] = []
  let courant: { jour: number; douleur: number | null; date: string }[] = []

  for (let i = 0; i < avecJour.length; i++) {
    const log = avecJour[i]
    const jour = log.cycle_day as number
    const prev = i > 0 ? avecJour[i - 1] : null
    const prevJour = prev?.cycle_day ?? null
    if (i > 0 && prevJour !== null && jour < prevJour) {
      if (courant.length) segments.push(courant)
      courant = []
    }
    courant.push({ jour, douleur: log.pain ?? null, date: log.date })
  }
  if (courant.length) segments.push(courant)

  const maxJour = Math.max(1, cycleLength)
  const rows: Record<string, number | string | null>[] = []
  for (let j = 1; j <= maxJour; j++) {
    const row: Record<string, number | string | null> = { jour: j }
    segments.forEach((seg, idx) => {
      const cle = `c${idx}`
      const hit = seg.find((p) => p.jour === j)
      row[cle] = hit ? hit.douleur : null
    })
    rows.push(row)
  }

  const cycles: CycleDouleurMeta[] = segments.map((_, idx) => ({
    cle: `c${idx}`,
    numero: idx + 1,
    couleur: COULEURS_CYCLES[idx % COULEURS_CYCLES.length],
  }))

  return { rows, cycles }
}

export function plagesPhasesPourAxeCycle(cycleLength: number): { phase: Phase; debut: number; fin: number }[] {
  const jF = Math.round(cycleLength * 0.42)
  const jO = Math.round(cycleLength * 0.54)
  return [
    { phase: 'menstruation', debut: 1, fin: 4 },
    { phase: 'folliculaire', debut: 5, fin: jF },
    { phase: 'ovulation', debut: jF + 1, fin: jO },
    { phase: 'luteale', debut: jO + 1, fin: cycleLength },
  ]
}

/** @deprecated Préférer PHASES_CALENDRIER_CELL (Graphique douleurs) — mêmes teintes que l’app */
export const COULEUR_PHASE_FOND: Record<Phase, string> = {
  menstruation: '#FFD6DA',
  folliculaire: '#FEF08A',
  ovulation: '#BBF7D0',
  luteale: '#DDD6FE',
}

