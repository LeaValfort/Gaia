'use client'

import { MacrosDuJourCard } from '@/components/alimentation/MacrosDuJourCard'
import { RepasDuJourCard } from '@/components/alimentation/RepasDuJourCard'
import type { TotauxConsommesJour } from '@/lib/recapManuel'
import type { MacrosCiblesJour, TypeJournee } from '@/types'

interface OngletAujourdhuiProps {
  userId: string
  todayIso: string
  typeJournee: TypeJournee
  macrosCibles: MacrosCiblesJour
  consoJour: TotauxConsommesJour
  onVersSuggestions?: () => void
}

export function OngletAujourdhui({
  userId,
  todayIso,
  typeJournee,
  macrosCibles,
  consoJour,
  onVersSuggestions,
}: OngletAujourdhuiProps) {
  return (
    <div className="flex flex-col gap-4">
      <MacrosDuJourCard macrosCibles={macrosCibles} conso={consoJour} />
      <RepasDuJourCard
        userId={userId}
        date={todayIso}
        typeJournee={typeJournee}
        onVersSuggestions={onVersSuggestions}
      />
    </div>
  )
}
