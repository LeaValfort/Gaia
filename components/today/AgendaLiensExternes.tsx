import { lienGoogleNouvelEvenement } from '@/lib/agenda-google'

/** Lien optionnel vers la création sur le site Google (hors Gaia). */
export function AgendaLiensExternes() {
  const urlNouveauGoogle = lienGoogleNouvelEvenement()
  return (
    <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
      <p className="text-center text-[11px] text-gray-500 dark:text-gray-400">
        <a
          href={urlNouveauGoogle}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-gray-400 underline-offset-2 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Créer plutôt sur le site Google Agenda
        </a>
      </p>
    </div>
  )
}
