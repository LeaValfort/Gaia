'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Check, Plus, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { updatePeriodLength } from '@/lib/db/cycles'
import { annulerDebutCycle } from '@/lib/db/cycles-regles'
import type { EtatRegles } from '@/lib/cycle-regles'

/**
 * Pendant les règles (et juste après) : règles finies plus tôt, un jour de
 * plus, ou annuler un début signalé par erreur.
 */
export function ReglesEnCours({ etat }: { etat: EtatRegles }) {
  const router = useRouter()
  const [envoi, setEnvoi] = useState(false)
  const [confirmerAnnulation, setConfirmerAnnulation] = useState(false)

  async function changerDuree(duree: number, message: string) {
    setEnvoi(true)
    const res = await updatePeriodLength(etat.cycleId, duree)
    setEnvoi(false)
    if (!res.ok) return toast.error(res.message ?? 'Mise à jour impossible.')
    toast.success(message)
    router.refresh()
  }

  async function annuler() {
    setEnvoi(true)
    const res = await annulerDebutCycle(etat.cycleId)
    setEnvoi(false)
    setConfirmerAnnulation(false)
    if (!res.ok) return toast.error(res.message ?? 'Annulation impossible.')
    toast.success('Début des règles annulé')
    router.refresh()
  }

  const fin = format(parseISO(etat.finPrevueISO), 'EEEE d MMMM', { locale: fr })

  return (
    <div className="space-y-3 rounded-2xl border border-teal-200 bg-white p-4 dark:border-teal-900/50 dark:bg-neutral-900/60">
      <div>
        <p className="text-sm font-semibold text-teal-900 dark:text-teal-100">
          {etat.enCours ? `🩸 Règles · jour ${etat.jour} sur ${etat.duree}` : '🩸 Tes règles sont-elles finies ?'}
        </p>
        <p className="text-xs text-muted-foreground">
          {etat.enCours ? `Fin prévue ${fin}.` : `Elles devaient se terminer ${fin}. Si elles continuent, ajoute un jour.`}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {etat.enCours && etat.jour < etat.duree ? (
          <Button type="button" size="sm" variant="outline" disabled={envoi} onClick={() => void changerDuree(etat.jour, 'Règles terminées aujourd’hui')}>
            <Check className="mr-1 size-3.5" /> Finies aujourd’hui
          </Button>
        ) : null}
        {etat.duree < 14 ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={envoi}
            // Après la fin prévue, on prolonge jusqu'à aujourd'hui.
            onClick={() => void changerDuree(Math.min(14, Math.max(etat.duree + 1, etat.jour)), 'Durée des règles prolongée')}
          >
            <Plus className="mr-1 size-3.5" /> {etat.enCours ? 'Un jour de plus' : 'Encore là'}
          </Button>
        ) : null}
      </div>
      {confirmerAnnulation ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-900 dark:bg-rose-950/40 dark:text-rose-100">
          <span className="flex-1">Supprimer ce début de règles ? Le cycle précédent sera rouvert.</span>
          <Button type="button" size="sm" variant="ghost" disabled={envoi} onClick={() => setConfirmerAnnulation(false)}>
            Non
          </Button>
          <Button type="button" size="sm" disabled={envoi} onClick={() => void annuler()} className="bg-rose-600 text-white hover:bg-rose-700">
            Oui, annuler
          </Button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirmerAnnulation(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-600">
          <Undo2 className="size-3.5" /> Je me suis trompée, annuler ce début de règles
        </button>
      )}
    </div>
  )
}
