# REFONTE_PLAN.md — Refonte mobile de Gaia
> Plan détaillé de la refonte UX mobile.
> À lire avant de démarrer chaque chantier.

---

## 🎯 Objectif principal

Eliminer la redondance et alléger l'expérience mobile.
Une info = un seul endroit. Pas de scroll inutile.

---

## 📐 Principes appliqués

1. **Une info, un seul endroit.** Si la phase du cycle est sur Accueil, elle ne réapparaît pas 3 fois ailleurs.
2. **La nav du bas dit où on est.** Plus besoin de gros bandeau d'en-tête sur chaque page.
3. **Mobile first.** 4 sections max par page d'accueil. Le reste = 1 tap.
4. **Cohérence design.** Tous les boutons d'action en violet (couleur d'accent).
5. **Architecture respectée.** Logique métier dans `lib/`, BDD dans `lib/db/`, composants muets dans `components/`.

---

## 🗂️ Décisions validées

| Sujet | Décision |
|---|---|
| Page Accueil | Réduire de 9 sections à 4 |
| Bloc "Cycle aperçu" sur Accueil | ❌ Supprimé |
| Bloc "Macros cibles" sur Accueil | ❌ Supprimé (déjà sur Manger) |
| Bloc "Nutrition" sur Accueil | ❌ Supprimé (déjà sur Cycle/Manger) |
| Bloc "Mouvement" sur Accueil | Fusionné dans "Ma séance du jour" |
| Bloc "Prochain cycle" sur Accueil | ❌ Supprimé (déjà sur Cycle) |
| Agenda + To-do | ✅ Gardés, **Agenda avant To-do** |
| Journal rapide | Énergie + Douleur + Note libre uniquement (détails déplacés sur Cycle) |
| Bandeaux d'en-tête marketing | ❌ Supprimés sur toutes les pages |
| Sous-onglets tronqués | Renommés courts ou icônes-only |
| Boutons noirs | Harmonisés en violet |

---

## 🏗️ Chantiers — ordre d'exécution

### Chantier 0 — Préparation (avant de coder)
**Fichiers nouveaux :**
- `components/shared/PageHeader.tsx` (nouveau composant)

**But :** Créer un header compact réutilisable pour remplacer les gros bandeaux violets.
- Props : `title: string`, `subtitle?: string`, `phaseBadge?: ReactNode`
- Hauteur réduite ~60-80px au lieu de ~200px actuellement
- Dark mode + responsive obligatoire

---

### Chantier A — Refonte page Accueil (le plus gros impact)

**Fichiers à modifier :**
- `app/page.tsx` — la page d'accueil
- Composants concernés (à identifier dans le code) :
  - Header / bloc "Aujourd'hui"
  - Bloc phase + jour du cycle
  - Bloc séance / mouvement
  - Bloc journal
  - Bloc to-do
  - Bloc agenda

**Ce qu'on fait :**

#### Avant (9 sections)
1. Header "Aujourd'hui mercredi 6 mai 2026" (gros bandeau)
2. Bloc Lutéale 17/26 jours (gros bloc avec barre progression)
3. Cycle aperçu (4 cartes phases)
4. Sport (conseil phase)
5. Nutrition (conseil phase)
6. Mouvement (séance conseillée)
7. Macros cibles (4 lignes)
8. Journal du jour (énergie + douleur + 5 détails)
9. To-do + Agenda + Prochain cycle

#### Après (5 sections, plus courtes)
1. **Header compact** : date + badge phase + jour cycle (1 ligne, ~80px)
2. **Ma séance du jour** : nom + durée + bouton "Commencer" (action principale)
3. **Journal rapide** : énergie (1-5) + douleur (0-10) + note libre + bouton Sauvegarder
4. **Agenda du jour** : RDV ou "Aucun événement" + bouton Créer
5. **To-do du jour** : tâches + champ ajout

**À supprimer :**
- ❌ Bloc "Cycle aperçu" (4 cartes phases)
- ❌ Bloc "Sport" séparé (fusionné dans "Ma séance du jour")
- ❌ Bloc "Nutrition" (déjà sur Cycle et Manger)
- ❌ Bloc "Mouvement" séparé (fusionné dans "Ma séance du jour")
- ❌ Bloc "Macros cibles" (déjà sur Manger)
- ❌ Bloc "Prochain cycle dans X jours" (déjà sur Cycle)
- ❌ Sections détails du journal (Émotions, Symptômes, Libido, Sommeil, Appétit)
  → Déplacées sur page Cycle au clic sur un jour

**À déplacer :**
- Détails du journal (5 catégories) → sur page Cycle, au clic sur un jour du calendrier

---

### Chantier B — Header partagé sur toutes les pages

**Fichiers à modifier :**
- `app/cycle/page.tsx`
- `app/sport/page.tsx`
- `app/alimentation/page.tsx`
- `app/parametres/page.tsx`
- `app/progression/page.tsx`
- Page "Plus" (chemin à confirmer)
- Page "Proches" (chemin à confirmer)

