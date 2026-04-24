import { MapPin, Video } from 'lucide-react'
import { formaterEvenement } from '@/lib/calendar'
import type { GoogleCalendarEvent } from '@/types'

export function AgendaListeEvenements({
  evenements,
  accent,
}: {
  evenements: GoogleCalendarEvent[]
  accent: string
}) {
  return (
    <ul className="max-h-64 space-y-2 overflow-y-auto pr-0.5">
      {evenements.map((ev) => {
        const aff = formaterEvenement(ev)
        return (
          <li
            key={ev.id}
            className="rounded-xl border border-gray-100 p-3 dark:border-gray-800 dark:bg-gray-900/40"
          >
            <p className="text-xs font-semibold tabular-nums" style={{ color: accent }}>
              {aff.heure}
            </p>
            <p className="mt-1 font-semibold text-gray-900 dark:text-gray-50">{aff.titre}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              {aff.lieu ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 shrink-0" aria-hidden />
                  {aff.lieu}
                </span>
              ) : null}
              {ev.lienMeet ? (
                <a
                  href={ev.lienMeet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-violet-600 hover:underline dark:text-violet-400"
                >
                  <Video className="size-3.5" aria-hidden />
                  Meet
                </a>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
