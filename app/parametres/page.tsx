import { Header } from '@/components/shared/Header'
import { FormulaireParametres } from '@/components/parametres/FormulaireParametres'
import { getPreferencesUtilisateur } from '@/lib/db/cycle'

export default async function PageParametres() {
  const prefs = await getPreferencesUtilisateur()

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Paramètres
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Configure ton cycle et tes préférences pour personnaliser l&apos;appli.
          </p>
        </div>

        <FormulaireParametres prefsInitiales={prefs} />
      </main>
    </>
  )
}
