'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FormulaireRdvProps {
  onAjouter: (r: { titre: string; date: string; recurrence_mois: number | null; notes: string | null }) => Promise<boolean>
}

const SUGGESTIONS = ['Gynéco', 'Frottis', 'Prise de sang', 'Dentiste', 'Médecin généraliste', 'Dermato']
const RECURRENCES: { mois: number | null; label: string }[] = [
  { mois: null, label: 'Une fois' },
  { mois: 6, label: '6 mois' },
  { mois: 12, label: '1 an' },
  { mois: 24, label: '2 ans' },
  { mois: 36, label: '3 ans' },
  { mois: 60, label: '5 ans' },
]
const PASTILLE = 'rounded-full border px-2.5 py-1 text-xs transition-colors'
const ACTIVE = 'border-violet-500 bg-violet-50 font-medium text-violet-900 dark:bg-violet-950/50 dark:text-violet-100'
const INACTIVE = 'border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300'

/** Ajout d'un RDV santé : titre (suggestions), date, répétition. */
export function FormulaireRdv({ onAjouter }: FormulaireRdvProps) {
  const [ouvert, setOuvert] = useState(false)
  const [titre, setTitre] = useState('')
  const [date, setDate] = useState('')
  const [recurrence, setRecurrence] = useState<number | null>(null)
  const [ch, setCh] = useState(false)

  async function valider() {
    if (!titre.trim() || !date) return
    setCh(true)
    const ok = await onAjouter({ titre, date, recurrence_mois: recurrence, notes: null })
    setCh(false)
    if (!ok) {
      toast.error('Ajout impossible')
      return
    }
    setTitre('')
    setDate('')
    setRecurrence(null)
    setOuvert(false)
  }

  if (!ouvert) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOuvert(true)}>
        <Plus className="mr-1 size-3.5" /> Ajouter un rendez-vous
      </Button>
    )
  }

  return (
    <div className="space-y-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => setTitre(s)} className={cn(PASTILLE, titre === s ? ACTIVE : INACTIVE)}>
            {s}
          </button>
        ))}
      </div>
      <Input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Rendez-vous" />
      <Input type="date" className="w-44" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
      <div>
        <p className="mb-1 text-xs font-medium text-neutral-700 dark:text-neutral-300">Se répète</p>
        <div className="flex flex-wrap gap-1.5">
          {RECURRENCES.map((r) => (
            <button key={r.label} type="button" onClick={() => setRecurrence(r.mois)} className={cn(PASTILLE, recurrence === r.mois ? ACTIVE : INACTIVE)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={ch || !titre.trim() || !date} onClick={() => void valider()}>
          {ch ? '…' : 'Ajouter'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOuvert(false)}>
          Annuler
        </Button>
      </div>
    </div>
  )
}
