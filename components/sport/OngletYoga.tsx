'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { TimerYoga } from '@/components/sport/TimerYoga'
import { YogaPostureLigne } from '@/components/sport/yoga/YogaPostureLigne'
import { MuscuRessentiEmojis } from '@/components/sport/muscu/MuscuRessentiEmojis'
import { getSeanceParPhase, getSeanceYoga } from '@/lib/data/yoga'
import { loggerSeanceYoga } from '@/lib/db/workouts'
import { modifierSeanceYoga } from '@/lib/db/workoutsModifier'
import type { Phase, SeanceYoga, TypeYoga, WorkoutYogaComplet } from '@/types'

function parseType(n: string | null): TypeYoga | null {
  if (!n) return null
  const m = n.match(/^\[(\w+)\]/)
  const t = m?.[1]
  if (t === 'yin' || t === 'flow' || t === 'power') return t
  return null
}

const MODES: { t: TypeYoga; label: string; e: string }[] = [
  { t: 'yin', label: 'Yin', e: '🌙' },
  { t: 'flow', label: 'Flow', e: '🌿' },
  { t: 'power', label: 'Power', e: '⚡' },
]

export function OngletYoga({
  phase,
  userId: _u,
  date,
  seanceExistante,
}: {
  phase: Phase | null
  userId: string
  date: string
  seanceExistante?: WorkoutYogaComplet | null
}) {
  const r = useRouter()
  const edit = !!seanceExistante
  const def: SeanceYoga = phase ? getSeanceParPhase(phase) : getSeanceYoga('flow')
  const [type, setType] = useState<TypeYoga>(parseType(seanceExistante?.notes ?? null) ?? def.type)
  const seance = getSeanceYoga(type)
  const [timer, setTimer] = useState(false)
  const [coches, setCoches] = useState<Set<number>>(() => new Set())
  const [res, setRes] = useState(seanceExistante?.feeling ?? 0)
  const [notes, setNotes] = useState(() => (seanceExistante?.notes ?? '').replace(/^\[\w+\]\s*/, ''))
  const [ch, setCh] = useState(false)
  useEffect(() => {
    setCoches(new Set())
  }, [type])
  const toggle = (i: number) =>
    setCoches((s) => {
      const n = new Set(s)
      n.has(i) ? n.delete(i) : n.add(i)
      return n
    })
  async function save() {
    setCh(true)
    try {
      const p = { type, dureeMin: seance.dureeMin, feeling: res > 0 ? res : null, notes: notes || null }
      if (edit && seanceExistante) await modifierSeanceYoga(seanceExistante.id, p)
      else await loggerSeanceYoga({ date, ...p })
      toast.success('Séance yoga enregistrée ! 🧘')
      r.refresh()
    } finally {
      setCh(false)
    }
  }
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-violet-200/80 bg-[#F5F3FF]/80 p-4 dark:border-violet-900/50 dark:bg-violet-950/20">
      {edit ? (
        <div className="flex items-center gap-2 text-sm text-[#6D28D9] dark:text-violet-300">
          <Pencil className="size-4" /> Modification
        </div>
      ) : null}
      {phase && !edit ? (
        <p className="text-sm text-violet-800/80 dark:text-violet-200/90">
          Suggestion : {getSeanceParPhase(phase).nom}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.t}
            type="button"
            onClick={() => {
              setType(m.t)
              setTimer(false)
            }}
            className={`min-w-0 flex-1 rounded-lg px-2 py-2 text-sm sm:px-3 ${
              type === m.t ? 'bg-[#7C3AED] text-white' : 'bg-white/90 dark:bg-neutral-800/90'
            }`}
          >
            {m.e} {m.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{seance.description}</p>
      <div className="flex flex-col gap-2">
        {seance.postures.map((p, i) => (
          <YogaPostureLigne key={i} p={p} index={i} fait={coches.has(i)} onToggle={toggle} />
        ))}
      </div>
      {!timer ? (
        <Button type="button" className="w-full border-violet-300 bg-[#7C3AED] hover:bg-violet-800" onClick={() => setTimer(true)}>
          ▶ Lancer le timer guidé
        </Button>
      ) : (
        <TimerYoga postures={seance.postures} />
      )}
      <MuscuRessentiEmojis ressenti={res > 0 ? res : null} onChange={(n) => setRes(n ?? 0)} phase={phase} />
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="text-sm" placeholder="Notes" />
      <Button onClick={() => void save()} disabled={ch} className="w-full bg-[#7C3AED] hover:bg-violet-800">
        {ch ? '…' : 'Enregistrer'}
      </Button>
    </div>
  )
}
