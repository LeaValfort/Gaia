'use client'

import { ExternalLink, CalendarDays } from 'lucide-react'
import { lienGoogleAgendaJour, lienGoogleNouvelEvenement } from '@/lib/agenda-google'

interface AgendaGoogleEncadreProps {
  dateIso: string
  jourLibelle: string
}

export function AgendaGoogleEncadre({ dateIso, jourLibelle }: AgendaGoogleEncadreProps) {
  const urlJour = lienGoogleAgendaJour(dateIso)
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <CalendarDays className="size-5 shrink-0 text-violet-600 dark:text-violet-400 mt-0.5" aria-hidden />
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Agenda du jour</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 capitalize">{jourLibelle}</p>
        </div>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
        Gaia ne se connecte pas à ton compte Google : tes rendez-vous restent dans Google Agenda.
        Ouvre la journée ciblée pour voir tes événements, ou ajoute des tâches dans la liste ci-dessous.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href={urlJour}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700/80"
        >
          Ouvrir ce jour dans Google Agenda
          <ExternalLink className="size-4 opacity-70" aria-hidden />
        </a>
        <a
          href={lienGoogleNouvelEvenement()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/80"
        >
          Nouvel événement
          <ExternalLink className="size-4 opacity-70" aria-hidden />
        </a>
      </div>
    </div>
  )
}
