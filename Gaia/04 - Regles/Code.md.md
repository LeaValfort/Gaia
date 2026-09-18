# Règles de code absolues

## Structure
- 1 fichier = 1 responsabilité, MAX 150 lignes
- Logique métier → lib/ UNIQUEMENT
- Appels Supabase → lib/db/ UNIQUEMENT
- Composants → reçoivent des props, ne fetchent JAMAIS

## TypeScript
- Tous les types partagés → types/index.ts
- Jamais de `any`
- Props des composants toujours typées

## UI
- shadcn/ui pour TOUS les éléments UI
- Lucide React pour TOUTES les icônes
- Jamais de style inline
- Dark mode obligatoire (`dark:` classes)
- Responsive mobile-first

## Code
- Pas de console.log dans le code final
- Toujours gérer loading + error
- Pas de magic numbers → constantes nommées