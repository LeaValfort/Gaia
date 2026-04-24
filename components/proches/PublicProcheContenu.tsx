import Link from 'next/link'
import { ContenuVueProche } from '@/components/proches/ContenuVueProche'
import { procheDepuisLienPublic } from '@/lib/proches-partage-data'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProchePartageData, ProcheStatus } from '@/types'

export function PublicProcheContenu({
  erreur,
  partage,
  meta,
  inviteCode,
}: {
  erreur: string | null
  partage: ProchePartageData | null
  meta: { partnerName: string | null; ownerName: string | null; status: ProcheStatus }
  inviteCode: string
}) {
  if (erreur || !partage) {
    return (
      <div className="min-h-svh flex flex-col bg-gradient-to-b from-violet-50 to-white dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-100">
        <header className="border-b border-neutral-200/80 dark:border-neutral-800 px-4 py-4">
          <p className="text-center text-sm font-semibold tracking-tight">Gaia · Proches</p>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="max-w-md w-full border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Lien indisponible</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
              <p>{erreur ?? 'Les informations ne sont pas encore disponibles pour ce lien.'}</p>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full text-center')}
              >
                Créer un compte ou se connecter
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <ContenuVueProche
      connection={procheDepuisLienPublic(
        { partnerName: meta.partnerName, ownerName: meta.ownerName, status: meta.status },
        inviteCode,
        partage.visibilite
      )}
      partageData={partage}
    />
  )
}
