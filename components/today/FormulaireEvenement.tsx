'use client'

import { useEffect, useState } from 'react'
import { addHours, format } from 'date-fns'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { designPhaseAffichage } from '@/lib/cycle'
import { creerEvenement } from '@/lib/calendar'
import type { NouvelEvenement, Phase } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormulaireEvenementChamps } from '@/components/today/FormulaireEvenementChamps'

export interface FormulaireEvenementProps {
  open: boolean
  onOpenChange: (ouvert: boolean) => void
  date: string
  phase: Phase | null
  sansCycle?: boolean
  onCree: () => void
}

export function FormulaireEvenement({
  open, onOpenChange, date, phase, sansCycle, onCree,
}: FormulaireEvenementProps) {
  const d = designPhaseAffichage(phase ?? 'folliculaire', { sansCycle: Boolean(sansCycle) })
  const [titre, setTitre] = useState('')
  const [journee, setJournee] = useState(false)
  const [dateEv, setDateEv] = useState(date)
  const [hDebut, setHDebut] = useState(() => format(new Date(), 'HH:mm'))
  const [hFin, setHFin] = useState(() => format(addHours(new Date(), 1), 'HH:mm'))
  const [lieu, setLieu] = useState('')
  const [desc, setDesc] = useState('')
  const [charge, setCharge] = useState(false)

  useEffect(() => {
    if (!open) return
    setDateEv(date)
    setTitre('')
    setJournee(false)
    setHDebut(format(new Date(), 'HH:mm'))
    setHFin(format(addHours(new Date(), 1), 'HH:mm'))
    setLieu('')
    setDesc('')
  }, [open, date])

  async function soumettre() {
    if (!titre.trim()) {
      toast.error('Indique un titre')
      return
    }
    const payload: NouvelEvenement = {
      titre: titre.trim(),
      date: dateEv,
      heureDebut: hDebut,
      heureFin: hFin,
      lieu: lieu.trim(),
      description: desc.trim(),
      estToutJournee: journee,
    }
    setCharge(true)
    try {
      if (await creerEvenement(payload)) {
        toast.success('Événement créé')
        onCree()
        onOpenChange(false)
      } else {
        toast.error('Création impossible — reconnecte-toi si besoin')
      }
    } finally {
      setCharge(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(ouvert) => onOpenChange(ouvert)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-4" aria-hidden />
            Nouvel événement
          </DialogTitle>
        </DialogHeader>
        <FormulaireEvenementChamps
          titre={titre} setTitre={setTitre} journee={journee} setJournee={setJournee}
          dateEv={dateEv} setDateEv={setDateEv} hDebut={hDebut} setHDebut={setHDebut}
          hFin={hFin} setHFin={setHFin} lieu={lieu} setLieu={setLieu} desc={desc} setDesc={setDesc}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button
            type="button"
            disabled={charge}
            onClick={() => void soumettre()}
            className="text-white"
            style={{ backgroundColor: d.accent }}
          >
            {charge ? 'Création…' : 'Créer l’événement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
