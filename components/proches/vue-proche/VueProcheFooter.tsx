import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { PhaseDesign } from '@/lib/data/phases-design'

export function VueProcheFooter({ prenom, design }: { prenom: string; design: PhaseDesign }) {
  return (
    <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 px-4 py-6 text-center">
      <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-4">
        Tu suis un lien privé — respecte la confiance de {prenom} 💚
      </p>
      <Link
        href="/"
        className={cn(
          'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity',
          'hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
        )}
        style={{ backgroundColor: design.accent, outlineColor: design.accent }}
      >
        Créer mon compte Gaia →
      </Link>
    </footer>
  )
}
