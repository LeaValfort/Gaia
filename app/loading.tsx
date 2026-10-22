import { Nav } from '@/components/shared/Nav'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Écran de chargement générique, affiché immédiatement à chaque changement
 * d'onglet pour les pages qui n'ont pas le leur (Accueil, Sport, Alimentation,
 * Progression, fiche recette). Évite l'impression que l'appli est figée
 * pendant que le serveur charge les données.
 */
export default function ChargementPage() {
  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav phase={null} prenom="…" />
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6 pb-24 sm:px-6">
        <Skeleton className="h-10 w-1/2 rounded-lg" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  )
}
