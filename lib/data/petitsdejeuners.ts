import type { OptionPetitDej } from '@/types'

export const OPTIONS_PETIT_DEJ: OptionPetitDej[] = [
  {
    id: 'overnight_oats',
    nom: 'Overnight oats + fruits',
    emoji: '🥣',
    tempsMin: 5,
    ingredients: ["flocons d'avoine (80g)", 'yaourt nature (150g)', 'lait végétal (100ml)', 'fruits frais', 'graines de chia (10g)'],
    calories: 350, proteines: 15, glucides: 55, lipides: 8,
    phasesRecommandees: ['folliculaire', 'ovulation'],
    batchCookable: true,
  },
  {
    id: 'egg_muffins',
    nom: 'Egg muffins x3',
    emoji: '🥚',
    tempsMin: 5,
    ingredients: ['oeufs x3', 'épinards', 'poivron', 'fromage râpé (20g)', 'sel, poivre'],
    calories: 280, proteines: 22, glucides: 12, lipides: 16,
    phasesRecommandees: ['menstruation', 'luteale'],
    batchCookable: true,
  },
  {
    id: 'yaourt_granola',
    nom: 'Yaourt grec + granola + fruits',
    emoji: '🫙',
    tempsMin: 3,
    ingredients: ['yaourt grec 0% (200g)', 'granola (40g)', 'fruits rouges (100g)', 'miel (5g)'],
    calories: 320, proteines: 18, glucides: 42, lipides: 8,
    phasesRecommandees: ['folliculaire', 'ovulation'],
    batchCookable: false,
  },
  {
    id: 'smoothie_proteine',
    nom: 'Smoothie protéiné',
    emoji: '🥤',
    tempsMin: 5,
    ingredients: ["lait végétal (250ml)", 'banane (1)', 'épinards (30g)', "beurre d'amande (20g)", 'protéine en poudre (30g)'],
    calories: 300, proteines: 25, glucides: 35, lipides: 6,
    phasesRecommandees: ['folliculaire', 'ovulation', 'luteale'],
    batchCookable: false,
  },
]
