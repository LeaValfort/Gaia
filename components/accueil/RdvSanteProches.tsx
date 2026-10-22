import Link from 'next/link'
import { Stethoscope } from 'lucide-react'
import { echeanceRdv } from '@/lib/sante/rdv'
import { cn } from '@/lib/utils'
import type { RdvSanteAffiche } from '@/types'

/** Accueil : rendez-vous santé des 30 prochains jours (ou en retard). Rien si aucun. */
export function RdvSanteProches({ rdvs }: { rdvs: RdvSanteAffiche[] }) {
  if (!rdvs.length) return null
  return (
    <Link
      href="/parametres"
      className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 transition-colors hover:bg-violet-50 dark:border-violet-900/60 dark:bg-violet-950/30 dark:hover:bg-violet-950/50"
    >
      <Stethoscope className="mt-0.5 size-5 shrink-0 text-violet-600 dark:text-violet-300" aria-hidden />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold text-violet-950 dark:text-violet-100">Rendez-vous santé</p>
        <ul className="space-y-0.5">
          {rdvs.map((r) => {
            const e = r.date ? echeanceRdv(r.date) : null
            return (
              <li key={r.cle} className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm text-violet-900 dark:text-violet-200">
                <span>{r.titre}</span>
                {e ? <span className={cn('text-xs', e.urgent && 'font-medium text-rose-600 dark:text-rose-400')}>{e.texte}</span> : null}
              </li>
            )
          })}
        </ul>
      </div>
    </Link>
  )
}
