'use client'

import { useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { upsertMensuration } from '@/lib/db/progression'
import type { Mensuration } from '@/types'

interface FormulaireMensurationProps {
  userId: string
  onSauvegarde?: (m: Mensuration) => void
  /** Surcharge du bouton déclencheur (ex. page Progression, couleur phase) */
  triggerClassName?: string
  triggerStyle?: CSSProperties
}

function parseIntOrNull(v: string): number | null {
  const t = v.trim()
  if (!t) return null
  const n = Number.parseInt(t, 10)
  return Number.isNaN(n) ? null : n
}

function parseFloatOrNull(v: string): number | null {
  const t = v.trim().replace(',', '.')
  if (!t) return null
  const n = Number.parseFloat(t)
  return Number.isNaN(n) ? null : Math.round(n * 10) / 10
}

export function FormulaireMensuration({
  userId: _userId,
  onSauvegarde,
  triggerClassName,
  triggerStyle,
}: FormulaireMensurationProps) {
  const router = useRouter()
  const [ouvert, setOuvert] = useState(false)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [poids, setPoids] = useState('')
  const [taille, setTaille] = useState('')
  const [hanches, setHanches] = useState('')
  const [brasG, setBrasG] = useState('')
  const [brasD, setBrasD] = useState('')
  const [cuisseG, setCuisseG] = useState('')
  const [cuisseD, setCuisseD] = useState('')
  const [notes, setNotes] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [chargement, setChargement] = useState(false)

  async function enregistrer() {
    setErreur(null)
    const pk = parseFloatOrNull(poids)
    const tt = parseIntOrNull(taille)
    const th = parseIntOrNull(hanches)
    const bg = parseIntOrNull(brasG)
    const bd = parseIntOrNull(brasD)
    const cg = parseIntOrNull(cuisseG)
    const cd = parseIntOrNull(cuisseD)
    if (pk == null && tt == null && th == null && bg == null && bd == null && cg == null && cd == null) {
      setErreur('Renseigne au moins le poids ou une mesure en cm.')
      return
    }
    setChargement(true)
    const row = await upsertMensuration({
      date,
      poids_kg: pk,
      tour_taille: tt,
      tour_hanches: th,
      tour_bras_g: bg,
      tour_bras_d: bd,
      tour_cuisse_g: cg,
      tour_cuisse_d: cd,
      notes: notes.trim() || null,
    })
    setChargement(false)
    if (!row) {
      setErreur('Enregistrement impossible (table mensurations ou droits Supabase).')
      return
    }
    onSauvegarde?.(row)
    setOuvert(false)
    setPoids('')
    setTaille('')
    setHanches('')
    setBrasG('')
    setBrasD('')
    setCuisseG('')
    setCuisseD('')
    setNotes('')
    router.refresh()
  }

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <Button
        type="button"
        size="sm"
        onClick={() => setOuvert(true)}
        className={cn('font-medium', triggerClassName)}
        style={triggerStyle}
      >
        + Ajouter une mensuration
      </Button>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mensuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <Label className="text-xs">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Poids (kg)</Label>
            <Input value={poids} onChange={(e) => setPoids(e.target.value)} placeholder="59.5" className="h-9" inputMode="decimal" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Tour taille (cm)</Label>
              <Input value={taille} onChange={(e) => setTaille(e.target.value)} inputMode="numeric" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tour hanches (cm)</Label>
              <Input value={hanches} onChange={(e) => setHanches(e.target.value)} inputMode="numeric" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bras gauche (cm)</Label>
              <Input value={brasG} onChange={(e) => setBrasG(e.target.value)} inputMode="numeric" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bras droit (cm)</Label>
              <Input value={brasD} onChange={(e) => setBrasD(e.target.value)} inputMode="numeric" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cuisse gauche (cm)</Label>
              <Input value={cuisseG} onChange={(e) => setCuisseG(e.target.value)} inputMode="numeric" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cuisse droite (cm)</Label>
              <Input value={cuisseD} onChange={(e) => setCuisseD(e.target.value)} inputMode="numeric" className="h-9" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optionnel" />
          </div>
          {erreur ? <p className="text-xs text-red-600 dark:text-red-400">{erreur}</p> : null}
          <Button type="button" className="w-full" disabled={chargement} onClick={() => void enregistrer()}>
            {chargement ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
