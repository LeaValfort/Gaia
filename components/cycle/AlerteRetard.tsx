'use client'

import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AlerteRetardProps {
  retardJours: number
  datePrevue: string
  onConfirmer: () => void
}

export function AlerteRetard({ retardJours, datePrevue, onConfirmer }: AlerteRetardProps) {
  const dateLabel = format(parseISO(datePrevue), 'EEEE d MMMM yyyy', { locale: fr })

  return (
    <div
      className="rounded-2xl border-2 border-orange-400 bg-[#FED7AA] p-4 text-[#7C2D12] motion-safe:animate-pulse motion-reduce:animate-none shadow-[0_0_0_1px_rgba(249,115,22,0.35)]"
      role="status"
    >
      <div className="flex gap-3">
        <AlertTriangle className="size-5 shrink-0 mt-0.5" aria-hidden />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-semibold leading-tight">Règles en retard</p>
          <p className="text-sm leading-relaxed opacity-95">
            Tes règles étaient attendues autour du <span className="font-medium">{dateLabel}</span>.
            Cela fait <span className="font-semibold">{retardJours}</span>{' '}
            {retardJours > 1 ? 'jours' : 'jour'} que la fenêtre habituelle est dépassée (hors jour de
            marge).
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-1 w-fit bg-orange-600 text-white hover:bg-orange-700"
            onClick={onConfirmer}
          >
            Enregistrer le début de mes règles
          </Button>
        </div>
      </div>
    </div>
  )
}
