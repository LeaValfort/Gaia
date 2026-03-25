import type { Phase } from '@/types'

// ------------------------------------------------------------
// Items de la checklist anti-inflammatoire hebdomadaire
// ------------------------------------------------------------

export interface ItemChecklist {
  id: string
  label: string
  categorie: 'À consommer' | 'À éviter'
}

export const ITEMS_CHECKLIST: ItemChecklist[] = [
  { id: 'omega3',          label: 'Oméga-3 (saumon, sardine, lin, chia)',          categorie: 'À consommer' },
  { id: 'legumes_verts',   label: 'Légumes verts à feuilles (épinards, kale...)',  categorie: 'À consommer' },
  { id: 'fruits_rouges',   label: 'Fruits rouges ou antioxydants',                 categorie: 'À consommer' },
  { id: 'curcuma',         label: 'Curcuma ou gingembre',                          categorie: 'À consommer' },
  { id: 'noix_graines',    label: 'Noix, graines ou avocat',                       categorie: 'À consommer' },
  { id: 'proteines',       label: 'Protéines maigres (légumineuses, œufs, poisson)', categorie: 'À consommer' },
  { id: 'eau',             label: 'Hydratation suffisante (≥ 1,5 L/jour)',         categorie: 'À consommer' },
  { id: 'sucre',           label: 'Évité sucres raffinés',                         categorie: 'À éviter' },
  { id: 'alcool',          label: 'Évité alcool',                                  categorie: 'À éviter' },
  { id: 'cafeine',         label: 'Limité la caféine (< 2 cafés/jour)',            categorie: 'À éviter' },
]

// Checklist vide pour initialiser un nouveau log
export function creerChecklistVide(): Record<string, boolean> {
  return Object.fromEntries(ITEMS_CHECKLIST.map((item) => [item.id, false]))
}

// ------------------------------------------------------------
// Recommandations alimentaires par phase
// ------------------------------------------------------------

export interface RecommandationAlim {
  titre: string
  details: string[]
}

const RECOMMANDATIONS_PAR_PHASE: Record<Phase, RecommandationAlim> = {
  menstruation: {
    titre: 'Phase menstruelle — Reconstitue tes réserves',
    details: [
      'Fer : lentilles, épinards, viande rouge maigre, graines de citrouille',
      'Magnésium : chocolat noir 70%+, amandes, banane',
      'Anti-crampes : eau chaude avec citron et gingembre',
      'Évite les aliments inflammatoires : sucre, alcool, friture',
    ],
  },
  folliculaire: {
    titre: 'Phase folliculaire — Booste ton énergie',
    details: [
      'Oméga-3 : saumon, maquereau, graines de lin moulues',
      'Aliments fermentés : yaourt, kéfir, choucroute',
      'Protéines maigres : œufs, légumineuses, tofu',
      'Zinc : graines de courge, noix de cajou, pois chiches',
    ],
  },
  ovulation: {
    titre: 'Phase ovulatoire — Soutiens les œstrogènes',
    details: [
      'Légumes crucifères : brocoli, chou-fleur, chou frisé',
      'Fibres : fruits, légumineuses pour l\'élimination des hormones',
      'Antioxydants : baies, betterave, grenade',
      'Graines de lin (oestrogenmodulant naturel)',
    ],
  },
  luteale: {
    titre: 'Phase lutéale — Réduis le syndrome prémenstruel',
    details: [
      'Magnésium : noix, graines, cacao, légumes verts',
      'Glucides complexes : patate douce, quinoa, avoine',
      'Réduis la caféine pour limiter l\'anxiété et les tensions',
      'Évite le sel en excès (rétention d\'eau)',
    ],
  },
}

export function getRecommandationAlim(phase: Phase): RecommandationAlim {
  return RECOMMANDATIONS_PAR_PHASE[phase]
}
