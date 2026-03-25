# SPECS.md — Mon Plan de Vie
> Fichier de contexte pour Cursor. A lire avant chaque session de développement.

---

## Vision du projet

Application web personnelle (usage solo) qui centralise le suivi du cycle menstruel, du sport, de l'alimentation et du bien-être. Tout s'adapte automatiquement selon la phase du cycle du jour.

**Utilisatrice** : 1 seule personne, usage quotidien sur PC, tablette et téléphone.
**Philosophie UI** : minimaliste type Notion, dark mode / light mode, responsive obligatoire.

---

## Stack technique

| Techno | Rôle | Version |
|--------|------|---------|
| Next.js | Framework (App Router) | 14+ |
| TypeScript | Typage statique | 5+ |
| Tailwind CSS | Styles + responsive + dark mode | 3+ |
| shadcn/ui | Composants UI (boutons, inputs, modales...) | latest |
| Lucide React | Icônes | latest |
| Supabase | BDD PostgreSQL + Auth Google | latest |
| Vercel | Hébergement + CI/CD | — |
| Recharts | Graphiques (page Progression) | latest |
| next-themes | Gestion dark/light mode | latest |
| date-fns | Manipulation des dates | latest |

---

## Architecture des fichiers

```
mon-plan-de-vie/
├── app/                        ← pages Next.js App Router
│   ├── page.tsx                ← Vue "Aujourd'hui" (page d'accueil)
│   ├── cycle/
│   │   └── page.tsx            ← Calendrier + suivi cycle
│   ├── sport/
│   │   └── page.tsx            ← Tracker muscu / natation / yoga
│   ├── alimentation/
│   │   └── page.tsx            ← Checklist + suggestions de plats
│   ├── progression/
│   │   └── page.tsx            ← Graphiques + bilans
│   ├── parametres/
│   │   └── page.tsx            ← Réglages utilisateur
│   └── api/                    ← Routes serveur uniquement
│       ├── cycle/route.ts
│       ├── workouts/route.ts
│       ├── nutrition/route.ts
│       └── suggestions/route.ts ← Appels API Claude pour les plats
│
├── components/                 ← UI réutilisable, MUETTE (pas de fetch ici)
│   ├── ui/                     ← Composants shadcn/ui
│   ├── cycle/
│   │   ├── CycleCalendar.tsx   ← Calendrier mensuel continu
│   │   ├── PhaseCard.tsx       ← Badge phase du jour
│   │   └── DailyLogForm.tsx    ← Saisie énergie/douleur/humeur
│   ├── sport/
│   │   ├── WorkoutLog.tsx      ← Logger une séance
│   │   ├── ExerciseRow.tsx     ← Ligne exercice (muscu)
│   │   ├── SwimLog.tsx         ← Log natation avec niveaux
│   │   └── YogaSession.tsx     ← Log yoga + routine guidée
│   ├── todo/
│   │   └── TodoList.tsx        ← To-do liste quotidienne
│   └── shared/
│       ├── Header.tsx
│       ├── Nav.tsx             ← Navigation responsive
│       └── EnergySlider.tsx    ← Slider réutilisable 1-5 / 0-10
│
├── lib/                        ← Logique métier pure, PAS de UI ici
│   ├── cycle.ts                ← Calcul phases, détection J1, durée cycle
│   ├── sport.ts                ← Logique séances, niveaux natation
│   ├── nutrition.ts            ← Logique anti-inflammatoire, suggestions
│   └── db/                     ← TOUS les appels Supabase ici uniquement
│       ├── cycle.ts
│       ├── workouts.ts
│       ├── nutrition.ts
│       └── todo.ts
│
├── hooks/                      ← Logique React réutilisable
│   ├── useCycle.ts             ← Phase courante, jour du cycle
│   ├── useWorkouts.ts          ← Historique séances
│   └── useTodo.ts              ← To-do du jour
│
├── types/
│   └── index.ts                ← TOUS les types TypeScript du projet
│
├── SPECS.md                    ← CE FICHIER
└── .cursorrules                ← Règles de code pour Cursor
```

