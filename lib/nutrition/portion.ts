import type { AlimentAjoute } from '@/types'

/** Valeurs pour 100 g (CIQUAL ou étiquette du paquet). */
export interface Pour100g {
  kcal: number
  proteines: number
  glucides: number
  lipides: number
}

/** Macros pour une quantité donnée : valeur pour 100 g × grammes / 100, arrondie. */
export function macrosPourGrammes(nom: string, p: Pour100g, grammes: number): AlimentAjoute {
  const f = Math.max(0, grammes) / 100
  const r = (v: number) => Math.round(v * f * 10) / 10
  return { nom, grammes, calories: Math.round(p.kcal * f), proteines: r(p.proteines), glucides: r(p.glucides), lipides: r(p.lipides) }
}

/**
 * Raccourcis « aliment simple » : code CIQUAL + portion habituelle (approximative,
 * modifiable avant l'ajout).
 */
export const ALIMENTS_RAPIDES: { code: string; label: string; emoji: string; grammes: number }[] = [
  { code: '13039', label: 'Pomme', emoji: '🍎', grammes: 150 },
  { code: '13005', label: 'Banane', emoji: '🍌', grammes: 120 },
  { code: '13034', label: 'Orange', emoji: '🍊', grammes: 150 },
  { code: '13021', label: 'Kiwi', emoji: '🥝', grammes: 75 },
  { code: '22010', label: 'Œuf dur', emoji: '🥚', grammes: 50 },
  { code: '19593', label: 'Yaourt nature', emoji: '🥛', grammes: 125 },
  { code: '19644', label: 'Fromage blanc 0 %', emoji: '🥣', grammes: 100 },
  { code: '15000', label: 'Amandes', emoji: '🌰', grammes: 30 },
  { code: '7110', label: 'Pain complet', emoji: '🍞', grammes: 40 },
  { code: '13004', label: 'Avocat (½)', emoji: '🥑', grammes: 100 },
  { code: '31074', label: 'Chocolat noir 70 %', emoji: '🍫', grammes: 10 },
  { code: '19033', label: 'Lait demi-écrémé', emoji: '🥛', grammes: 200 },
]
