'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SmileyCouleurProps {
  douleur: number | null
  symptomes: string[] | null
  cliquable: boolean
  /** CTA sous le popover (ex. « Cliquer pour détails ») */
  detailCta?: string
  /** Taille de l’emoji (défaut 32) */
  emojiSizeClass?: string
}

type Tier = { emoji: string; color: string; label: string }

function tierDouleur(n: number | null): Tier {
  if (n == null || n === 0) {
    return { emoji: '😊', color: '#059669', label: 'Aucune douleur' }
  }
  if (n >= 1 && n <= 3) return { emoji: '🙂', color: '#84CC16', label: 'Légère' }
  if (n >= 4 && n <= 6) return { emoji: '😕', color: '#F59E0B', label: 'Modérée' }
  if (n >= 7 && n <= 8) return { emoji: '😣', color: '#EF4444', label: 'Forte' }
  return { emoji: '😖', color: '#DC2626', label: 'Intense' }
}

/** Libellé court (Aucune / Légère / …) pour la vue proche. */
export function labelDouleurVueCourte(n: number | null): string {
  if (n == null || n === 0) return 'Aucune'
  return tierDouleur(n).label
}

export function SmileyCouleur({
  douleur,
  symptomes,
  cliquable,
  detailCta = 'Voir détails →',
  emojiSizeClass = 'text-[32px]',
}: SmileyCouleurProps) {
  const t = tierDouleur(douleur)
  const n = douleur
  const liste = cliquable ? (symptomes ?? []) : null

  const visuel = (
    <div className="flex flex-col items-center">
      <span className={cn(emojiSizeClass, 'leading-none')} aria-hidden>
        {t.emoji}
      </span>
      <span className="text-xs font-medium mt-1 text-center" style={{ color: t.color }}>
        {labelDouleurVueCourte(n)}
      </span>
    </div>
  )

  if (!cliquable) {
    return <div className="flex flex-col items-center text-center py-0.5">{visuel}</div>
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Popover>
        <PopoverTrigger className="rounded-lg outline-offset-2 focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer p-0.5 -m-0.5">
          {visuel}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 max-w-xs border-neutral-200 dark:border-neutral-700 shadow-lg">
          <Card className="border-0 shadow-none bg-popover text-popover-foreground max-w-xs">
            <CardHeader className="pb-2 pt-3 px-3">
              <p className="text-sm font-medium leading-tight text-neutral-900 dark:text-neutral-100">
                {t.emoji} Douleur {n == null || n === 0 ? '0' : n}/10 — {t.label}
              </p>
            </CardHeader>
            <CardContent className="pt-0 pb-3 px-3 text-sm text-neutral-600 dark:text-neutral-400">
              {liste != null && liste.length > 0 ? (
                <>
                  <p className="font-medium text-neutral-800 dark:text-neutral-200 text-xs mb-1.5">Symptômes :</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-xs">
                    {liste.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-xs">Aucun symptôme renseigné</p>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
      <span className="text-[10px] text-violet-600 dark:text-violet-400">{detailCta}</span>
    </div>
  )
}

export function energieAvecEmoji(n: number | null): { emoji: string; text: string } {
  if (n == null) return { emoji: '—', text: '—' }
  const em = n <= 1 ? '😴' : n === 2 ? '😕' : n === 3 ? '😊' : n === 4 ? '⚡' : '🚀'
  return { emoji: em, text: `${em} ${n}/5` }
}
