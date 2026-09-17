import type { SeanceYoga, TypeYoga, Phase } from '@/types'

export const SEANCES_YOGA: SeanceYoga[] = [
  {
    type: 'yin',
    nom: 'Yoga yin — douceur',
    phaseCycle: ['menstruation', 'luteale'],
    dureeMin: 35,
    description: 'Postures tenues longtemps au sol. Relâcher les tensions, calmer le système nerveux.',
    postures: [
      { nom: 'Posture de l\'enfant',        dureeSec: 180, benefice: 'Relâche le bas du dos' },
      { nom: 'Papillon couché',             dureeSec: 240, benefice: 'Soulage les crampes utérines' },
      { nom: 'Torsion douce allongée',      dureeSec: 120, benefice: 'Masse les organes digestifs' },
      { nom: 'Jambes au mur',               dureeSec: 300, benefice: 'Fatigue et jambes lourdes' },
      { nom: 'Pigeon couché',               dureeSec: 180, benefice: 'Hanches et bas du dos' },
      { nom: 'Sphinx',                      dureeSec: 180, benefice: 'Étire le ventre' },
      { nom: 'Pince assise',                dureeSec: 240, benefice: 'Chaîne postérieure complète' },
      { nom: 'Savasana',                    dureeSec: 300, benefice: 'Intégration et récupération' },
    ],
  },
  {
    type: 'flow',
    nom: 'Yoga flow — vinyasa',
    phaseCycle: ['folliculaire'],
    dureeMin: 45,
    description: 'Enchaînements fluides, montée en chaleur progressive. Renforcer en douceur.',
    postures: [
      { nom: 'Salutation au soleil A',  dureeSec: 300, benefice: 'Échauffement complet' },
      { nom: 'Guerrier 1',              dureeSec: 120, benefice: 'Force et équilibre' },
      { nom: 'Guerrier 2',              dureeSec: 120, benefice: 'Hanches ouvertes' },
      { nom: 'Chien tête en bas',       dureeSec: 90,  benefice: 'Étirement global' },
      { nom: 'Fente basse',             dureeSec: 120, benefice: 'Flexibilité hanches' },
      { nom: 'Torsion assise',          dureeSec: 90,  benefice: 'Mobilité du dos' },
      { nom: 'Pont',                    dureeSec: 120, benefice: 'Fessiers et dos' },
      { nom: 'Savasana',                dureeSec: 300, benefice: 'Récupération' },
    ],
  },
  {
    type: 'power',
    nom: 'Yoga power — dynamique',
    phaseCycle: ['ovulation'],
    dureeMin: 50,
    description: 'Séquences intenses, équilibres, renforcement. Profiter du pic d\'énergie.',
    postures: [
      { nom: 'Salutation au soleil B',  dureeSec: 360, benefice: 'Échauffement intensif' },
      { nom: 'Guerrier 3',              dureeSec: 120, benefice: 'Équilibre et force' },
      { nom: 'Planche latérale',        dureeSec: 90,  benefice: 'Gainage profond' },
      { nom: 'Crow (Bakasana)',          dureeSec: 120, benefice: 'Force bras et équilibre' },
      { nom: 'Torsion debout',          dureeSec: 90,  benefice: 'Mobilité et force' },
      { nom: 'Demi-lune',               dureeSec: 120, benefice: 'Équilibre et hanches' },
      { nom: 'Bateau',                  dureeSec: 120, benefice: 'Abdominaux profonds' },
      { nom: 'Savasana',                dureeSec: 300, benefice: 'Récupération' },
    ],
  },
]

/** Retourne une séance par type */
export function getSeanceYoga(type: TypeYoga): SeanceYoga {
  return SEANCES_YOGA.find((s) => s.type === type) ?? SEANCES_YOGA[0]
}

/**
 * Retourne la séance recommandée selon la phase du cycle.
 * Menstruation → yin | Folliculaire → flow | Ovulation → power | Lutéale → yin
 */
export function getSeanceParPhase(phase: Phase): SeanceYoga {
  const mapping: Record<Phase, TypeYoga> = {
    menstruation: 'yin',
    folliculaire: 'flow',
    ovulation:    'power',
    luteale:      'yin',
  }
  return getSeanceYoga(mapping[phase])
}
