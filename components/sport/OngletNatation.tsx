'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { loggerSeanceNatation } from '@/lib/db/workouts'
import { modifierSeanceNatation } from '@/lib/db/workoutsModifier'
import { getNiveauDetail } from '@/lib/data/swimming'
import { SWIM_LEVEL_MAX, SWIM_LEVEL_MIN, type Phase, type WorkoutNatationComplet } from '@/types'
import { cn } from '@/lib/utils'

const RESS = ['😴', '😕', '😊', '⚡', '🚀'] as const

export function OngletNatation({
  phase: _p,
  userId: _u,
  date,
  seanceExistante,
}: {
  phase: Phase | null
  userId: string
  date: string
  seanceExistante?: WorkoutNatationComplet | null
}) {
  const router = useRouter()
  const edit = !!seanceExistante
  const [niv, setNiv] = useState(seanceExistante?.swim.level ?? 1)
  const [distReelle, setDistReelle] = useState(
    seanceExistante?.swim.total_distance_m != null ? String(seanceExistante.swim.total_distance_m) : ''
  )
  const [notes, setNotes] = useState(seanceExistante?.notes ?? '')
  const [res, setRes] = useState(seanceExistante?.feeling ?? 0)
  const [ch, setCh] = useState(false)
  const info = getNiveauDetail(niv)
  const dist = parseInt(distReelle, 10)
  const totalM = Number.isFinite(dist) && dist > 0 ? dist : info.distanceTotale
  const rCrawl = info.distanceTotale > 0 ? info.crawlM / info.distanceTotale : 0.7
  const crawlM = Math.round(totalM * rCrawl)
  const breaststrokeM = Math.max(0, totalM - crawlM)

  async function save() {
    setCh(true)
    try {
      const nat = {
        level: niv,
        totalDistance: totalM,
        crawlM,
        breaststrokeM,
        blockStructure: info.structure,
      }
      if (edit && seanceExistante) {
        await modifierSeanceNatation(seanceExistante.id, { ...nat, feeling: res || null, notes: notes || null })
      } else {
        await loggerSeanceNatation({ date, feeling: res || null, notes: notes || null, natation: nat })
      }
      toast.success('Séance enregistrée ! 🏊')
      router.refresh()
    } finally {
      setCh(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-emerald-200/80 bg-[#ECFDF5]/80 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
      {edit ? (
        <div className="flex items-center gap-2 text-sm text-[#065F46] dark:text-emerald-200">
          <Pencil className="size-4" /> Modification
        </div>
      ) : null}
      <p className="text-xs font-semibold uppercase text-[#059669] dark:text-emerald-300">Niveau actuel</p>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: SWIM_LEVEL_MAX - SWIM_LEVEL_MIN + 1 }, (_, i) => i + SWIM_LEVEL_MIN).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setNiv(n)}
            className={cn(
              'min-w-[2.5rem] rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
              niv === n ? 'bg-[#059669] text-white shadow' : 'bg-white/90 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100'
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-emerald-200/60 bg-white/60 p-3 text-sm dark:border-emerald-800 dark:bg-emerald-950/30">
        <p className="font-medium text-neutral-900 dark:text-neutral-50">{getNiveauDetail(niv).description}</p>
        <p className="mt-1 font-mono text-[#059669] dark:text-emerald-300">
          {info.structure} = {info.distanceTotale} m
        </p>
      </div>
      <div>
        <p className="text-xs text-neutral-500">Distance réelle nagée (m)</p>
        <Input
          type="number"
          min={0}
          value={distReelle}
          onChange={(e) => setDistReelle(e.target.value)}
          className="border-emerald-200 dark:border-emerald-800"
          placeholder={`ex. ${info.distanceTotale}`}
        />
      </div>
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="border-emerald-200 text-sm dark:border-emerald-800" placeholder="Notes (optionnel)" />
      <div>
        <p className="mb-1 text-xs font-semibold text-[#059669] dark:text-emerald-200">Ressenti</p>
        <div className="flex flex-wrap justify-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRes(i === res ? 0 : i)}
              className={cn(
                'rounded-full border-2 p-2 text-lg',
                i === res ? 'border-[#059669] bg-emerald-100 dark:bg-emerald-900/50' : 'border-transparent'
              )}
            >
              {RESS[i - 1]}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-[#059669]/30 bg-[#ECFDF5] px-4 py-3 text-sm text-[#065F46] dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
        <p className="font-semibold">Bilan</p>
        <p>
          Niveau {niv} · {info.distanceTotale} m prévus · Nage libre + Brasse
        </p>
      </div>
      <Button onClick={() => void save()} disabled={ch} className="w-full bg-[#059669] hover:bg-emerald-700">
        {ch ? '…' : 'Enregistrer'}
      </Button>
    </div>
  )
}
