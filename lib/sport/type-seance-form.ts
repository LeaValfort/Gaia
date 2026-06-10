import type { SportLoggerId } from '@/lib/sport-page'
import type { TypeSeance } from '@/types'

export function typeSeanceVersForm(type: TypeSeance): SportLoggerId | 'autre' | null {
  if (type === 'muscu') return 'muscu'
  if (type === 'natation') return 'natation'
  if (type === 'yoga') return 'yoga'
  if (type === 'autre' || type === 'escalade') return 'autre'
  return null
}
