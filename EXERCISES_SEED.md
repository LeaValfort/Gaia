# EXERCISES_SEED.md — Base d'exercices à intégrer dans l'appli

Colle ce fichier dans Cursor et dis-lui :
"Crée une migration Supabase et les données seed pour tous ces exercices,
puis intègre-les dans la page /sport avec une interface de log de séance."

---

## Structure de la table `exercises` à créer dans Supabase

```sql
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  muscles text[],           -- groupes musculaires ciblés
  category text,            -- 'compound' | 'isolation' | 'cardio' | 'gainage'
  seance text,              -- 'full_body' | 'upper_lower' | 'both'
  location text,            -- 'maison' | 'salle' | 'both'
  equipment text,           -- 'aucun' | 'halteres' | 'smith' | 'poulie' | 'banc'
  sets_default integer,     -- nombre de séries par défaut
  reps_default integer,     -- nombre de reps par défaut
  rest_seconds integer,     -- temps de repos recommandé en secondes
  description text,         -- comment faire l'exercice
  tip text,                 -- conseil / erreur à éviter
  progression text          -- comment progresser
);
```

---

## SÉANCE 1 — FULL BODY (lundi)

### Exercice 1 — Squat poids du corps / Smith machine
```json
{
  "name": "Squat",
  "muscles": ["quadriceps", "fessiers", "ischio-jambiers"],
  "category": "compound",
  "seance": "full_body",
  "location": "both",
  "equipment_maison": "aucun (ou haltères)",
  "equipment_salle": "smith machine",
  "sets_default": 3,
  "reps_default": 12,
  "rest_seconds": 60,
  "description_maison": "Pieds largeur épaules, orteils légèrement ouverts. Descends comme pour t'asseoir sur une chaise, genoux dans l'axe des pieds. Dos droit, regard devant. Remonte en poussant dans les talons.",
  "description_salle": "Barre sur les trapèzes (pas sur la nuque), pieds légèrement devant la barre. Descends lentement en 3 secondes, remonte en 1 sec. La Smith machine guide la trajectoire.",
  "tip": "Si tu as des haltères à la maison, tiens-les le long du corps pour augmenter la difficulté. À la salle, commence à vide (barre seule = ~7-10 kg).",
  "progression": "Ajoute 1-2 kg quand tu fais les 3x12 facilement. Passe aux haltères à la maison quand le poids du corps devient trop facile."
}
```

### Exercice 2 — Fentes alternées
```json
{
  "name": "Fentes alternées",
  "muscles": ["fessiers", "quadriceps", "équilibre"],
  "category": "compound",
  "seance": "full_body",
  "location": "both",
  "equipment_maison": "aucun (ou haltères)",
  "equipment_salle": "smith machine ou haltères",
  "sets_default": 3,
  "reps_default": 10,
  "rest_seconds": 60,
  "description_maison": "Debout, fais un grand pas en avant. Descends le genou arrière vers le sol sans le toucher. Repousse le sol pour revenir. Alterne les jambes.",
  "description_salle": "Fentes sur la Smith machine : un pied en avant, l'autre en arrière. La barre guide le mouvement, plus sécurisé qu'avec haltères.",
  "tip": "Regarde devant toi pour garder l'équilibre. Commence sans haltères. Le genou avant ne doit pas dépasser la pointe du pied.",
  "progression": "Ajoute des haltères quand tu maîtrises l'équilibre. Augmente la charge progressivement."
}
```

