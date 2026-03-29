import type { NiveauNatationDetail } from '@/types'

// Échauffement commun : 150 m (50B lente + 50C lent + 50 dos)
// Drill technique : 100 m (4×25m) spécifique à chaque niveau
// Total = échauffement (150) + drill (100) + set principal

export const NIVEAUX_DETAIL: NiveauNatationDetail[] = [
  {
    level: 1,
    nom: 'Départ',
    description: '1 250 m — échauffement + bras seul + blocs 50B+150C×5',
    structure: '5×(50B + 150C)',
    exerciceTechnique: 'Bras seul crawl — 4×25m (bras qui ne nagent pas tenu le long du corps)',
    distanceTotale: 1250,
    crawlM: 900,   // 750 set + 50 éch. + 100 drill
    brasseM: 300,  // 250 set + 50 éch.
    critere: 'Terminer sans être épuisée, les 6 longueurs crawl se font sans s\'arrêter.',
  },
  {
    level: 2,
    nom: 'Étape 1',
    description: '1 350 m — échauffement + catch-up + blocs 25B+175C×5',
    structure: '5×(25B + 175C)',
    exerciceTechnique: 'Catch-up drill — 4×25m (attends que la main avant touche l\'autre avant de tirer)',
    distanceTotale: 1350,
    crawlM: 1025,  // 875 set + 50 éch. + 100 drill
    brasseM: 175,  // 125 set + 50 éch.
    critere: 'Arriver à la brasse encore fraîche, sans envie de s\'arrêter avant.',
  },
  {
    level: 3,
    nom: 'Étape 2',
    description: '1 550 m — échauffement + respiration bilatérale + 5×200C',
    structure: '5×200C + 30s repos',
    exerciceTechnique: 'Respiration bilatérale — 100m continu (respire à droite, gauche, droite, gauche…)',
    distanceTotale: 1550,
    crawlM: 1150,  // 1000 set + 50 éch. + 100 drill
    brasseM: 150,  // 100 set + 50 éch.
    critere: '5 blocs de 200 m sans brasse au milieu, juste la pause.',
  },
  {
    level: 4,
    nom: 'Étape 3',
    description: '1 850 m — échauffement + jambes planche + 3×400C',
    structure: '3×400C + 1min repos',
    exerciceTechnique: 'Jambes planche — 4×25m (bras tendus sur la planche, focus sur le battement)',
    distanceTotale: 1850,
    crawlM: 1350,  // 1200 set + 50 éch. + 100 drill
    brasseM: 100,  // 50 set + 50 éch.
    critere: '3 blocs de 400 m à allure régulière, le 3ème ressemble au 1er.',
  },
  {
    level: 5,
    nom: 'Étape 4 — Objectif',
    description: '2 250 m+ — échauffement + jambes+sprints + crawl dominant',
    structure: '800C + 100B + 8×50C + 300C + 100B',
    exerciceTechnique: 'Jambes planche + sprints — 2×25m kick + 2×25m sprint crawl max',
    distanceTotale: 2250,
    crawlM: 1650,  // 1500 set + 50 éch. + 100 drill
    brasseM: 250,  // 200 set + 50 éch.
    critere: 'Crawl dominant, brasse = plaisir ou récupération uniquement.',
  },
]

/** Retourne les détails d'un niveau (replie sur le niveau 1 si invalide) */
export function getNiveauDetail(level: number): NiveauNatationDetail {
  return NIVEAUX_DETAIL.find((n) => n.level === level) ?? NIVEAUX_DETAIL[0]
}
