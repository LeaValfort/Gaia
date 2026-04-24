'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { loggerActivite } from '@/lib/db/activities'
import { ACTIVITY_LOG_INITIAL, getSportConfig, type ConfigChamp } from '@/lib/data/sportsConfig'
import { cn } from '@/lib/utils'
import type { ActivityLogFormData, TypeActivite } from '@/types'

const CHIPS: { type: TypeActivite; label: string }[] = [
  { type: 'escalade', label: '🧗 Escalade' },
  { type: 'velo', label: '🚴 Vélo' },
  { type: 'course', label: '🏃 Course' },
  { type: 'pilates', label: '🩰 Pilates' },
  { type: 'danse', label: '💃 Danse' },
  { type: 'rando', label: '🥾 Rando' },
  { type: 'autre', label: '➕ Autre' },
]
const EMOJIS = ['😴', '😕', '😊', '⚡', '🚀'] as const

function champ(c: ConfigChamp, f: ActivityLogFormData, set: (k: keyof ActivityLogFormData, v: string) => void) {
  const v = f[c.cle] as string
  return (
    <div key={c.cle} className="space-y-1">
      <p className="text-xs font-medium text-amber-900/80 dark:text-amber-200/80">
        {c.label}
        {c.unite ? ` (${c.unite})` : ''}
        {c.optionnel ? ' — optionnel' : ''}
      </p>
      <Input
        type={c.type === 'nombre' || c.type === 'duree' ? 'number' : 'text'}
        min={c.type === 'duree' || c.type === 'nombre' ? 0 : undefined}
        value={v}
        onChange={(e) => set(c.cle, e.target.value)}
        className="border-amber-200 dark:border-amber-800/80"
        placeholder={c.placeholder}
      />
    </div>
  )
}

export function OngletAutreSport({ userId, date }: { userId: string; date: string }) {
  const r = useRouter()
  const [f, setF] = useState<ActivityLogFormData>(ACTIVITY_LOG_INITIAL)
  const [ch, setCh] = useState(false)
  const t = f.sport_type
  const cfg = t ? getSportConfig(t) : null
  const setV = (k: keyof ActivityLogFormData, v: string) => setF((p) => ({ ...p, [k]: v }))

  async function save() {
    if (!t || !userId) {
      if (!userId) toast.error('Connecte-toi pour enregistrer')
      return
    }
    setCh(true)
    try {
      await loggerActivite({ ...f, date, feeling: f.feeling || '' })
      toast.success('Activité enregistrée ! 🎯')
      setF(ACTIVITY_LOG_INITIAL)
      r.refresh()
    } catch {
      toast.error('Enregistrement impossible')
    } finally {
      setCh(false)
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-amber-200/90 bg-[#FFFBEB]/90 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
      <p className="text-xs font-semibold text-[#D97706]">Type d’activité</p>
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button
            key={c.type}
            type="button"
            onClick={() => setF({ ...ACTIVITY_LOG_INITIAL, sport_type: c.type })}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm',
              t === c.type ? 'border-[#D97706] bg-amber-100 font-medium dark:bg-amber-900/50' : 'border-amber-200/80 dark:border-amber-800'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      {cfg ? (
        <div className="space-y-3">
          {cfg.champs.map((c) => champ(c, f, setV))}
        </div>
      ) : null}
      {t ? (
        <>
          <div>
            <p className="mb-1 text-xs font-medium text-amber-900/80 dark:text-amber-200/80">Ressenti</p>
            <div className="flex flex-wrap justify-center gap-1">
              {EMOJIS.map((e, i) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setV('feeling', f.feeling === e ? '' : e)}
                  className={cn('rounded-full border-2 p-2 text-lg', f.feeling === e ? 'border-[#D97706] bg-amber-100' : 'border-transparent')}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <Textarea value={f.notes} onChange={(e) => setV('notes', e.target.value)} className="border-amber-200 text-sm dark:border-amber-800" rows={2} placeholder="Notes" />
        </>
      ) : null}
      <Button onClick={() => void save()} disabled={ch || !t} className="w-full bg-[#D97706] hover:bg-amber-700">
        {ch ? '…' : 'Enregistrer'}
      </Button>
    </div>
  )
}