### Exercice 3 — Hip thrust
```json
{
  "name": "Hip thrust",
  "muscles": ["fessiers", "ischio-jambiers"],
  "category": "compound",
  "seance": "full_body",
  "location": "both",
  "equipment_maison": "canapé (ou banc) + haltère optionnel",
  "equipment_salle": "smith machine + coussin protection",
  "sets_default": 3,
  "reps_default": 15,
  "rest_seconds": 60,
  "description_maison": "Appuie le haut du dos contre le canapé, pieds au sol, genoux à 90°. Monte les hanches jusqu'à former une ligne droite épaules-hanches-genoux. Serre les fessiers 1 sec en haut. Redescends lentement.",
  "description_salle": "Dos contre un banc, barre posée sur les hanches avec un coussin de protection. Monte les hanches jusqu'à la ligne droite, serre les fessiers 1 sec. Redescends lentement.",
  "tip": "C'est le meilleur exercice pour les fessiers. Pose un haltère sur les hanches pour progresser à la maison.",
  "progression": "Ajoute du poids sur les hanches. À la salle, augmente la charge toutes les 2 semaines si tu fais les 15 reps facilement."
}
```

### Exercice 4 — Pompes
```json
{
  "name": "Pompes",
  "muscles": ["pectoraux", "épaules", "triceps"],
  "category": "compound",
  "seance": "full_body",
  "location": "maison",
  "equipment_maison": "aucun",
  "sets_default": 3,
  "reps_default": 8,
  "rest_seconds": 60,
  "description_maison": "Corps en ligne droite, mains légèrement plus larges que les épaules. Descends la poitrine vers le sol, pousse pour remonter. Commence sur les genoux si nécessaire.",
  "tip": "Pompes sur les genoux = 60% du travail des pompes normales. Passe aux pompes complètes quand tu fais 12 reps sur les genoux facilement.",
  "progression": "Genoux → pieds → pieds surélevés. Ajoute des reps avant d'augmenter la difficulté."
}
```

### Exercice 5 — Rowing haltères
```json
{
  "name": "Rowing haltères",
  "muscles": ["dos", "biceps", "arrière épaules"],
  "category": "compound",
  "seance": "full_body",
  "location": "both",
  "equipment_maison": "haltère ou sac à dos lesté",
  "equipment_salle": "haltère ou poulie basse",
  "sets_default": 3,
  "reps_default": 12,
  "rest_seconds": 60,
  "description_maison": "Penche le buste à 45°, une main posée sur une chaise. Tire le bras vers le haut en gardant le coude près du corps. Redescends lentement.",
  "description_salle": "Tirage poulie basse : assis, tire la poignée vers le nombril, dos droit, coudes près du corps.",
  "tip": "Sans haltères : remplis un sac à dos de livres. Sens le dos travailler, pas les bras.",
  "progression": "Augmente le poids de 1-2 kg quand tu fais les 3x12 sans forcer."
}
```

### Exercice 6 — Planche
```json
{
  "name": "Planche",
  "muscles": ["abdominaux", "dos", "stabilisateurs"],
  "category": "gainage",
  "seance": "full_body",
  "location": "both",
  "equipment_maison": "aucun",
  "sets_default": 3,
  "reps_default": 30,
  "rest_seconds": 45,
  "description_maison": "Sur les avant-bras et les orteils, corps droit de la tête aux talons. Ne laisse pas les hanches monter ou descendre. Respire normalement.",
  "tip": "Commence à 20 secondes et ajoute 5 sec par semaine. Qualité avant durée — mieux vaut 20 sec parfaites que 60 sec avec les hanches qui s'affaissent.",
  "progression": "20 sec → 30 sec → 45 sec → 60 sec → planche sur les pieds → planche avec élévation de jambe."
}
```

---

## SÉANCE 2 — UPPER / LOWER (vendredi)

### Exercice 7 — Élévations latérales
```json
{
  "name": "Élévations latérales",
  "muscles": ["épaules"],
  "category": "isolation",
  "seance": "upper_lower",
  "location": "both",
  "equipment_maison": "haltères ou bouteilles 1,5L",
  "equipment_salle": "haltères ou poulie",
  "sets_default": 3,
  "reps_default": 12,
  "rest_seconds": 60,
  "description_maison": "Debout, bras le long du corps, haltères en main. Monte les bras sur les côtés jusqu'à hauteur des épaules, coudes légèrement fléchis. Redescends lentement en 3 sec.",
  "tip": "Sans haltères : utilise des bouteilles d'eau 1,5L. La lenteur de la descente est ce qui fait travailler le muscle.",
  "progression": "Augmente de 0,5 kg à la fois — les épaules sont un groupe fragile. Priorise la technique."
}
```

