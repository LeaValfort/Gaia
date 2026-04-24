import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SmileyCouleur } from '@/components/proches/SmileyCouleur'
import { energieGrandeFrappe, humeurVersEmoji } from '@/lib/proches-vue-helpers'
import type { ProchePartageData } from '@/types'

export function VueProcheGrilleStats({
  partage,
  vis,
  symDetail,
}: {
  partage: ProchePartageData
  vis: ProchePartageData['visibilite']
  symDetail: string[] | null
}) {
  if (!vis.energie && !vis.douleur && !vis.humeur) return null
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {vis.energie ? (
        <Card className="border border-neutral-200/90 dark:border-neutral-700/80 bg-white/95 dark:bg-neutral-900/80 shadow-sm">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-[10px] font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
              Énergie
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-3 flex flex-col items-center text-center">
            <span className="text-4xl leading-none" aria-hidden>
              {energieGrandeFrappe(partage.energie)}
            </span>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 font-medium">
              {partage.energie != null ? `${partage.energie} / 5` : '—'}
            </p>
          </CardContent>
        </Card>
      ) : null}
      {vis.douleur ? (
        <Card className="border border-neutral-200/90 dark:border-neutral-700/80 bg-white/95 dark:bg-neutral-900/80 shadow-sm">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-[10px] font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
              Douleur
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-2 flex flex-col items-center min-h-[120px] justify-center">
            <SmileyCouleur
              douleur={partage.douleur}
              symptomes={symDetail}
              cliquable={vis.symptomes}
              detailCta="Cliquer pour détails"
              emojiSizeClass="text-[32px]"
            />
          </CardContent>
        </Card>
      ) : null}
      {vis.humeur ? (
        <Card className="border border-neutral-200/90 dark:border-neutral-700/80 bg-white/95 dark:bg-neutral-900/80 shadow-sm">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-[10px] font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
              Humeur
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-3 text-center break-words">
            <p className="text-3xl" aria-hidden>
              {partage.humeur?.trim() ? humeurVersEmoji(partage.humeur) : '—'}
            </p>
            <p className="text-sm text-neutral-800 dark:text-neutral-100 mt-1.5">
              {partage.humeur?.trim() || '—'}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
