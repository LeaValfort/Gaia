'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Droplet } from 'lucide-react'
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

interface BoutonDebutReglesProps {
  /** Date ISO yyyy-MM-dd pré-remplie (ex. jour sélectionné au calendrier). */
  dateInitiale?: string | null
  /** Libellé du bouton (sinon libellé par défaut avec icône). */
  libelle?: string
  /** id du trigger (ex. pour ouvrir le dialogue depuis une alerte). */
  idTrigger?: string
  /** Appelé après enregistrement réussi, avant le rafraîchissement de la page. */
  onSucces?: () => void
}

export function BoutonDebutRegles({
  dateInitiale,
  libelle,
  idTrigger,
  onSucces,
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
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
      >
        {libelle ? (
          libelle
        ) : (
          <>
            <Droplet className="size-4 shrink-0" />
            Signaler le début des règles
          </>
        )}
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
              className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100"
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
              className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 w-24"
            />
          </label>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setOuvert(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            className="bg-red-600 text-white hover:bg-red-700"
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
