import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Users } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { BoutonsRecette } from '@/components/alimentation/BoutonsRecette'
import { EnTeteRecette } from '@/components/alimentation/EnTeteRecette'
import { creerClientServeur } from '@/lib/supabase-server'
import { parserIngredientCourses } from '@/lib/db/shopping-items'
import { calculerNutriScore } from '@/lib/nutrition/nutri-score'

interface PageProps {
  params: Promise<{ id: string }>
}

/** Étapes de préparation, une par ligne non vide (fonctionne pour saisie manuelle et IA). */
function decouperEtapes(instructions: string | null | undefined): string[] {
  if (!instructions?.trim()) return []
  return instructions.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
}

export default async function PageDetailRecette({ params }: PageProps) {
  const { id } = await params
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recette } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!recette) notFound()

  const portions = recette.portions ?? 1
  const etapes = decouperEtapes(recette.instructions)
  const ingredients = (recette.ingredients as string[]).map(parserIngredientCourses)
  const nutriScore = recette.nutrition_100g ? calculerNutriScore(recette.nutrition_100g) : null

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-6 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        <Link href="/alimentation" className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors w-fit">
          <ArrowLeft size={16} /> Retour
        </Link>

        <EnTeteRecette recette={recette} userId={user.id} nutriScore={nutriScore} />

        <div className="flex gap-4 text-sm text-neutral-600 dark:text-neutral-400">
          {recette.temps_min ? (
            <span className="flex items-center gap-1.5"><Clock size={15} /> {recette.temps_min} min</span>
          ) : null}
          <span className="flex items-center gap-1.5"><Users size={15} /> {portions} portion{portions > 1 ? 's' : ''}</span>
        </div>

        {(recette.calories || recette.proteines || recette.glucides || recette.lipides) ? (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Calories', valeur: recette.calories, unite: 'kcal', couleur: 'text-orange-600 dark:text-orange-400' },
              { label: 'Protéines', valeur: recette.proteines, unite: 'g', couleur: 'text-blue-600 dark:text-blue-400' },
              { label: 'Glucides', valeur: recette.glucides, unite: 'g', couleur: 'text-amber-600 dark:text-amber-400' },
              { label: 'Lipides', valeur: recette.lipides, unite: 'g', couleur: 'text-green-600 dark:text-green-400' },
            ].map(({ label, valeur, unite, couleur }) => (
              <div key={label} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 text-center">
                <p className={`text-lg font-bold ${couleur}`}>{valeur ?? '—'}<span className="text-xs font-normal ml-0.5">{unite}</span></p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        ) : null}

        <Separator />

        <section>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-3">🛒 Ingrédients</h2>
          <ul className="flex flex-col gap-1.5">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex justify-between text-sm text-neutral-700 dark:text-neutral-300 py-1 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                <span>{ing.nom}</span>
                <span className="text-neutral-500 dark:text-neutral-400">{ing.quantite ?? '—'}</span>
              </li>
            ))}
          </ul>
        </section>

        {etapes.length > 0 ? (
          <>
            <Separator />
            <section>
              <h2 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-3">👩‍🍳 Préparation</h2>
              <ol className="flex flex-col gap-4">
                {etapes.map((instruction, i) => (
                  <li key={i} className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="leading-relaxed">{instruction}</span>
                  </li>
                ))}
              </ol>
            </section>
          </>
        ) : null}

        <Separator />

        <BoutonsRecette recette={recette} userId={user.id} />

      </div>
    </main>
  )
}