**Ce qu'on fait :**
Remplacer les gros bandeaux violets descriptifs par le `PageHeader` compact créé au Chantier 0.

**Avant :**
```
┌─────────────────────────────┐
│                             │
│  Mon cycle                  │
│                             │
│  Calendrier des phases,     │
│  prédictions en pointillés  │
│  et suivi du retard...      │
│                             │
└─────────────────────────────┘
```

**Après :**
```
┌─────────────────────────────┐
│ Mon cycle    [Lutéale · J17]│
└─────────────────────────────┘
```

---

### Chantier C — Page Cycle

**Fichiers à modifier :**
- `app/cycle/page.tsx`
- `components/cycle/DailyLogForm.tsx` (probable)

**Ce qu'on fait :**
- Appliquer le `PageHeader` (Chantier B)
- ❌ Supprimer le bloc "Phase actuelle Lutéale Jour 17 sur 26" (redondant avec la pastille du calendrier)
- ✅ Au clic sur un jour du calendrier, afficher le formulaire complet de log avec les détails (Émotions, Symptômes, Libido, Sommeil, Appétit) — déplacés depuis Accueil
- Garder : calendrier, conseils par phase, bouton "Mes règles ont commencé", statistiques

---

### Chantier D — Page Sport

**Fichiers à modifier :**
- `app/sport/page.tsx`
- Composants sport (à identifier)

**Ce qu'on fait :**
- Appliquer le `PageHeader` (Chantier B)
- ❌ Supprimer le bandeau "Lutéale · J17 + conseil" répété sur les 5 sous-onglets (Plan / Muscu / Natation / Yoga / Autre) → garder UNIQUEMENT sur l'onglet Plan
- ❌ Supprimer le bloc "Cette semaine + Mon planning + Dernières séances" sur les sous-onglets autres que Plan → centraliser uniquement sur Plan
- ✅ Sous-onglets : remplacer "Pla..." / "Mu..." / "Na..." par des noms courts ou des icônes-only
  - Soit : 📅 / 💪 / 🏊 / 🧘 / 🎯 (icônes seules)
  - Soit : "Plan" / "Muscu" / "Nat." / "Yoga" / "Autre" (noms courts)
- ✅ Boutons "Sauvegarder", "Enregistrer", "Mode guidé" en noir → violet

---

### Chantier E — Page Manger

**Fichiers à modifier :**
- `app/alimentation/page.tsx`
- Composants alimentation (à identifier)

**Refonte la plus structurelle.**

**Avant :** 6 sous-onglets dans une seule page (Plan / Journal / Checklist / Suggestions / Courses / Recettes)

**Après proposé :** 1 page principale + sous-pages

Page principale "Manger" :
- `PageHeader` compact (Chantier B)
- Bloc "Tes besoins du jour" (macros cibles selon phase) → garder
- **Onglet "Journal du jour"** par défaut (saisie nutriments + macros, le plus utilisé)

Sous-pages accessibles via un menu "Plus" ou des cartes :
- Plan de la semaine
- Checklist anti-inflammatoire
- Suggestions IA
- Liste de courses
- Recettes

OU alternative : conserver les sous-onglets mais avec des noms courts (pas de "P...", "J...", "C...").

→ **À discuter avec toi avant de coder ce chantier.**

---

### Chantier F — Cohérence boutons et accents

**Fichiers concernés :** transverse (tous les écrans avec boutons d'action)

**Ce qu'on fait :**
- Remplacer tous les boutons d'action noirs par des boutons violets
- Vérifier la cohérence des "Enregistrer", "Sauvegarder", "Modifier"
- S'assurer que la couleur d'accent violette est utilisée partout

---

## ✅ Checklist avant de démarrer un chantier

Pour chaque chantier, je suis ce processus :

1. **Lire SPECS.md et .cursorrules** (tu m'y as déjà donné accès)
2. **Annoncer la liste exacte des fichiers à créer/modifier**
3. **Attendre ta validation** (surtout pour les chantiers 3+ fichiers)
4. **Coder une chose à la fois**
5. **Rappeler comment tester après chaque modif**
6. **Signaler les effets de bord** (types, BDD, etc.)

---

## 🚦 Ordre conseillé

1. **Chantier 0** → composant `PageHeader` (rapide, fondation pour B)
2. **Chantier A** → page Accueil (impact maximal)
3. **Chantier B** → header partagé sur toutes les pages
4. **Chantier C** → page Cycle (déplacement des détails du journal)
5. **Chantier D** → page Sport (suppression redondances)
6. **Chantier E** → page Manger (refonte structure)
7. **Chantier F** → cohérence boutons (transverse, en dernier pour tout harmoniser)

---

## 📝 Notes

- Tous les fichiers respectent la limite **150 lignes max**.
- Si un fichier dépasse, je le découpe sans demander.
- Aucun appel Supabase hors `lib/db/`.
- Aucune logique métier dans les pages.
- Dark mode + responsive obligatoires sur chaque modif.
