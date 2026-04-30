'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ProchePublicEncarts({
  code,
  connecte,
  aSession,
}: {
  code: string
  connecte: boolean
  aSession: boolean
}) {
  return (
    <div className="max-w-lg mx-auto w-full px-4 pb-8 space-y-3">
      {aSession && connecte ? (
        <div
          className={cn(
            'rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900',
            'dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100'
          )}
        >
          ✓ Ces infos apparaissent dans ton onglet Proches.
        </div>
      ) : null}
      {!aSession ? (
        <div
          className={cn(
            'rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 p-4 text-sm'
          )}
        >
          <p className="text-neutral-700 dark:text-neutral-300">
            Tu as un compte Gaia ? Connecte-toi pour retrouver ces infos automatiquement dans ton onglet Proches.
          </p>
          <Link
            href={`/login?redirect=${encodeURIComponent(`/proches/${code}`)}`}
            className={cn(buttonVariants({ variant: 'default' }), 'mt-3 inline-flex bg-violet-600 hover:bg-violet-700')}
          >
            Se connecter
          </Link>
        </div>
      ) : null}
    </div>
  )
}
