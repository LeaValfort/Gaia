import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Droplet, Settings } from 'lucide-react'
import { DailyLogForm } from '@/components/cycle/DailyLogForm'
import { CartePilule } from '@/components/cycle/sans-regles/CartePilule'
import type { DailyLog } from '@/types'

interface VueSansReglesProps {
  userId: string
  date: string
  logDuJour: DailyLog | null
  /** Journaux récents (pour lister les saignements / spotting). */
  logsRecents: DailyLog[]
}

/**
 * Page Cycle en mode « contraception sans règles » : pas de phases ni de
 * prédictions (plus d'ovulation sous contraception hormonale), mais la pilule,
 * le journal du jour et l'historique des saignements.
 */
export function VueSansRegles({ userId, date, logDuJour, logsRecents }: VueSansReglesProps) {
  const saignements = logsRecents.filter((l) => l.flow_intensity).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-100">
          <p className="font-semibold">Mode contraception sans règles</p>
          <p className="mt-1 text-violet-900/80 dark:text-violet-200/80">
            Sous contraception hormonale, il n’y a plus de vraies phases : Gaia ne fait ni prédiction ni conseil par phase, et ses recommandations
            sport et alimentation sont générales. Tu peux toujours noter ton ressenti, tes symptômes et un éventuel spotting.
          </p>
          <Link href="/parametres" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-violet-700 hover:underline dark:text-violet-300">
            <Settings className="size-3.5" aria-hidden /> Changer de mode
          </Link>
        </div>
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Journal du jour</p>
          {/* Phase factice : seul le choix « saignement / spotting » en dépend ici. */}
          <DailyLogForm date={date} phase="folliculaire" jourDuCycle={1} logInitial={logDuJour} afficherDetailsEtendus />
        </section>
      </div>
      <aside className="space-y-5">
        <CartePilule userId={userId} />
        <section className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            <Droplet className="size-4 text-rose-500" aria-hidden /> Saignements récents
          </p>
          {saignements.length ? (
            <ul className="space-y-1 text-sm">
              {saignements.map((l) => (
                <li key={l.date} className="flex justify-between gap-2">
                  <span className="capitalize text-neutral-700 dark:text-neutral-200">{format(parseISO(l.date), 'EEEE d MMMM', { locale: fr })}</span>
                  <span className="text-muted-foreground">{l.flow_intensity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">Aucun saignement noté ces deux derniers mois.</p>
          )}
        </section>
      </aside>
    </div>
  )
}
