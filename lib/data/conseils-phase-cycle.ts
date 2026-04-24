import type { Phase } from '@/types'

export type ConseilsPhaseDetail = {
  sport: string
  nutrition: string
  sommeil: string
  bienEtre: string
  astuce: string
  anecdote: string
}

export const CONSEILS_PHASE_DETAILS: Record<Phase, ConseilsPhaseDetail> = {
  menstruation: {
    sport: 'Repos et douceur — yoga yin, marche légère. Écoute ton corps.',
    nutrition:
      'Privilégie le fer (légumineuses, épinards), le magnésium et le chocolat noir 70%+.',
    sommeil: 'Dors autant que possible. La fatigue est normale ces jours-ci.',
    bienEtre: 'Bouillote, bain chaud, tisane framboisier ou camomille.',
    astuce:
      "Évite les anti-douleurs trop souvent — l'ibuprofène est plus efficace que le paracétamol pour les crampes utérines.",
    anecdote:
      "Pendant les règles, ton taux d'œstrogènes est au plus bas. C'est normal de se sentir plus introvertie et moins énergique. 🌸",
  },
  folliculaire: {
    sport: 'Énergie en hausse — idéal pour la musculation et les séances intenses.',
    nutrition: 'Aliments fermentés, protéines maigres et oméga-3 pour soutenir l’ovulation.',
    sommeil: 'Ton sommeil est plus léger et récupérateur cette semaine.',
    bienEtre: 'C’est le bon moment pour démarrer de nouveaux projets et prendre des décisions.',
    astuce:
      'Profite de cette phase pour augmenter tes charges en musculation — ta tolérance à la douleur est plus élevée.',
    anecdote:
      'Les œstrogènes montent progressivement, ce qui améliore ton humeur, ta mémoire et ta confiance. Tu es au top ! ✨',
  },
  ovulation: {
    sport: "Pic d'énergie — HIIT, escalade, natation intensive. Tous les défis sont permis !",
    nutrition: 'Fibres, légumes crucifères et antioxydants pour équilibrer les œstrogènes.',
    sommeil: 'Tu as besoin de moins de sommeil ces jours-ci — profites-en !',
    bienEtre: 'Tu rayonnes naturellement — c’est hormonal ! Profite de ton énergie sociale.',
    astuce:
      "L'ovulation dure 12-24h maximum. Les signes : légère douleur côté bas-ventre, glaire cervicale transparente.",
    anecdote:
      'Ton pic de LH (hormone lutéinisante) déclenche l’ovulation. C’est ton moment de peak performance mensuel. 🚀',
  },
  luteale: {
    sport: 'Préfère le yoga flow ou la natation douce. Réduis l’intensité progressivement.',
    nutrition: 'Magnésium (noix, graines), glucides complexes et évite la caféine après 14h.',
    sommeil: 'La progestérone peut perturber ton sommeil. Couche-toi plus tôt.',
    bienEtre:
      'Sois indulgente avec toi-même — les sautes d’humeur sont hormonales, pas un défaut.',
    astuce:
      'Si tu as des fringales de sucre, c’est normal — la progestérone augmente ton métabolisme de base.',
    anecdote:
      'Le syndrome prémenstruel touche 75% des femmes. La magnésium et la vitamine B6 peuvent aider. 🌙',
  },
}
