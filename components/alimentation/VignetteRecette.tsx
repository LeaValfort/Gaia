// Vignette d'une carte recette (Chantier 5, étape 5b) : la photo ajoutée via "Modifier" si
// elle existe, sinon le symbole + la couleur de la phase du cycle associée à la recette —
// même code couleur/emoji que le reste de l'appli (PHASES_DESIGN). Pas de dégradé générique
// ni d'icône par catégorie d'ingrédient (essayés puis retirés, Léa ne les aimait pas).
import { PHASES_DESIGN, PHASE_DESIGN_ACCUEIL_NEUTRE } from '@/lib/data/phases-design'
import { cn } from '@/lib/utils'
import type { Phase } from '@/types'

const FOND_PHASE: Record<Phase, string> = {
  menstruation: 'bg-rose-100 dark:bg-rose-900/40',
  folliculaire: 'bg-amber-100 dark:bg-amber-900/40',
  ovulation: 'bg-emerald-100 dark:bg-emerald-900/40',
  luteale: 'bg-violet-100 dark:bg-violet-900/40',
}
const FOND_NEUTRE = 'bg-emerald-100 dark:bg-emerald-900/40'

interface VignetteRecetteProps {
  imageUrl?: string | null
  /** Recette perso sans phase renseignée → symbole neutre (PHASE_DESIGN_ACCUEIL_NEUTRE). */
  phase: Phase | null
  className?: string
}

export function VignetteRecette({ imageUrl, phase, className }: VignetteRecetteProps) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt="" className={cn('object-cover', className)} />
    )
  }

  const emoji = phase ? PHASES_DESIGN[phase].emoji : PHASE_DESIGN_ACCUEIL_NEUTRE.emoji
  const fond = phase ? FOND_PHASE[phase] : FOND_NEUTRE

  return (
    <div className={cn('flex items-center justify-center', fond, className)} aria-hidden>
      <span className="text-2xl leading-none">{emoji}</span>
    </div>
  )
}
