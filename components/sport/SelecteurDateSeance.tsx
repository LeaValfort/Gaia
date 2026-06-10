'use client'

import { format, isToday, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function SelecteurDateSeance({
  date,
  max,
  onChange,
}: {
  date: string
  max: string
  onChange: (date: string) => void
}) {
  const d = parseISO(`${date}T12:00:00`)
  const libelle = isToday(d)
    ? "Aujourd'hui"
    : format(d, 'EEEE d MMMM yyyy', { locale: fr })

  return (
    <div className="space-y-1.5">
      <Label htmlFor="date-seance">Date de la séance</Label>
      <Input
        id="date-seance"
        type="date"
        value={date}
        max={max}
        onChange={(e) => {
          const v = e.target.value
          if (v) onChange(v)
        }}
        className="dark:bg-neutral-950"
      />
      <p className="text-xs text-muted-foreground capitalize">{libelle}</p>
    </div>
  )
}
