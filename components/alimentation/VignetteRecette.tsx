// Vignette d'une carte recette (Chantier 5, étape 5b) : la photo ajoutée via "Modifier" si
// elle existe, sinon un dégradé chaleureux (palette crème/orange-rouge façon Jow) choisi de
// façon stable selon le nom de la recette — pas d'icône/emoji (essayé puis retiré, cf. plan).
import { cn } from '@/lib/utils'

const DEGRADES_CARTE = [
  'from-orange-200 to-red-200 dark:from-orange-900/50 dark:to-red-900/40',
  'from-amber-100 to-orange-300 dark:from-amber-900/50 dark:to-orange-800/40',
  'from-rose-100 to-orange-200 dark:from-rose-900/50 dark:to-orange-900/40',
  'from-yellow-100 to-amber-300 dark:from-yellow-900/50 dark:to-amber-800/40',
]

/** Choisit un dégradé de façon stable selon le nom (même recette = même dégradé à chaque
 *  affichage, sans avoir besoin de le stocker en base). */
function degradePour(nom: string): string {
  let hash = 0
  for (let i = 0; i < nom.length; i++) {
    hash = (hash * 31 + nom.charCodeAt(i)) | 0
  }
  return DEGRADES_CARTE[Math.abs(hash) % DEGRADES_CARTE.length]
}

interface VignetteRecetteProps {
  imageUrl?: string | null
  nom: string
  className?: string
}

export function VignetteRecette({ imageUrl, nom, className }: VignetteRecetteProps) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt="" className={cn('object-cover', className)} />
    )
  }
  return <div className={cn('bg-gradient-to-br', degradePour(nom), className)} aria-hidden />
}