### Exercice 8 — Curl biceps
```json
{
  "name": "Curl biceps",
  "muscles": ["biceps", "avant-bras"],
  "category": "isolation",
  "seance": "upper_lower",
  "location": "both",
  "equipment_maison": "haltères ou bouteilles",
  "equipment_salle": "haltères ou poulie basse",
  "sets_default": 3,
  "reps_default": 12,
  "rest_seconds": 60,
  "description_maison": "Debout ou assise, coudes collés au corps. Monte les haltères vers les épaules en contractant les biceps. Descends lentement. Ne balance pas le dos.",
  "description_salle": "Curl poulie basse : tension constante tout au long du mouvement, plus efficace que les haltères.",
  "tip": "Seuls les avant-bras bougent. Les coudes restent fixes le long du corps.",
  "progression": "Augmente de 1 kg quand tu fais 3x12 sans compenser avec le dos."
}
```

### Exercice 9 — Dips sur chaise
```json
{
  "name": "Dips sur chaise",
  "muscles": ["triceps", "épaules"],
  "category": "isolation",
  "seance": "upper_lower",
  "location": "both",
  "equipment_maison": "chaise ou canapé",
  "equipment_salle": "poulie haute (pushdown)",
  "sets_default": 3,
  "reps_default": 10,
  "rest_seconds": 60,
  "description_maison": "Mains sur le bord d'une chaise, jambes tendues devant. Descends les fesses vers le sol en fléchissant les coudes, remonte. Coudes qui pointent vers l'arrière.",
  "description_salle": "Pushdown triceps poulie haute : debout, coudes collés au corps, pousse vers le bas jusqu'à extension complète.",
  "tip": "Genoux fléchis pour réduire la difficulté. Les coudes ne doivent pas partir sur les côtés.",
  "progression": "Jambes fléchies → jambes tendues → jambes surélevées sur une chaise."
}
```

### Exercice 10 — Squat sumo
```json
{
  "name": "Squat sumo",
  "muscles": ["fessiers", "adducteurs", "quadriceps"],
  "category": "compound",
  "seance": "upper_lower",
  "location": "both",
  "equipment_maison": "aucun ou haltère",
  "equipment_salle": "smith machine",
  "sets_default": 3,
  "reps_default": 12,
  "rest_seconds": 60,
  "description_maison": "Pieds très écartés (plus que les épaules), orteils à 45°. Descends en gardant le dos droit, genoux dans l'axe des pieds. Tiens un haltère entre les jambes si dispo.",
  "description_salle": "Pieds très écartés sur la Smith, orteils à 45°. Place les pieds légèrement en avant de la barre pour cibler plus les fessiers.",
  "tip": "Le sumo cible plus les fessiers et l'intérieur des cuisses que le squat classique. Bonne complémentarité avec la séance 1.",
  "progression": "Ajoute un haltère tenu entre les jambes, puis augmente la charge progressivement."
}
```

### Exercice 11 — Glute bridge
```json
{
  "name": "Glute bridge",
  "muscles": ["fessiers", "ischio-jambiers", "abdominaux"],
  "category": "compound",
  "seance": "upper_lower",
  "location": "both",
  "equipment_maison": "aucun ou haltère",
  "equipment_salle": "haltère ou barre",
  "sets_default": 3,
  "reps_default": 15,
  "rest_seconds": 60,
  "description_maison": "Allongée sur le dos, genoux fléchis, pieds à plat. Monte les hanches en serrant les fessiers, tiens 2 sec en haut. Redescends sans poser les fesses entre les reps.",
  "tip": "Version plus accessible du hip thrust. Pose un haltère sur les hanches pour progresser. Excellent aussi pour les douleurs lombaires.",
  "progression": "Sans poids → haltère léger → haltère lourd → hip thrust (version avancée)."
}
```

