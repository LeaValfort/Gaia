import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TITRE_SECTION_CONSEILS_PROPRIETAIRE } from '@/lib/data/conseils-proches'
import { cn } from '@/lib/utils'
import type { ProcheConnection, ProchePartageData } from '@/types'

const LIBIDO_CONSEIL: Record<'haute' | 'moyenne' | 'basse' | 'variable', string> = {
  haute: 'élevée',
  moyenne: 'moyenne',
  basse: 'basse',
  variable: 'variable',
}

export function VueProcheConseilsBlocs({
  partage,
  visible,
  connection,
}: {
  partage: ProchePartageData
  visible: boolean
  connection: ProcheConnection
}) {
  if (!visible || partage.conseilPartenaire == null) return null
  const cp = partage.conseilPartenaire
  const showLibidoLigne = connection.relation_type === 'partenaire' && partage.visibilite.conseils
  return (
    <Card className="border-neutral-200/90 dark:border-neutral-700/80 bg-white/95 dark:bg-neutral-900/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {TITRE_SECTION_CONSEILS_PROPRIETAIRE}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-neutral-700 dark:text-neutral-200">
        <ul className="space-y-2">
          {cp.idees.map((idee) => (
            <li key={idee} className="flex gap-2 items-start">
              <span className="shrink-0">•</span>
              <span>{idee}</span>
            </li>
          ))}
        </ul>
        <div
          className={cn(
            'rounded-xl border px-3 py-2.5',
            'bg-[#FFF8F8] border-[#FECACA]',
            'dark:bg-rose-950/20 dark:border-rose-800/50'
          )}
        >
          <p className="font-medium text-neutral-800 dark:text-neutral-100 text-sm mb-1.5">🚫 À éviter</p>
          <ul className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-300">
            {cp.aEviter.map((x) => (
              <li key={x} className="flex gap-2">
                <span className="shrink-0" aria-hidden>
                  ❌
                </span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
        {showLibidoLigne ? (
          <p className="text-xs text-amber-800/90 dark:text-amber-200/80 border-t border-neutral-200 dark:border-neutral-700 pt-2">
            💛 Libido · {LIBIDO_CONSEIL[cp.libido]} cette phase
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
