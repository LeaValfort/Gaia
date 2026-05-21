'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/shared/Nav'
import { Button } from '@/components/ui/button'

export default function ParametresError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[parametres]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav phase={null} prenom="toi" />
      <div className="mx-auto max-w-lg px-4 py-12 text-center sm:px-6">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Impossible de charger les paramètres
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Un problème est survenu lors du chargement. Réessaie dans un instant.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button type="button" onClick={() => reset()}>
            Réessayer
          </Button>
          <Link href="/">
            <Button type="button" variant="outline">
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