---

## Pages et fonctionnalités

### Page "Aujourd'hui" — `/` (accueil)
- Phase du cycle détectée automatiquement + numéro du jour
- Conseil sport adapté à la phase du jour
- Conseil alimentation adapté à la phase du jour
- Journal rapide : énergie (1-5), douleur (0-10), humeur, notes
- To-do liste du jour (manuelle + tâches auto selon phase en V2)
- Bouton "Commencer la séance" si séance prévue ce jour

### Page "Mon cycle" — `/cycle`
- Calendrier mensuel CONTINU (pas 26 jours, un vrai calendrier)
- Chaque jour coloré selon la phase estimée du cycle
- Clic sur un jour → formulaire de log (énergie, douleur, humeur, notes)
- Durée du cycle paramétrable (défaut : 26 jours)
- Historique des cycles précédents
- En V2 : détection automatique durée réelle après 3 cycles

### Page "Sport" — `/sport`
- 3 onglets : Muscu | Natation | Yoga + Activités fun
- **Muscu** : choix maison/salle, exercices + séries + charges, historique progression
- **Natation** : niveau actuel (1→4), structure des blocs (ex: 5x(50B+150C)), distance crawl/brasse
- **Yoga** : type (yin/flow/power selon phase), durée, routine guidée avec timer intégré
- Séances adaptées selon la phase du cycle

### Page "Alimentation" — `/alimentation`
- Checklist anti-inflammatoire hebdomadaire
- Rappel batch cooking du dimanche (overnight oats + egg muffins)
- Recommandations selon phase du cycle
- En V2 : suggestions de plats IA (profil alimentaire × phase × temps dispo)

### Page "Progression" — `/progression`
- Graphiques : évolution douleurs cycle par cycle
- Régularité sport (semaines actives)
- Évolution charges muscu par exercice
- Niveau natation au fil du temps
- Bilan mensuel exportable PDF/Excel (V2)

### Page "Paramètres" — `/parametres`
- Durée du cycle (défaut 26 jours)
- Date de début du dernier cycle
- Profil alimentaire (goûts, allergies, temps de cuisine)
- Notifications on/off
- Thème clair/sombre
- Export des données
- Déconnexion

---

## Base de données Supabase

### Table `cycles`
```sql
id          uuid PRIMARY KEY
user_id     uuid REFERENCES auth.users
start_date  date NOT NULL
cycle_length integer DEFAULT 26
notes       text
created_at  timestamp DEFAULT now()
```

### Table `daily_logs`
```sql
id          uuid PRIMARY KEY
user_id     uuid REFERENCES auth.users
date        date NOT NULL
cycle_day   integer          -- jour dans le cycle (1-N)
phase       text             -- 'menstruation' | 'folliculaire' | 'ovulation' | 'luteale'
energy      integer          -- 1 à 5
pain        integer          -- 0 à 10
mood        text
notes       text
created_at  timestamp DEFAULT now()
```

### Table `workouts`
```sql
id          uuid PRIMARY KEY
user_id     uuid REFERENCES auth.users
date        date NOT NULL
type        text             -- 'muscu' | 'natation' | 'yoga' | 'escalade' | 'autre'
duration_min integer
location    text             -- 'maison' | 'salle'
feeling     integer          -- 1 à 5
notes       text
created_at  timestamp DEFAULT now()
```

### Table `workout_sets` (pour la muscu)
```sql
id              uuid PRIMARY KEY
workout_id      uuid REFERENCES workouts
exercise_name   text NOT NULL
sets            integer
reps            integer
weight_kg       decimal
```

### Table `swim_logs` (pour la natation)
```sql
id                  uuid PRIMARY KEY
workout_id          uuid REFERENCES workouts
level               integer          -- 1 à 4
total_distance_m    integer
crawl_m             integer
breaststroke_m      integer
block_structure     text             -- ex: "5x(50B+150C)"
```

