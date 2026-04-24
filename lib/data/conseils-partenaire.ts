import type { ConseilPartenaire, Phase } from '@/types'
import { CONSEILS_PAR_PHASE } from '@/lib/data/conseils-partenaire-data'

export { CONSEILS_PAR_PHASE } from '@/lib/data/conseils-partenaire-data'

export function getConseilPartenaire(phase: Phase): ConseilPartenaire {
  return CONSEILS_PAR_PHASE[phase]
}
