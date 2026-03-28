import type { NiveauNatationDetail } from '@/types'

export const NIVEAUX_DETAIL: NiveauNatationDetail[] = [
  {
    level: 1,
    nom: 'Départ',
    description: '1 000 m — blocs 50 brasse + 150 crawl × 5',
    structure: '5×(50B + 150C)',
    distanceTotale: 1000,
    crawlM: 750,
    brasseM: 250,
    critere: 'Terminer sans être épuisée, les 6 longueurs crawl se font sans s\'arrêter.',
  },
  {
    level: 2,
    nom: 'Étape 1',
    description: '1 100 m — réduire la brasse à 25 m entre les blocs',
    structure: '5×(25B + 175C)',
    distanceTotale: 1100,
    crawlM: 875,
    brasseM: 125,
    critere: 'Arriver à la brasse encore fraîche, sans envie de s\'arrêter avant.',
  },
  {
    level: 3,
    nom: 'Étape 2',
    description: '1 300 m — blocs 200 m crawl + 30 sec pause',
    structure: '5×200C + 30s repos',
    distanceTotale: 1300,
    crawlM: 1000,
    brasseM: 100,
    critere: '5 blocs de 200 m sans brasse au milieu, juste la pause.',
  },
  {
    level: 4,
    nom: 'Étape 3',
    description: '1 600 m — blocs 400 m crawl + 1 min pause',
    structure: '3×400C + 1min repos',
    distanceTotale: 1600,
    crawlM: 1200,
    brasseM: 50,
    critere: '3 blocs de 400 m à allure régulière, le 3ème ressemble au 1er.',
  },
  {
    level: 5,
    nom: 'Étape 4 — Objectif',
    description: '2 000 m+ — crawl dominant',
    structure: '800C + 100B + 8×50C + 300C + 100B',
    distanceTotale: 2000,
    crawlM: 1500,
    brasseM: 200,
    critere: 'Crawl dominant, brasse = plaisir ou récupération uniquement.',
  },
]

/** Retourne les détails d'un niveau (replie sur le niveau 1 si invalide) */
export function getNiveauDetail(level: number): NiveauNatationDetail {
  return NIVEAUX_DETAIL.find((n) => n.level === level) ?? NIVEAUX_DETAIL[0]
}
