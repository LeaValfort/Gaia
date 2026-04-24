'use client'

import { useEffect, useState } from 'react'
import { addDays, format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Moon, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { getCycleDay, getInfosPhase, getPhaseForDay } from '@/lib/cycle'
import { cn } from '@/lib/utils'
import type { Phase, UserPreferences } from '@/types'

interface SectionCycleProps {
  prefs: UserPreferences
  onUpdate: (updates: Partial<Omit<UserPreferences, 'id' | 'user_id'>>) => Promise<boolean>
}

export function SectionCycle({ prefs, onUpdate }: SectionCycleProps) {
  const [dureeDraft, setDureeDraft] = useState(prefs.cycle_length)
  useEffect(() => {
    setDureeDraft(prefs.cycle_length)
  }, [prefs.cycle_length])

  const debut = prefs.last_cycle_start ? parseISO(prefs.last_cycle_start) : null
  const aujourdhui = new Date()
  const jourDuCycle = debut ? getCycleDay(debut, aujourdhui, prefs.cycle_length) : null
  const phase: Phase | null = jourDuCycle ? getPhaseForDay(jourDuCycle, prefs.cycle_length) : null
  const infosPhase = phase ? getInfosPhase(phase) : null

  const prochain = debut
    ? format(addDays(debut, prefs.cycle_length), 'd MMMM yyyy', { locale: fr })
    : null

  async function sauverDuree(valeurSlider: number) {
    const v = Math.min(40, Math.max(18, valeurSlider))
    if (v === prefs.cycle_length) return
    await onUpdate({ cycle_length: v })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Moon className="size-4 text-violet-500" aria-hidden />
          Mon cycle
        </CardTitle>
        <CardDescription>Durée du cycle et date de début pour calibrer l&apos;app.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {infosPhase && jourDuCycle ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <RefreshCw className="size-4 text-neutral-400" aria-hidden />
            <span className="text-neutral-600 dark:text-neutral-300">Phase aujourd&apos;hui</span>
            <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', infosPhase.couleurBadge)}>
              {infosPhase.label}
            </span>
            <span className="text-neutral-500">Jour {jourDuCycle}</span>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Durée du cycle</Label>
            <span className="font-medium text-neutral-900 dark:text-neutral-50">{dureeDraft} jours</span>
          </div>
          <Slider
            min={18}
            max={40}
            value={dureeDraft}
            onValueChange={setDureeDraft}
            onPointerUp={(e) => {
              const v = Number((e.currentTarget as HTMLInputElement).value)
              void sauverDuree(v)
            }}
          />
          <p className="text-[10px] text-neutral-500">Relâche le curseur pour enregistrer la durée.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="last-cycle" className="flex items-center gap-1.5">
            <Calendar className="size-3.5" aria-hidden />
            Début du dernier cycle
          </Label>
          <Input
            id="last-cycle"
            type="date"
            value={prefs.last_cycle_start ?? ''}
            onChange={(e) => void onUpdate({ last_cycle_start: e.target.value || null })}
            className="max-w-xs"
          />
          {prochain ? (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Prochain cycle estimé : <span className="font-medium text-neutral-800 dark:text-neutral-200 capitalize">{prochain}</span>
            </p>
          ) : (
            <p className="text-xs text-neutral-500">Renseigne une date pour voir la prochaine estimation.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
