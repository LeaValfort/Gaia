import type { Exercice, TypeSeanceMuscle, Lieu } from '@/types'

export const EXERCICES: Exercice[] = [

  // ── FULL BODY (lundi) ─────────────────────────────────────
  {
    nom: 'Squat', muscles: ['quadriceps', 'fessiers', 'ischio-jambiers'],
    categorie: 'compound', seance: 'full_body', lieu: 'both',
    seriesDefaut: 3, repsDefaut: 12, unite: 'reps', reposSecondes: 60,
    description: 'Pieds largeur épaules, descends comme pour t\'asseoir. Genoux dans l\'axe, dos droit, remonte en poussant dans les talons.',
    descriptionSalle: 'Barre sur les trapèzes (pas sur la nuque). Descends lentement en 3s, remonte en 1s. Commence à vide.',
    conseil: 'Tiens des haltères le long du corps à la maison pour augmenter la difficulté.',
    progression: 'Ajoute 1-2 kg quand tu fais les 3×12 facilement.',
  },
  {
    nom: 'Fentes alternées', muscles: ['fessiers', 'quadriceps', 'équilibre'],
    categorie: 'compound', seance: 'full_body', lieu: 'both',
    seriesDefaut: 3, repsDefaut: 10, unite: 'reps', reposSecondes: 60,
    description: 'Grand pas en avant, descends le genou arrière vers le sol. Repousse pour revenir. Alterne les jambes.',
    descriptionSalle: 'Sur la Smith machine : un pied en avant, un en arrière. La barre guide le mouvement.',
    conseil: 'Regarde devant toi. Le genou avant ne dépasse pas la pointe du pied.',
    progression: 'Ajoute des haltères quand tu maîtrises l\'équilibre.',
  },
  {
    nom: 'Hip thrust', muscles: ['fessiers', 'ischio-jambiers'],
    categorie: 'compound', seance: 'full_body', lieu: 'both',
    seriesDefaut: 3, repsDefaut: 15, unite: 'reps', reposSecondes: 60,
    description: 'Haut du dos contre le canapé, pieds au sol, genoux à 90°. Monte les hanches en ligne droite épaules-hanches-genoux. Serre les fessiers 1s. Redescends lentement.',
    descriptionSalle: 'Dos contre un banc, barre sur les hanches avec coussin de protection. Même mouvement avec charge.',
    conseil: 'Meilleur exercice pour les fessiers. Pose un haltère sur les hanches pour progresser.',
    progression: 'Ajoute du poids sur les hanches toutes les 2 semaines si 15 reps faciles.',
  },
  {
    nom: 'Pompes', muscles: ['pectoraux', 'épaules', 'triceps'],
    categorie: 'compound', seance: 'full_body', lieu: 'maison',
    seriesDefaut: 3, repsDefaut: 8, unite: 'reps', reposSecondes: 60,
    description: 'Corps en ligne droite, mains légèrement plus larges que les épaules. Descends la poitrine vers le sol, pousse pour remonter.',
    conseil: 'Commence sur les genoux si nécessaire — c\'est 60% du travail.',
    progression: 'Genoux → pieds → pieds surélevés. Ajoute des reps avant la difficulté.',
  },
  {
    nom: 'Rowing haltères', muscles: ['dos', 'biceps', 'arrière épaules'],
    categorie: 'compound', seance: 'full_body', lieu: 'both',
    seriesDefaut: 3, repsDefaut: 12, unite: 'reps', reposSecondes: 60,
    description: 'Buste penché à 45°, une main sur une chaise. Tire le bras vers le haut, coude près du corps. Redescends lentement.',
    descriptionSalle: 'Tirage poulie basse : assis, tire la poignée vers le nombril, dos droit, coudes près du corps.',
    conseil: 'Sans haltères : remplis un sac à dos de livres. Sens le dos travailler, pas les bras.',
    progression: 'Augmente de 1-2 kg quand tu fais les 3×12 sans forcer.',
  },
  {
    nom: 'Planche', muscles: ['abdominaux', 'dos', 'stabilisateurs'],
    categorie: 'gainage', seance: 'full_body', lieu: 'both',
    seriesDefaut: 3, repsDefaut: 30, unite: 'secondes', reposSecondes: 45,
    description: 'Avant-bras et orteils au sol, corps droit de la tête aux talons. Ne laisse pas les hanches monter ou descendre.',
    conseil: 'Commence à 20s, ajoute 5s par semaine. Qualité avant durée.',
    progression: '20s → 30s → 45s → 60s → planche sur les pieds → planche avec élévation de jambe.',
  },

  // ── UPPER / LOWER (vendredi) ──────────────────────────────
  {
    nom: 'Élévations latérales', muscles: ['épaules'],
    categorie: 'isolation', seance: 'upper_lower', lieu: 'both',
    seriesDefaut: 3, repsDefaut: 12, unite: 'reps', reposSecondes: 60,
    description: 'Bras le long du corps. Monte les bras sur les côtés jusqu\'aux épaules, coudes légèrement fléchis. Redescends lentement en 3s.',
    conseil: 'Sans haltères : bouteilles d\'eau 1,5L. La lenteur de la descente fait travailler.',
    progression: 'Augmente de 0,5 kg à la fois — les épaules sont fragiles.',
  },
  {
    nom: 'Curl biceps', muscles: ['biceps', 'avant-bras'],
    categorie: 'isolation', seance: 'upper_lower', lieu: 'both',
    seriesDefaut: 3, repsDefaut: 12, unite: 'reps', reposSecondes: 60,
    description: 'Coudes collés au corps. Monte les haltères vers les épaules en contractant les biceps. Descends lentement. Ne balance pas le dos.',
    descriptionSalle: 'Curl poulie basse : tension constante tout au long du mouvement.',
    conseil: 'Seuls les avant-bras bougent. Les coudes restent fixes.',
    progression: 'Augmente de 1 kg quand tu fais 3×12 sans compenser avec le dos.',
  },
  {
    nom: 'Dips sur chaise', muscles: ['triceps', 'épaules'],
    categorie: 'isolation', seance: 'upper_lower', lieu: 'both',
    seriesDefaut: 3, repsDefaut: 10, unite: 'reps', reposSecondes: 60,
    description: 'Mains sur le bord d\'une chaise, jambes tendues. Descends les fesses en fléchissant les coudes, remonte. Coudes vers l\'arrière.',
    descriptionSalle: 'Pushdown triceps poulie haute : debout, coudes collés, pousse vers le bas jusqu\'à extension complète.',
    conseil: 'Genoux fléchis pour réduire la difficulté. Coudes qui ne partent pas sur les côtés.',
    progression: 'Jambes fléchies → tendues → surélevées sur une chaise.',
  },
  {
    nom: 'Squat sumo', muscles: ['fessiers', 'adducteurs', 'quadriceps'],
    categorie: 'compound', seance: 'upper_lower', lieu: 'both',
    seriesDefaut: 3, repsDefaut: 12, unite: 'reps', reposSecondes: 60,
    description: 'Pieds très écartés, orteils à 45°. Descends dos droit, genoux dans l\'axe. Tiens un haltère entre les jambes si dispo.',
    descriptionSalle: 'Smith machine, pieds légèrement en avant de la barre pour cibler les fessiers.',
    conseil: 'Cible plus les fessiers et l\'intérieur des cuisses que le squat classique.',
    progression: 'Ajoute un haltère tenu entre les jambes, puis augmente progressivement.',
  },
  {
    nom: 'Glute bridge', muscles: ['fessiers', 'ischio-jambiers', 'abdominaux'],
    categorie: 'compound', seance: 'upper_lower', lieu: 'both',
    seriesDefaut: 3, repsDefaut: 15, unite: 'reps', reposSecondes: 60,
    description: 'Allongée sur le dos, genoux fléchis. Monte les hanches en serrant les fessiers, tiens 2s. Redescends sans poser les fesses.',
    conseil: 'Version accessible du hip thrust. Excellent pour les douleurs lombaires.',
    progression: 'Sans poids → haltère léger → haltère lourd → hip thrust.',
  },
  {
    nom: 'Mollets debout', muscles: ['mollets', 'stabilisateurs'],
    categorie: 'isolation', seance: 'upper_lower', lieu: 'both',
    seriesDefaut: 3, repsDefaut: 20, unite: 'reps', reposSecondes: 45,
    description: 'Debout sur une marche (talon dans le vide). Monte sur la pointe des pieds, tiens 1s, redescends sous le niveau de la marche.',
    descriptionSalle: 'Barre sur les trapèzes, pieds sur une plaque de poids. Même mouvement avec charge.',
    conseil: 'L\'amplitude complète (talon dans le vide) est bien plus efficace qu\'au sol.',
    progression: 'Ajoute des reps (20→25→30) puis augmente la charge.',
  },
]

/** Retourne les exercices filtrés par type de séance et lieu */
export function getExercicesParSeance(
  seance: TypeSeanceMuscle,
  lieu: Lieu,
): Exercice[] {
  return EXERCICES.filter(
    (e) => e.seance === seance && (e.lieu === 'both' || e.lieu === lieu),
  )
}
