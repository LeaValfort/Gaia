// Plan de repas par phase × type × jour
// Index 0 = Lundi … 6 = Dimanche
// Les menus sont conçus pour s'adapter à la phase du cycle actuelle.

import type { Phase, TypeRepas } from '@/types'

export const PLAN_REPAS: Record<Phase, Record<TypeRepas, string[]>> = {

  menstruation: {
    'petit-dej': ['Overnight oats + baies + lin', 'Bol chia + banane + amandes', 'Porridge + compote poire + noix', 'Tartines pain complet + beurre amande', 'Bol avoine + myrtilles + noix', 'Granola + lait végétal + framboises', 'Overnight oats cacao + framboises'],
    'dejeuner':  ['Lentilles + épinards + viande rouge', 'Curry pois chiches + riz complet', 'Soupe minestrone + pain seigle', 'Poêlée légumineuses + légumes', 'Salade lentilles + betterave', 'Steak végétal + quinoa + kale', 'Bol fer : lentilles + légumes rôtis'],
    'collation': ['Chocolat noir 85% + amandes', 'Smoothie banane + épinards + lin', 'Bouillon légumes chaud', 'Pomme + beurre amande', 'Myrtilles + noix', 'Dattes + amandes', 'Compote maison + graines'],
    'diner':     ['Saumon + brocoli + quinoa', 'Soupe miso + tofu + légumes', 'Sardines + salade + patate douce', 'Poulet + épinards + riz complet', 'Omelette légumes verts', 'Velouté lentilles corail', 'Saumon mariné + légumes vapeur'],
  },

  folliculaire: {
    'petit-dej': ['Smoothie bowl açaï + graines', 'Pancakes avoine + myrtilles', 'Granola maison + kéfir + baies', 'Tartines pain seigle + avocat + œuf', 'Bol quinoa puffé + fruits + lin', 'Yaourt grec + framboises + noix', 'Waffles avoine + compote pomme'],
    'dejeuner':  ['Salade quinoa + pois chiches + avocat', 'Wrap légumes + hummus + tofu', 'Bol bouddha légumes rôtis + tahini', 'Buddha bowl saumon + edamame', 'Taboulé quinoa + persil + tomates', 'Salade niçoise + thon + légumineuses', 'Bol fermenté + riz complet'],
    'collation': ['Kéfir + framboises + graines', 'Œuf dur + carottes', 'Crackers seigle + hummus', 'Noix de cajou + raisins', 'Fromage blanc + graines courge', 'Kéfir + baies', 'Smoothie kéfir + fruits'],
    'diner':     ['Maquereau + salade + légumineuses', 'Tofu sauté + légumes + riz', 'Poisson blanc + brocoli + quinoa', 'Crevettes + légumes wok + vermicelles', 'Saumon en papillote + haricots', 'Sardines + salade tiède + patate', 'Soupe miso + soba + légumes'],
  },

  ovulation: {
    'petit-dej': ['Smoothie vert épinards + banane + lin', 'Tartines seigle + avocat + graines', 'Bol fruits + kéfir + granola', 'Açaï bowl + myrtilles + noix', 'Porridge + banane + beurre noisette', 'Crêpes sarrasin + fruits rouges', 'Smoothie grenade + myrtilles + lin'],
    'dejeuner':  ['Salade betterave + grenade + noix', 'Bol légumes crucifères + pois chiches', 'Soupe chou-fleur + curcuma + lait coco', 'Salade kale + quinoa + canneberges', 'Wrap kale + hummus + avocat', 'Curry brocoli + pois chiches + riz', 'Bol crudités + tahini + légumineuses'],
    'collation': ['Fruits rouges + noix', 'Carottes + hummus', 'Smoothie grenade + myrtilles', 'Pomme + amandes', 'Framboises + chocolat noir', 'Céleri + houmous', 'Graines courge + baies'],
    'diner':     ['Saumon + chou frisé + riz complet', 'Tofu + brocoli + nouilles soba', 'Crevettes + légumes wok + quinoa', 'Poulet + brocoli + patate douce', 'Sardines + betterave + lentilles', 'Soupe chou + gingembre + tofu', 'Saumon + épinards + quinoa'],
  },

  luteale: {
    'petit-dej': ['Avoine + banane + cannelle', 'Overnight oats + noix + cacao', 'Tartines pain complet + purée cajou', 'Porridge quinoa + patate douce + lin', 'Pancakes avoine + compote', 'Bol avoine + chocolat noir + amandes', 'Overnight oats + poire + noix'],
    'dejeuner':  ['Patate douce + lentilles + épinards', 'Riz complet + légumineuses + légumes', 'Quinoa + légumes grillés + tahini', 'Soupe patate douce + gingembre', 'Bol riz + tofu + légumes racines', 'Curry lentilles + coco', 'Buddha bowl quinoa + betterave'],
    'collation': ['Noix + chocolat noir 85%', 'Banane + beurre amande', 'Tisane gingembre + dattes', 'Pomme + cannelle + noix', 'Smoothie avoine + cacao + banane', 'Fruits secs + amandes', 'Avocado toast + graines'],
    'diner':     ['Saumon + quinoa + légumes verts', 'Curry légumes + lait coco + riz', 'Soupe poulet + légumes racines', 'Soupe lentilles + légumes + pain seigle', 'Omelette légumes + chèvre', 'Dhal lentilles + riz complet', 'Poisson blanc + patate douce + kale'],
  },
}

export const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] as const

export const TYPES_REPAS: { id: TypeRepas; label: string; emoji: string }[] = [
  { id: 'petit-dej', label: 'Petit-déj', emoji: '☀️' },
  { id: 'dejeuner',  label: 'Déjeuner',  emoji: '🍽️' },
  { id: 'collation', label: 'Collation', emoji: '🍎' },
  { id: 'diner',     label: 'Dîner',     emoji: '🌙' },
]
