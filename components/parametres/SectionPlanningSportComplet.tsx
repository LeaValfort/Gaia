'use client'

import { SectionPlanningSport } from '@/components/parametres/SectionPlanningSport'
import { SectionPourcentagesGaia } from '@/components/parametres/SectionPourcentagesGaia'
import { SectionVariantesSport } from '@/components/parametres/SectionVariantesSport'
import type { SeanceProfil, UserPreferences } from '@/types'

export interface SectionPlanningSportCompletProps {
  prefs: UserPreferences
  userId: string
  seanceProfilsInitiales: SeanceProfil[]
  onUpdate: (updates: Partial<UserPreferences>) => Promise<boolean>
}

/**
 * Contenu complet de l'accordéon "Planning sport" : planning hebdo + effort,
 * pourcentages Séance Gaia, et sélection de la séance active par sport.
 * Regroupé ici pour garder ParametresClient.tsx centré sur la coquille accordéon.
 */
export function SectionPlanningSportComplet({
  prefs,
  userId,
  seanceProfilsInitiales,
  onUpdate,
}: SectionPlanningSportCompletProps) {
  return (
    <>
      <SectionPlanningSport
        prefs={prefs}
        userId={userId}
        seanceProfilsInitiales={seanceProfilsInitiales}
        onUpdate={onUpdate}
      />
      <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Pourcentages « Séance Gaia »
        </p>
        <SectionPourcentagesGaia prefs={prefs} onUpdate={onUpdate} />
      </div>
      <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Séance active par sport
        </p>
        <SectionVariantesSport userId={userId} />
      </div>
    </>
  )
}
