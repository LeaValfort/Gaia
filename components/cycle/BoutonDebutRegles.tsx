'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Droplets } from 'lucide-react'
import { toast } from 'sonner'
import { signalerDebutCycle } from '@/lib/db/cycles'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const CLASSES_BOUTON_DOUX =
  'inline-flex h-9 items-center justify-center gap-2 rounded-md border border-rose-200 bg-rose-100 px-4 text-sm font-medium text-rose-800 transition-colors hover:bg-rose-200/90 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200 dark:hover:bg-rose-900/60'

interface BoutonDebutReglesProps {
  /** Date ISO yyyy-MM-dd pré-remplie (ex. jour sélectionné au calendrier). */
  dateInitiale?: string | null
  /** Libellé du bouton (sinon libellé par défaut avec icône). */
  libelle?: string
  /** id du trigger (ex. pour ouvrir le dialogue depuis une alerte). */
  idTrigger?: string
  /** Appelé après enregistrement réussi, avant le rafraîchissement de la page. */
  onSucces?: () => void
  className?: string
}

export function BoutonDebutRegles({
  dateInitiale,
  libelle,
  idTrigger,
  onSucces,
  className,
}: BoutonDebutReglesProps) {
  const router = useRouter()
  const [ouvert, setOuvert] = useState(false)
  const [date, setDate] = useState(() => dateInitiale ?? format(new Date(), 'yyyy-MM-dd'))
  const [duree, setDuree] = useState(4)
  const [envoi, setEnvoi] = useState(false)

  async function confirmer() {
    setEnvoi(true)
    const res = await signalerDebutCycle(date, duree)
    setEnvoi(false)
    if (!res.ok) {
      toast.error(res.message ?? 'Impossible d’enregistrer.')
      return
    }
    toast.success('Début des règles enregistré. Les prédictions vont s’affiner avec le temps.')
    onSucces?.()
    setOuvert(false)
    router.refresh()
  }

  const libelleAffiche = libelle ?? 'Signaler le début des règles'

  return (
    <Dialog
      open={ouvert}
      onOpenChange={(o) => {
        setOuvert(o)
        if (o) {
          setDate(dateInitiale ?? format(new Date(), 'yyyy-MM-dd'))
          setDuree(4)
        }
      }}
    >
      <DialogTrigger
        id={idTrigger}
        type="button"
        className={cn(CLASSES_BOUTON_DOUX, 'w-full sm:w-auto', className)}
      >
        <Droplets className="size-4 shrink-0" aria-hidden />
        {libelleAffiche}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Début des règles</DialogTitle>
          <DialogDescription>
            Indique la date du premier jour de flux et combien de jours durent tes règles en général
            pour ce cycle. Gaia mettra à jour ton historique et affinera les prédictions.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              Durée des règles (jours)
            </span>
            <input
              type="number"
              min={1}
              max={14}
              value={duree}
              onChange={(e) => setDuree(Number(e.target.value) || 1)}
              className="w-24 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </label>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setOuvert(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            className={cn(CLASSES_BOUTON_DOUX, 'h-9')}
            disabled={envoi}
            onClick={() => void confirmer()}
          >
            {envoi ? 'Enregistrement…' : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
