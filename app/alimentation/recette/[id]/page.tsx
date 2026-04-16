import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BoutonsRecette } from '@/components/alimentation/BoutonsRecette'
import { creerClientServeur } from '@/lib/supabase-server'
import { fetchRecetteDetail } from '@/lib/spoonacular'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PageDetailRecette({ params }: PageProps) {
  const { id } = await params
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()

  const recette = await fetchRecetteDetail(id)
  if (!recette) notFound()

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-6 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        <Link href="/alimentation" className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors w-fit">
          <ArrowLeft size={16} /> Retour aux suggestions
        </Link>

        {recette.image && (
          <img src={recette.image} alt={recette.titre} className="w-full h-56 sm:h-72 object-cover rounded-2xl" />
        )}

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 leading-snug">{recette.titre}</h1>
          {recette.regimes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recette.regimes.map((r) => (
                <Badge key={r} variant="secondary" className="text-xs capitalize">{r}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1.5"><Clock size={15} /> {recette.tempsMin} min</span>
          <span className="flex items-center gap-1.5"><Users size={15} /> {recette.portions} portions</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Calories', valeur: recette.calories, unite: 'kcal', couleur: 'text-orange-600 dark:text-orange-400' },
            { label: 'Protéines', valeur: recette.proteines, unite: 'g', couleur: 'text-blue-600 dark:text-blue-400' },
            { label: 'Glucides', valeur: recette.glucides, unite: 'g', couleur: 'text-amber-600 dark:text-amber-400' },
            { label: 'Lipides', valeur: recette.lipides, unite: 'g', couleur: 'text-green-600 dark:text-green-400' },
          ].map(({ label, valeur, unite, couleur }) => (
            <div key={label} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 text-center">
              <p className={`text-lg font-bold ${couleur}`}>{valeur}<span className="text-xs font-normal ml-0.5">{unite}</span></p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <Separator />

        <section>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-3">🛒 Ingrédients</h2>
          <ul className="flex flex-col gap-1.5">
            {recette.ingredients.map((ing, i) => (
              <li key={i} className="flex justify-between text-sm text-neutral-700 dark:text-neutral-300 py-1 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                <span>{ing.nom}</span>
                <span className="text-neutral-500 dark:text-neutral-400">{ing.quantite}</span>
              </li>
            ))}
          </ul>
        </section>

        <Separator />

        {recette.etapes.length > 0 && (
          <section>
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-3">👩‍🍳 Préparation</h2>
            <ol className="flex flex-col gap-4">
              {recette.etapes.map((etape) => (
                <li key={etape.numero} className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center justify-center">{etape.numero}</span>
                  <span className="leading-relaxed">{etape.instruction}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <Separator />

        <BoutonsRecette recette={recette} userId={user?.id ?? ''} />

        <a href={recette.urlOriginale} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors w-fit mx-auto">
          <ExternalLink size={12} /> Voir la recette originale
        </a>

      </div>
    </main>
  )
}