### Exercice 12 — Mollets debout
```json
{
  "name": "Mollets debout",
  "muscles": ["mollets", "stabilisateurs"],
  "category": "isolation",
  "seance": "upper_lower",
  "location": "both",
  "equipment_maison": "marche d'escalier",
  "equipment_salle": "smith machine ou marche",
  "sets_default": 3,
  "reps_default": 20,
  "rest_seconds": 45,
  "description_maison": "Debout sur une marche d'escalier (talon dans le vide). Monte sur la pointe des pieds, tiens 1 sec, redescends lentement sous le niveau de la marche.",
  "description_salle": "Barre sur les trapèzes, pieds sur une plaque de poids (talon dans le vide). Même mouvement avec charge.",
  "tip": "L'amplitude complète (talon dans le vide) est bien plus efficace qu'au sol. Tiens-toi à un mur si besoin d'équilibre.",
  "progression": "Ajoute des reps (20→25→30) puis augmente la charge."
}
```

---

## NATATION — Niveaux et blocs

```json
{
  "levels": [
    {
      "level": 1,
      "name": "Départ",
      "description": "1 000 m — blocs 50 brasse + 150 crawl × 5",
      "structure": "5x(50B + 150C)",
      "total_distance": 1000,
      "crawl_m": 750,
      "breaststroke_m": 250,
      "criteria": "Terminer sans être épuisée, les 6 longueurs crawl se font sans s'arrêter"
    },
    {
      "level": 2,
      "name": "Étape 1",
      "description": "1 100 m — réduire la brasse à 25 m entre les blocs",
      "structure": "5x(25B + 175C)",
      "total_distance": 1100,
      "crawl_m": 875,
      "breaststroke_m": 125,
      "criteria": "Arriver à la brasse encore fraîche, sans envie de s'arrêter avant"
    },
    {
      "level": 3,
      "name": "Étape 2",
      "description": "1 300 m — blocs 200 m crawl + 30 sec pause",
      "structure": "5x200C + 30s repos",
      "total_distance": 1300,
      "crawl_m": 1000,
      "breaststroke_m": 100,
      "criteria": "5 blocs de 200 m sans brasse au milieu, juste la pause"
    },
    {
      "level": 4,
      "name": "Étape 3",
      "description": "1 600 m — blocs 400 m crawl + 1 min pause",
      "structure": "3x400C + 1min repos",
      "total_distance": 1600,
      "crawl_m": 1200,
      "breaststroke_m": 50,
      "criteria": "3 blocs de 400 m à allure régulière, le 3ème ressemble au 1er"
    },
    {
      "level": 5,
      "name": "Étape 4 — Objectif",
      "description": "2 000 m+ — crawl dominant",
      "structure": "800C + 100B + 8x50C + 300C + 100B",
      "total_distance": 2000,
      "crawl_m": 1500,
      "breaststroke_m": 200,
      "criteria": "Crawl dominant, brasse = plaisir ou récupération uniquement"
    }
  ]
}
```

---

## YOGA — Types de séances

