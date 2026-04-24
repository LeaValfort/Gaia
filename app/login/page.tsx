import { creerClientServeur } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import BoutonConnexionGoogle from './BoutonConnexionGoogle'

function messageErreurConnexion(
  erreur: string | undefined,
  code: string | undefined,
  msg: string | undefined,
): string | null {
  if (erreur === 'oauth' && code === 'bad_oauth_state') {
    return 'La session de connexion a expiré ou les cookies ont été bloqués. Réessaie tout de suite après avoir cliqué sur « Continuer avec Google », sans attendre sur les écrans Google.'
  }
  if (msg) {
    try {
      return decodeURIComponent(msg.replace(/\+/g, ' '))
    } catch {
      return msg
    }
  }
  if (erreur === 'callback') {
    return 'La connexion a échoué. Réessaie ou contacte le support si le problème continue.'
  }
  return null
}

/**
 * Page de connexion.
 * Si l'utilisatrice est déjà connectée, on la redirige directement vers l'accueil.
 */
export default async function PageLogin({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; code?: string; msg?: string }>
}) {
  const sp = await searchParams
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/')

  const texteErreur = messageErreurConnexion(sp.erreur, sp.code, sp.msg)

  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">

        {/* Logo / titre */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Gaia
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Ton espace cycle, sport et alimentation
          </p>
        </div>

        {/* Carte de connexion */}
        <div className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Connexion
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Utilise ton compte Google pour te connecter
            </p>
          </div>

          {texteErreur ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
            >
              {texteErreur}
            </p>
          ) : null}

          <BoutonConnexionGoogle />
        </div>

      </div>
    </main>
  )
}
