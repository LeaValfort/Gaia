import type { ConditionSante } from '@/types'

/**
 * Profils santé : libellé, symptômes à suivre dans le journal, consigne pour
 * les recettes IA, conseils sourcés. Aucun conseil n'a de prétention médicale ;
 * toute affirmation factuelle renvoie à une source consultable (règle du projet).
 */

export interface SourceConseil {
  titre: string
  url: string
}

export interface ConseilCondition {
  texte: string
  source: SourceConseil | null
}

interface DefinitionCondition {
  label: string
  groupe: 'Thyroïde' | 'Gynéco' | 'Autres'
  symptomes: string[]
  consigneRecettes: string
  conseils: ConseilCondition[]
}

const S = {
  ata: { titre: 'Guidelines for the Treatment of Hypothyroidism (American Thyroid Association, 2014)', url: 'https://pubmed.ncbi.nlm.nih.gov/25266247/' },
  sopk: { titre: 'Recommendations from the 2023 International Evidence-based Guideline for the Assessment and Management of PCOS', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10477934/' },
  endoNutrition: { titre: 'I Am the 1 in 10 — What Should I Eat? A Research Review of Nutrition in Endometriosis (Nutrients, 2022)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9783589/' },
  eshre: { titre: 'ESHRE guideline: endometriosis (2022)', url: 'https://pubmed.ncbi.nlm.nih.gov/35350465/' },
  fer: { titre: 'Effect of tea and other dietary factors on iron absorption', url: 'https://pubmed.ncbi.nlm.nih.gov/11029010/' },
  spm: { titre: 'Effects of magnesium and vitamin B6 on the severity of premenstrual syndrome symptoms', url: 'https://pubmed.ncbi.nlm.nih.gov/25276694/' },
  sii: { titre: 'ACG Clinical Guideline: Management of Irritable Bowel Syndrome (2021)', url: 'https://pubmed.ncbi.nlm.nih.gov/33315591/' },
  migraine: { titre: 'Magnesium in Migraine Prophylaxis — Is There an Evidence-Based Rationale? A Systematic Review', url: 'https://pubmed.ncbi.nlm.nih.gov/29131326/' },
  fibres: { titre: 'Impact of Dietary Fiber Consumption on Insulin Resistance and the Prevention of Type 2 Diabetes', url: 'https://pubmed.ncbi.nlm.nih.gov/29378044/' },
} satisfies Record<string, SourceConseil>

const LEVOTHYROX: ConseilCondition = {
  texte: 'Si tu prends de la lévothyroxine : à jeun avec de l’eau, et à distance du café, du calcium, du fer et du soja, qui peuvent en réduire l’absorption.',
  source: S.ata,
}

export const CONDITIONS_SANTE: Record<ConditionSante, DefinitionCondition> = {
  hypothyroidie: {
    label: 'Hypothyroïdie',
    groupe: 'Thyroïde',
    symptomes: ['Frilosité', 'Peau sèche', 'Constipation'],
    consigneRecettes: 'hypothyroïdie : repas variés et rassasiants, sans régime d’exclusion',
    conseils: [LEVOTHYROX, { texte: 'Note ta fatigue et ta frilosité dans le journal : utile à montrer lors de ton prochain bilan thyroïdien.', source: null }],
  },
  hashimoto: {
    label: 'Hashimoto',
    groupe: 'Thyroïde',
    symptomes: ['Frilosité', 'Peau sèche', 'Constipation'],
    consigneRecettes: 'Hashimoto : repas variés et rassasiants, sans régime d’exclusion',
    conseils: [LEVOTHYROX],
  },
  hyperthyroidie: {
    label: 'Hyperthyroïdie',
    groupe: 'Thyroïde',
    symptomes: ['Palpitations', 'Tremblements', 'Chaleur excessive'],
    consigneRecettes: 'hyperthyroïdie : apports énergétiques et protéiques suffisants',
    conseils: [{ texte: 'Palpitations ou essoufflement inhabituels pendant le sport : baisse l’intensité ce jour-là et parles-en à ton médecin.', source: null }],
  },
  sopk: {
    label: 'SOPK',
    groupe: 'Gynéco',
    symptomes: ['Pilosité', 'Chute de cheveux', 'Règles irrégulières'],
    consigneRecettes: 'SOPK : index glycémique modéré, riche en fibres et en protéines',
    conseils: [
      { texte: 'Pour le SOPK, les recommandations internationales placent l’hygiène de vie (alimentation équilibrée, activité physique) en premier, sans régime particulier meilleur qu’un autre.', source: S.sopk },
      { texte: 'Mêler renforcement musculaire et activité d’endurance chaque semaine fait partie des recommandations d’activité physique pour le SOPK.', source: S.sopk },
    ],
  },
  endometriose: {
    label: 'Endométriose',
    groupe: 'Gynéco',
    symptomes: ['Douleur pelvienne intense', 'Douleur pendant les rapports', 'Douleur à la selle'],
    consigneRecettes: 'endométriose : riche en oméga-3, fibres, fruits et légumes',
    conseils: [
      { texte: 'Les preuves sur l’alimentation dans l’endométriose restent limitées ; plus d’oméga-3 et de fibres font partie des pistes étudiées. Observe ce qui te soulage.', source: S.endoNutrition },
      { texte: 'Note l’intensité de tes douleurs chaque jour : ce suivi aide à adapter la prise en charge avec ton ou ta gynéco.', source: S.eshre },
    ],
  },
  adenomyose: {
    label: 'Adénomyose',
    groupe: 'Gynéco',
    symptomes: ['Règles très abondantes', 'Douleur pelvienne intense'],
    consigneRecettes: 'adénomyose : aliments riches en fer (règles abondantes)',
    conseils: [{ texte: 'Avec des règles abondantes, pense aux aliments riches en fer associés à de la vitamine C, et garde thé et café à distance des repas.', source: S.fer }],
  },
  anemie: {
    label: 'Anémie / carence en fer',
    groupe: 'Autres',
    symptomes: ['Essoufflement', 'Vertiges', 'Pâleur'],
    consigneRecettes: 'carence en fer : aliments riches en fer associés à de la vitamine C, sans thé ni café dans le repas',
    conseils: [{ texte: 'Pour mieux absorber le fer, associe une source de vitamine C au repas (agrumes, poivron, kiwi) et garde thé et café à distance.', source: S.fer }],
  },
  spm_tdpm: {
    label: 'SPM / TDPM',
    groupe: 'Autres',
    symptomes: ['Irritabilité', 'Envies de sucre', 'Tristesse'],
    consigneRecettes: 'SPM : riche en magnésium (oléagineux, légumineuses, cacao, céréales complètes)',
    conseils: [{ texte: 'Le magnésium associé à la vitamine B6 a été étudié contre les symptômes du SPM ; demande l’avis de ton médecin avant une complémentation.', source: S.spm }],
  },
  sii: {
    label: 'Syndrome de l’intestin irritable',
    groupe: 'Autres',
    symptomes: ['Ballonnements', 'Diarrhée', 'Douleur abdominale'],
    consigneRecettes: 'SII : limiter les aliments riches en FODMAP (oignon, ail, légumineuses en grande quantité)',
    conseils: [{ texte: 'Si les ballonnements gênent, un régime pauvre en FODMAP, encadré par un·e diététicien·ne puis suivi d’une réintroduction progressive, peut aider.', source: S.sii }],
  },
  migraines_menstruelles: {
    label: 'Migraines menstruelles',
    groupe: 'Autres',
    symptomes: ['Migraine', 'Aura', 'Sensibilité à la lumière'],
    consigneRecettes: 'migraines : repas réguliers, riches en magnésium',
    conseils: [{ texte: 'Le magnésium est étudié en prévention des migraines ; parles-en à ton médecin avant d’en prendre.', source: S.migraine }],
  },
  resistance_insuline: {
    label: 'Résistance à l’insuline',
    groupe: 'Autres',
    symptomes: ['Coup de fatigue après le repas', 'Fringales'],
    consigneRecettes: 'résistance à l’insuline : index glycémique bas, riche en fibres, protéines à chaque repas',
    conseils: [{ texte: 'Les fibres (légumineuses, céréales complètes, légumes) sont associées à une meilleure sensibilité à l’insuline.', source: S.fibres }],
  },
}

export const ORDRE_CONDITIONS = Object.keys(CONDITIONS_SANTE) as ConditionSante[]

/** Symptômes à ajouter au journal, sans doublon. */
export function symptomesConditions(conditions: ConditionSante[]): string[] {
  return [...new Set(conditions.flatMap((c) => CONDITIONS_SANTE[c]?.symptomes ?? []))]
}

/** Consigne à injecter dans le prompt des recettes IA (vide si aucune condition). */
export function consigneRecettesConditions(conditions: ConditionSante[]): string {
  const c = conditions.map((x) => CONDITIONS_SANTE[x]?.consigneRecettes).filter(Boolean)
  return c.length ? `Adapte aux conditions de santé déclarées (sans prétention médicale) : ${c.join(' ; ')}.` : ''
}

/** Conseils de toutes les conditions, sans doublon de texte. */
export function conseilsConditions(conditions: ConditionSante[]): (ConseilCondition & { condition: string })[] {
  const vus = new Set<string>()
  return conditions.flatMap((c) =>
    (CONDITIONS_SANTE[c]?.conseils ?? []).flatMap((k) => {
      if (vus.has(k.texte)) return []
      vus.add(k.texte)
      return [{ ...k, condition: CONDITIONS_SANTE[c].label }]
    })
  )
}
