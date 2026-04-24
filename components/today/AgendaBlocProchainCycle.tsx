import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'

export function AgendaBlocProchainCycle({
  joursRestants,
  prochain,
  accentBorder,
  texte,
  cycleLength,
}: {
  joursRestants: number
  prochain: Date
  accentBorder: string
  texte: string
  cycleLength: number
}) {
  return (
    <Card className="border-gray-100 shadow-sm dark:border-gray-800" style={{ borderColor: accentBorder }}>
      <CardContent className="p-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Prochain cycle
        </p>
        <p className="text-2xl font-bold tabular-nums" style={{ color: texte }}>
          Dans {joursRestants} jour{joursRestants > 1 ? 's' : ''}
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {format(prochain, 'd MMMM yyyy', { locale: fr })}
        </p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Basé sur ton cycle moyen ({cycleLength} j).
        </p>
      </CardContent>
    </Card>
  )
}
