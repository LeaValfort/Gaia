'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronRight, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDernieresSeances } from '@/hooks/useDernieresSeances'
import type { SeanceHistorique } from '@/lib/db/seances-historique'
import type { TypeSeance } from '@/types'
import { cn } from '@/lib/utils'

interface DernieresSeancesProps {
  userId: string
  refreshToken?: number
  onModifier?: (seance: SeanceHistorique) => void
  onSupprimee?: () => void
}

const MODIFIABLES: TypeSeance[] = ['muscu', 'natation', 'yoga']

export function DernieresSeances({ userId, refreshToken, onModifier, onSupprimee }: DernieresSeancesProps) {
  const { seances, erreur, supprimer } = useDernieresSeances(userId, refreshToken)
  const [aConfirmer, setAConfirmer] = useState<string | null>(null)

  async function confirmerSuppression(s: SeanceHistorique) {
    setAConfirmer(null)
    const ok = await supprimer(s)
    if (ok) {
      toast.success('Séance supprimée')
      onSupprimee?.()
    } else toast.error('La suppression a échoué, la séance a été restaurée.')
  }

  return (
    <section className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
      <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Dernières séances</h2>

      {seances === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      ) : erreur && seances.length === 0 ? (
        <p className="text-sm text-muted-foreground">{erreur}</p>
      ) : seances.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune séance récente.</p>
      ) : (
        <ul className="space-y-1">
          {seances.map((s) => {
            const cliquable = !!onModifier && (s.source === 'activite' || MODIFIABLES.includes(s.type))
            const contenu = (
              <>
                <span className="text-muted-foreground">
                  {format(parseISO(`${s.date}T12:00:00`), 'd MMM yyyy', { locale: fr })}
                </span>
                <span className="inline-flex items-center gap-1 text-neutral-800 dark:text-neutral-200">
                  {s.libelle}
                  {s.duration_min != null ? ` · ${s.duration_min} min` : ''}
                  {cliquable ? <ChevronRight className="size-3.5 opacity-50" aria-hidden /> : null}
                </span>
              </>
            )
            const classeLigne = 'flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm'

            if (aConfirmer === s.id) {
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-rose-50 px-2 py-1.5 text-sm dark:bg-rose-950/40"
                >
                  <span className="text-rose-800 dark:text-rose-200">Supprimer cette séance ?</span>
                  <span className="flex gap-1">
                    <Button type="button" size="sm" variant="ghost" onClick={() => setAConfirmer(null)}>
                      Non
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-rose-600 text-white hover:bg-rose-700"
                      onClick={() => void confirmerSuppression(s)}
                    >
                      Oui
                    </Button>
                  </span>
                </li>
              )
            }

            return (
              <li key={s.id} className="flex items-center gap-1">
                {cliquable ? (
                  <button
                    type="button"
                    onClick={() => onModifier(s)}
                    className={cn(classeLigne, 'transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800/60')}
                  >
                    {contenu}
                  </button>
                ) : (
                  <div className={classeLigne}>{contenu}</div>
                )}
                {/* Toujours visible : pas de hover sur mobile */}
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Supprimer la séance"
                  onClick={() => setAConfirmer(s.id)}
                  className="h-8 w-8 shrink-0 text-neutral-400 hover:text-rose-600 dark:text-neutral-500"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
