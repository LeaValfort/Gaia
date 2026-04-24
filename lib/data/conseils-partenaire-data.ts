import type { ConseilPartenaire, Phase } from '@/types'

/** Conseils relationnels pour le/la partenaire selon la phase (données statiques). */
export const CONSEILS_PAR_PHASE: Record<Phase, ConseilPartenaire> = {
  menstruation: {
    titre: 'Elle a ses règles',
    emoji: '🌸',
    humeurGenerale: 'Fatiguée, sensible, besoin de douceur',
    libido: 'basse',
    description:
      "C'est le moment de la chouchouter sans attendre quoi que ce soit en retour.",
    idees: [
      'Prépare-lui une bouillotte chaude 🌡️',
      'Commande ou cuisine son plat réconfortant préféré 🍜',
      'Propose un film en mode canapé + plaids',
      'Offre-lui du chocolat noir (c’est médical 😄)',
      'Fais les tâches ménagères sans qu’elle demande',
      'Massage doux du bas du dos',
      'Sois patient·e si elle est irritable',
    ],
    aEviter: [
      'Proposer des activités intenses',
      'Faire des reproches ou discussions difficiles',
      'Insister pour sortir si elle veut rester',
    ],
  },
  folliculaire: {
    titre: 'Phase folliculaire',
    emoji: '🌱',
    humeurGenerale: 'Énergie en hausse, créative, sociable',
    libido: 'moyenne',
    description:
      'Elle reprend de l’énergie et de la confiance. Bon moment pour des projets et des sorties.',
    idees: [
      'Propose une nouvelle activité ensemble 🎯',
      'Organise une sortie : ciné, expo, restaurant',
      'Bon moment pour les discussions importantes',
      'Encourage ses projets et ambitions',
      'Fais du sport ensemble',
      'Planifie un week-end ou un voyage',
    ],
    aEviter: ['Rester enfermé·es sans rien faire', 'Reporter des projets importants sans raison'],
  },
  ovulation: {
    titre: 'Phase d’ovulation',
    emoji: '✨',
    humeurGenerale: 'Pic d’énergie, confiante, charismatique',
    libido: 'haute',
    description:
      'Elle est au top de sa forme — profitez-en pour des moments intenses et mémorables.',
    idees: [
      'Mode romantique enclenché 🕯️',
      'Dîner aux chandelles ou resto',
      'Prépare-lui une surprise',
      'Pic-nic ou sortie nature',
      'Week-end en amoureux',
      'Dis-lui qu’elle est belle (elle rayonne vraiment)',
      'Activités physiques : randonnée, danse…',
    ],
    aEviter: ['Annuler des plans au dernier moment', 'Être absent·e émotionnellement'],
  },
  luteale: {
    titre: 'Phase lutéale',
    emoji: '🌙',
    humeurGenerale: 'Plus sensible, besoin de calme et de sécurité',
    libido: 'variable',
    description:
      'Elle peut être plus émotionnelle. Sois présent·e et rassurant·e, sans chercher à « réparer ».',
    idees: [
      'Écoute sans essayer de résoudre 👂',
      'Repas chauds et réconfortants',
      'Soirée calme : séries, lecture, jeux',
      'Massage des épaules ou des pieds',
      'Dis-lui que tu es là pour elle',
      'Bain chaud',
      'Anticipe courses (chocolat, tisanes…)',
    ],
    aEviter: [
      'Minimiser ses émotions (« tu es trop sensible »)',
      'Sorties très sociales et bruyantes',
      'Critiques même constructives',
      'Être sur ton téléphone quand elle veut parler',
    ],
  },
}
