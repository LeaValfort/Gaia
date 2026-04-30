'use client'

import { VueProcheConseilsBlocs } from '@/components/proches/vue-proche/VueProcheConseilsBlocs'
import { VueProcheFooter } from '@/components/proches/vue-proche/VueProcheFooter'
import { VueProcheGrilleStats } from '@/components/proches/vue-proche/VueProcheGrilleStats'
import { VueProcheHero } from '@/components/proches/vue-proche/VueProcheHero'
import { VueProcheHumeurPhaseMsg } from '@/components/proches/vue-proche/VueProcheHumeurPhaseMsg'
import { VueProcheLibido } from '@/components/proches/vue-proche/VueProcheLibido'
import { VueProcheSymptomesPills } from '@/components/proches/vue-proche/VueProcheSymptomesPills'
import { PHASES_DESIGN, PHASE_DESIGN_ACCUEIL_NEUTRE } from '@/lib/data/phases-design'
import { cn } from '@/lib/utils'
import type { ProcheConnection, ProchePartageData } from '@/types'

export interface ContenuVueProcheProps {
  connection: ProcheConnection
  partageData: ProchePartageData
  /** `plein` = toute la colonne (aperçu page Proches). Défaut = largeur confort sur le lien public. */
  largeurContenu?: 'defaut' | 'plein'
  /** Modale / embarqué : hauteur limitée, scroll interne */
  compact?: boolean
}

export function ContenuVueProche({
  connection,
  partageData,
  largeurContenu = 'defaut',
  compact = false,
}: ContenuVueProcheProps) {
  const p = partageData
  const v = p.visibilite
  const design = p.phase != null ? PHASES_DESIGN[p.phase] : PHASE_DESIGN_ACCUEIL_NEUTRE
  const prenomTitre = connection.owner_display_name?.trim() || 'Ton proche'
  const symDetail = v.symptomes ? (p.symptomes ?? []) : null
  const showPhase = v.phase && p.phase != null

  return (
    <div
      className={cn(
        'flex flex-col bg-gradient-to-b from-violet-50 to-white dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-100',
        compact ? 'min-h-0 max-h-[78vh] overflow-y-auto rounded-b-xl' : 'min-h-svh'
      )}
    >
      <header className="border-b border-neutral-200/80 dark:border-neutral-800 px-4 py-5">
        <h1 className="text-center text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{prenomTitre}</h1>
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-1">Ce que tu peux savoir aujourd’hui</p>
      </header>

      <main
        className={cn(
          'flex-1 w-full px-4 sm:px-6 py-6 space-y-4 pb-8',
          largeurContenu === 'plein' ? 'max-w-none' : 'max-w-lg mx-auto'
        )}
      >
        <VueProcheHero partage={p} design={design} visible={showPhase} />
        <VueProcheGrilleStats partage={p} vis={v} symDetail={symDetail} />
        {showPhase && p.phase ? (
          <VueProcheHumeurPhaseMsg phase={p.phase} design={design} visible={showPhase} />
        ) : null}
        <VueProcheLibido partage={p} visible={v.libido} />
        <VueProcheSymptomesPills partage={p} visible={v.symptomes} />
        <VueProcheConseilsBlocs partage={p} visible={v.conseils} connection={connection} />
      </main>

      <VueProcheFooter prenom={prenomTitre} design={design} />
    </div>
  )
}
