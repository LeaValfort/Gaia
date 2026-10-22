import { ExternalLink, HeartPulse } from 'lucide-react'
import type { ConseilCondition } from '@/lib/data/conditions-sante'

/** Conseils liés au profil santé (Paramètres > Santé), chacun avec sa source quand il affirme un fait. */
export function ConseilsProfilSante({ conseils }: { conseils: (ConseilCondition & { condition: string })[] }) {
  if (!conseils.length) return null
  return (
    <section className="rounded-2xl border border-violet-200 bg-white p-4 dark:border-violet-900/60 dark:bg-neutral-900 sm:p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-neutral-900 dark:text-neutral-50 sm:text-lg">
        <HeartPulse className="size-5 text-violet-600 dark:text-violet-300" aria-hidden /> Pour ton profil santé
      </h2>
      <ul className="space-y-3">
        {conseils.map((c) => (
          <li key={c.texte} className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            <span className="mr-1.5 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">
              {c.condition}
            </span>
            {c.texte}
            {c.source ? (
              <a
                href={c.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 flex items-center gap-1 text-xs text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
              >
                <ExternalLink className="size-3 shrink-0" aria-hidden />
                <span className="truncate">{c.source.titre}</span>
              </a>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">Ce n’est pas un avis médical : parles-en à ton médecin avant tout changement.</p>
    </section>
  )
}
