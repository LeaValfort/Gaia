// Détail complet d'une recette générée par l'IA (tous les ingrédients + étapes numérotées),
// affiché dans la modale ouverte depuis RecetteGenereeCard. Composant muet : pas de fetch ici.

import { parserIngredientCourses } from '@/lib/db/shopping-items'
import type { RecetteGeneree } from '@/types'

interface RecetteGenereeDetailProps {
  recette: RecetteGeneree
}

/** Étapes de préparation, une par ligne non vide. */
function decouperEtapes(instructions: string): string[] {
  return instructions.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
}

export function RecetteGenereeDetail({ recette }: RecetteGenereeDetailProps) {
  const etapes = decouperEtapes(recette.instructions)

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-50 mb-2">🛒 Ingrédients</h3>
        <ul className="flex flex-col gap-1">
          {recette.ingredients.map((ing) => {
            const { nom, quantite } = parserIngredientCourses(ing)
            return (
              <li
                key={ing}
                className="flex justify-between gap-2 text-sm text-neutral-700 dark:text-neutral-300 py-1 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
              >
                <span>{nom}</span>
                <span className="text-neutral-500 dark:text-neutral-400 shrink-0">{quantite ?? '—'}</span>
              </li>
            )
          })}
        </ul>
      </section>

      {etapes.length > 0 ? (
        <section>
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-50 mb-2">👩‍🍳 Préparation</h3>
          <ol className="flex flex-col gap-3">
            {etapes.map((etape, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{etape}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  )
}