```json
{
  "sessions": [
    {
      "type": "yin",
      "name": "Yoga yin — douceur",
      "phase_cycle": ["menstruation", "luteale"],
      "duration_min": 35,
      "description": "Postures tenues longtemps au sol. Objectif : relâcher les tensions, calmer le système nerveux.",
      "postures": [
        {"name": "Posture de l'enfant", "duration_sec": 180, "benefit": "Relâche le bas du dos"},
        {"name": "Papillon couché", "duration_sec": 240, "benefit": "Soulage les crampes utérines"},
        {"name": "Torsion douce allongée", "duration_sec": 120, "benefit": "Masse les organes digestifs"},
        {"name": "Jambes au mur", "duration_sec": 300, "benefit": "Fatigue et jambes lourdes"},
        {"name": "Pigeon couché", "duration_sec": 180, "benefit": "Hanches et bas du dos"},
        {"name": "Sphinx", "duration_sec": 180, "benefit": "Étire le ventre"},
        {"name": "Pince assise", "duration_sec": 240, "benefit": "Chaîne postérieure complète"},
        {"name": "Savasana", "duration_sec": 300, "benefit": "Intégration et récupération"}
      ]
    },
    {
      "type": "flow",
      "name": "Yoga flow — vinyasa",
      "phase_cycle": ["folliculaire"],
      "duration_min": 45,
      "description": "Enchaînements fluides, montée en chaleur progressive. Renforcer en douceur.",
      "postures": [
        {"name": "Salutation au soleil A", "duration_sec": 300, "benefit": "Échauffement complet"},
        {"name": "Guerrier 1", "duration_sec": 120, "benefit": "Force et équilibre"},
        {"name": "Guerrier 2", "duration_sec": 120, "benefit": "Hanches ouvertes"},
        {"name": "Chien tête en bas", "duration_sec": 90, "benefit": "Étirement global"},
        {"name": "Fente basse", "duration_sec": 120, "benefit": "Flexibilité hanches"},
        {"name": "Torsion assise", "duration_sec": 90, "benefit": "Mobilité du dos"},
        {"name": "Pont", "duration_sec": 120, "benefit": "Fessiers et dos"},
        {"name": "Savasana", "duration_sec": 300, "benefit": "Récupération"}
      ]
    },
    {
      "type": "power",
      "name": "Yoga power — dynamique",
      "phase_cycle": ["ovulation"],
      "duration_min": 50,
      "description": "Séquences intenses, équilibres, renforcement. Profiter du pic d'énergie.",
      "postures": [
        {"name": "Salutation au soleil B", "duration_sec": 360, "benefit": "Échauffement intensif"},
        {"name": "Guerrier 3", "duration_sec": 120, "benefit": "Équilibre et force"},
        {"name": "Planche latérale", "duration_sec": 90, "benefit": "Gainage profond"},
        {"name": "Crow (Bakasana)", "duration_sec": 120, "benefit": "Force bras et équilibre"},
        {"name": "Torsion debout", "duration_sec": 90, "benefit": "Mobilité et force"},
        {"name": "Demi-lune", "duration_sec": 120, "benefit": "Équilibre et hanches"},
        {"name": "Bateau", "duration_sec": 120, "benefit": "Abdominaux profonds"},
        {"name": "Savasana", "duration_sec": 300, "benefit": "Récupération"}
      ]
    }
  ]
}
```

---

## Message complet à coller dans Cursor

```
@SPECS.md

Voici les données complètes pour intégrer les séances sport dans l'appli.

Je veux que tu :

1. Crées la table `exercises` dans Supabase avec le SQL ci-dessus
2. Crées un fichier `lib/data/exercises.ts` avec tous les exercices en TypeScript
3. Crées un fichier `lib/data/swimming.ts` avec les 5 niveaux natation
4. Crées un fichier `lib/data/yoga.ts` avec les 3 types de séances et leurs postures
5. Mettes à jour `components/sport/WorkoutLog.tsx` pour :
   - Choisir le type de séance (Full body / Upper-Lower)
   - Choisir maison ou salle
   - Sélectionner les exercices de la liste (pré-remplis selon le type)
   - Entrer séries / reps / poids pour chaque exercice
   - Sauvegarder dans Supabase (tables workouts + workout_sets)
6. Mettes à jour `components/sport/SwimLog.tsx` pour :
   - Choisir son niveau actuel (1 à 5)
   - Voir la structure recommandée du niveau
   - Entrer distance réelle + notes
7. Mettes à jour `components/sport/YogaSession.tsx` pour :
   - Proposer automatiquement le bon type selon la phase du cycle
   - Lancer un timer guidé posture par posture
   - Cocher les postures terminées

Dis-moi les fichiers que tu vas créer ou modifier avant de commencer.
```