### Table `nutrition_logs`
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES auth.users
week_start      date NOT NULL
checklist       jsonb            -- état de chaque item
batch_done      boolean DEFAULT false
notes           text
created_at      timestamp DEFAULT now()
```

### Table `todos`
```sql
id          uuid PRIMARY KEY
user_id     uuid REFERENCES auth.users
date        date NOT NULL
text        text NOT NULL
done        boolean DEFAULT false
auto        boolean DEFAULT false  -- true = générée par l'appli
created_at  timestamp DEFAULT now()
```

### Table `user_preferences`
```sql
id                  uuid PRIMARY KEY
user_id             uuid REFERENCES auth.users UNIQUE
cycle_length        integer DEFAULT 26
last_cycle_start    date
food_likes          text[]
food_dislikes       text[]
food_allergies      text[]
cook_time_minutes   integer DEFAULT 30
theme               text DEFAULT 'system'
notifications       boolean DEFAULT true
```

---

## Phases du cycle

```typescript
// lib/cycle.ts — logique de référence
export type Phase = 'menstruation' | 'folliculaire' | 'ovulation' | 'luteale'

export function getPhaseForDay(day: number, cycleLength: number): Phase {
  if (day <= 4) return 'menstruation'
  if (day <= Math.round(cycleLength * 0.42)) return 'folliculaire'
  if (day <= Math.round(cycleLength * 0.54)) return 'ovulation'
  return 'luteale'
}

export function getCycleDay(lastStartDate: Date, today: Date, cycleLength: number): number {
  const diff = differenceInDays(today, lastStartDate)
  return (diff % cycleLength) + 1
}
```

### Couleurs des phases (Tailwind)
- Menstruation : `teal` (E1F5EE / 085041)
- Folliculaire : `amber` (FAEEDA / 412402)
- Ovulation : `coral/red` (FAECE7 / 4A1B0C)
- Lutéale : `purple` (EEEDFE / 26215C)

---

## Programme sport de référence

### Semaine type
- Lundi : Muscu full body (45 min)
- Mardi : Yoga flow (40 min)
- Mercredi : Activité fun (piscine / escalade)
- Jeudi : Repos actif
- Vendredi : Muscu upper/lower (45 min)
- Samedi : Yoga yin (45 min)
- Dimanche : Repos complet

### Niveaux natation
1. Départ : blocs 50B + 150C × 5 = 1 000 m
2. Étape 1 : blocs 25B + 175C × 5 = 1 100 m
3. Étape 2 : blocs 200C + 30s pause × 5 = 1 300 m
4. Étape 3 : blocs 400C + 1min pause × 3 = 1 600 m
5. Étape 4 : crawl dominant, 2 000 m+

---

## Roadmap

### MVP (à coder en premier)
1. Setup : Next.js + Supabase + Vercel + Auth Google
2. Page "Aujourd'hui" : phase + journal + to-do manuelle
3. Page "Mon cycle" : calendrier mensuel + log quotidien
4. Page "Sport" : 3 onglets muscu/natation/yoga
5. Design : shadcn/ui + Lucide + Tailwind dark mode

### V2
- Suggestions de plats IA (API Claude)
- To-do auto selon phase + planning sport
- Page Alimentation complète
- Graphiques progression
- Export PDF/Excel
- Notifications
- Détection durée cycle réelle

### V3
- Import CSV depuis Flo
- App iOS compagnon + connexion Apple Santé (HealthKit)
- Carnet de recettes personnel

---

## Intégrations futures

| Service | Statut | Notes |
|---------|--------|-------|
| Flo (Menstruations) | Import CSV en V3 | Pas d'API publique |
| Apple Santé (HealthKit) | App iOS V3 | Nécessite React Native |
| Google Fit / Fitbit | Possible en V2 | APIs ouvertes |
| Claude API | V2 (suggestions plats) | ~0.003€/suggestion |

