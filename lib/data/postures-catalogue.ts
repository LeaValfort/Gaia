// ============================================================
// Grande bibliothèque de postures yoga, indépendante des 3 séances-types
// (yin/flow/power) définies dans lib/data/yoga.ts. Sert uniquement à
// alimenter le sélecteur d'ajout dans l'éditeur de séance personnalisée.
// ============================================================

import type { CategoriePosture, PostureYoga } from '@/types'

/** Libellés + ordre d'affichage des catégories du catalogue de postures. */
export const LABELS_CATEGORIE_POSTURE: Record<CategoriePosture, string> = {
  debout: 'Debout',
  assise: 'Assise',
  torsion: 'Torsion',
  equilibre: 'Équilibre',
  etirement: 'Étirement',
  renforcement: 'Renforcement',
  relaxation: 'Relaxation',
}

export const CATEGORIES_POSTURE: CategoriePosture[] = [
  'debout', 'assise', 'torsion', 'equilibre', 'etirement', 'renforcement', 'relaxation',
]

export const POSTURES_CATALOGUE: PostureYoga[] = [
  // --- Debout ---
  { nom: 'Montagne (Tadasana)',        dureeSec: 30,  benefice: 'Ancrage et posture',                  categorie: 'debout' },
  { nom: 'Guerrier 1',                 dureeSec: 120, benefice: 'Force et équilibre',                  categorie: 'debout' },
  { nom: 'Guerrier 2',                 dureeSec: 120, benefice: 'Hanches ouvertes',                    categorie: 'debout' },
  { nom: 'Guerrier 3',                 dureeSec: 120, benefice: 'Équilibre et force',                  categorie: 'debout' },
  { nom: 'Guerrier inversé',           dureeSec: 90,  benefice: 'Étire les flancs',                    categorie: 'debout' },
  { nom: 'Triangle',                   dureeSec: 90,  benefice: 'Étire jambes et flancs',              categorie: 'debout' },
  { nom: 'Triangle inversé',           dureeSec: 90,  benefice: 'Équilibre et torsion légère',         categorie: 'debout' },
  { nom: 'Angle latéral étendu',       dureeSec: 90,  benefice: 'Renforce les jambes, étire les flancs', categorie: 'debout' },
  { nom: 'Chaise (Utkatasana)',        dureeSec: 60,  benefice: 'Renforce cuisses et fessiers',        categorie: 'debout' },
  { nom: 'Aigle',                      dureeSec: 90,  benefice: 'Équilibre et concentration',          categorie: 'debout' },
  { nom: 'Demi-lune',                  dureeSec: 120, benefice: 'Équilibre et hanches',                categorie: 'debout' },
  { nom: 'Fente basse',                dureeSec: 120, benefice: 'Flexibilité des hanches',             categorie: 'debout' },
  { nom: 'Fente haute',                dureeSec: 90,  benefice: 'Ouvre les hanches, renforce les jambes', categorie: 'debout' },
  { nom: 'Arbre (Vrksasana)',          dureeSec: 90,  benefice: 'Équilibre et concentration',          categorie: 'debout' },

  // --- Assise ---
  { nom: 'Papillon assis',             dureeSec: 180, benefice: 'Ouvre les hanches',                   categorie: 'assise' },
  { nom: 'Papillon couché',            dureeSec: 240, benefice: 'Soulage les crampes utérines',        categorie: 'assise' },
  { nom: 'Pince assise',               dureeSec: 240, benefice: 'Chaîne postérieure complète',         categorie: 'assise' },
  { nom: 'Tailleur (Sukhasana)',       dureeSec: 120, benefice: 'Détente et ancrage',                  categorie: 'assise' },
  { nom: 'Grenouille',                 dureeSec: 180, benefice: 'Ouvre profondément les hanches',      categorie: 'assise' },
  { nom: 'Héron',                      dureeSec: 120, benefice: 'Étire l\'arrière des jambes',         categorie: 'assise' },
  { nom: 'Vache-Chat',                 dureeSec: 90,  benefice: 'Mobilise la colonne vertébrale',      categorie: 'assise' },
  { nom: 'Posture de l\'enfant',       dureeSec: 180, benefice: 'Relâche le bas du dos',               categorie: 'assise' },
  { nom: 'Chameau',                    dureeSec: 90,  benefice: 'Ouvre la poitrine et les épaules',    categorie: 'assise' },

  // --- Torsion ---
  { nom: 'Torsion douce allongée',     dureeSec: 120, benefice: 'Masse les organes digestifs',         categorie: 'torsion' },
  { nom: 'Torsion assise',             dureeSec: 90,  benefice: 'Mobilité du dos',                     categorie: 'torsion' },
  { nom: 'Torsion debout',             dureeSec: 90,  benefice: 'Mobilité et force',                   categorie: 'torsion' },
  { nom: 'Torsion couchée jambes croisées', dureeSec: 120, benefice: 'Détend le bas du dos',           categorie: 'torsion' },
  { nom: 'Torsion en table',           dureeSec: 90,  benefice: 'Mobilise le dos en douceur',          categorie: 'torsion' },

  // --- Équilibre ---
  { nom: 'Crow (Bakasana)',            dureeSec: 120, benefice: 'Force des bras et équilibre',         categorie: 'equilibre' },
  { nom: 'Planche',                    dureeSec: 60,  benefice: 'Gainage complet',                     categorie: 'equilibre' },
  { nom: 'Planche latérale',           dureeSec: 90,  benefice: 'Gainage profond',                     categorie: 'equilibre' },
  { nom: 'Danseur (Natarajasana)',     dureeSec: 90,  benefice: 'Équilibre et souplesse',              categorie: 'equilibre' },

  // --- Étirement ---
  { nom: 'Chien tête en bas',          dureeSec: 90,  benefice: 'Étirement global',                    categorie: 'etirement' },
  { nom: 'Chien tête en haut',         dureeSec: 60,  benefice: 'Ouvre la poitrine',                   categorie: 'etirement' },
  { nom: 'Cobra',                      dureeSec: 90,  benefice: 'Renforce le dos, ouvre la poitrine',  categorie: 'etirement' },
  { nom: 'Sphinx',                     dureeSec: 180, benefice: 'Étire le ventre',                     categorie: 'etirement' },
  { nom: 'Pigeon couché',              dureeSec: 180, benefice: 'Hanches et bas du dos',               categorie: 'etirement' },
  { nom: 'Pigeon royal',               dureeSec: 120, benefice: 'Ouvre profondément les hanches',      categorie: 'etirement' },
  { nom: 'Charrue (Halasana)',         dureeSec: 90,  benefice: 'Étire toute la colonne',              categorie: 'etirement' },
  { nom: 'Poisson (Matsyasana)',       dureeSec: 90,  benefice: 'Ouvre la poitrine (contre-pose charrue)', categorie: 'etirement' },

  // --- Renforcement ---
  { nom: 'Bateau',                     dureeSec: 120, benefice: 'Abdominaux profonds',                 categorie: 'renforcement' },
  { nom: 'Pont',                       dureeSec: 120, benefice: 'Fessiers et dos',                     categorie: 'renforcement' },
  { nom: 'Roue (Urdhva Dhanurasana)',  dureeSec: 60,  benefice: 'Ouverture avancée du dos',            categorie: 'renforcement' },
  { nom: 'Sauterelle (Salabhasana)',   dureeSec: 90,  benefice: 'Renforce tout le dos',                categorie: 'renforcement' },
  { nom: 'Gainage sur les avant-bras', dureeSec: 60,  benefice: 'Gainage profond',                     categorie: 'renforcement' },

  // --- Relaxation ---
  { nom: 'Jambes au mur',              dureeSec: 300, benefice: 'Fatigue et jambes lourdes',           categorie: 'relaxation' },
  { nom: 'Savasana',                   dureeSec: 300, benefice: 'Intégration et récupération',         categorie: 'relaxation' },
  { nom: 'Torsion allongée avec coussin', dureeSec: 180, benefice: 'Relaxation douce',                 categorie: 'relaxation' },
  { nom: 'Respiration allongée (Pranayama)', dureeSec: 240, benefice: 'Calme le système nerveux',      categorie: 'relaxation' },
]
