'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { DerouleBatchVue } from '@/components/alimentation/batch/DerouleBatchVue'
import { RecettesLieesBatch } from '@/components/alimentation/batch/RecettesLieesBatch'
import { SelectionRecettesBatch } from '@/components/alimentation/batch/SelectionRecettesBatch'
import { useBatchCooking } from '@/hooks/useBatchCooking'
import type { Phase } from '@/types'

interface OngletBatchCookingProps {
  userId: string
  weekStart: string
  phase: Phase
}

/**
 * Onglet Batch cooking : choisir les recettes (celles du planning sont pré-cochées)
 * ou demander des recettes liées, générer un déroulé commun, puis le suivre étape par étape.
 */
export function OngletBatchCooking({ userId, weekStart, phase }: OngletBatchCookingProps) {
  const b = useBatchCooking(userId, weekStart)
  const [ajoutees, setAjoutees] = useState<string[]>([])
  const [refaire, setRefaire] = useState(false)

  if (b.chargement) return <Skeleton className="h-64 w-full rounded-2xl" />

  async function generer(ids: string[]) {
    try {
      await b.generer(ids)
      setRefaire(false)
      toast.success('Ta session est prête 👩‍🍳')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Génération impossible')
    }
  }

  const preselection = [...new Set([...ajoutees, ...b.planifiees])]
  const afficherChoix = !b.session?.deroule || refaire

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Semaine du {format(parseISO(weekStart), 'd MMMM', { locale: fr })} : cuisine plusieurs recettes en une seule session, dans le bon ordre.
      </p>
      {afficherChoix ? (
        <>
          <SelectionRecettesBatch
            key={preselection.join(',')}
            recettes={b.recettes}
            planifiees={preselection}
            generation={b.generation}
            onGenerer={(ids) => void generer(ids)}
          />
          <RecettesLieesBatch
            userId={userId}
            phase={phase}
            onEnregistrees={(r) => {
              b.ajouterRecettes(r)
              setAjoutees(r.map((x) => x.id))
            }}
          />
        </>
      ) : (
        <button type="button" onClick={() => setRefaire(true)} className="self-start text-sm text-muted-foreground underline-offset-2 hover:underline">
          ↺ Refaire un déroulé avec d’autres recettes
        </button>
      )}
      {b.session?.deroule ? <DerouleBatchVue session={b.session} onBasculer={(id) => void b.basculerEtape(id)} /> : null}
    </div>
  )
}
