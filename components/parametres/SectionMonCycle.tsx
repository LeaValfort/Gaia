'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowRight, CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { getCycleDay, getInfosPhase, getPhaseForDay } from '@/lib/cycle'
import { cn } from '@/lib/utils'
import type { ModeUtilisateur, Phase, UserPreferences } from '@/types'

interface SectionMonCycleProps {
  prefs: UserPreferences
  onUpdate: (updates: Partial<Omit<UserPreferences, 'id' | 'user_id'>>) => Promise<boolean>
}

export function SectionMonCycle({ prefs, onUpdate }: SectionMonCycleProps) {
  const avecCycle = prefs.mode_utilisateur === 'cycle'
  const [dureeDraft, setDureeDraft] = useState(prefs.cycle_length)
  const [dialogOuvert, setDialogOuvert] = useState(false)
  const [modeEnAttente, setModeEnAttente] = useState<ModeUtilisateur | null>(null)

  useEffect(() => {
    setDureeDraft(prefs.cycle_length)
  }, [prefs.cycle_length])

  const debut = prefs.last_cycle_start ? parseISO(prefs.last_cycle_start) : null
  const aujourdhui = new Date()
  const jourDuCycle = debut && avecCycle ? getCycleDay(debut, aujourdhui, prefs.cycle_length) : null
  const phase: Phase | null =
    jourDuCycle && avecCycle ? getPhaseForDay(jourDuCycle, prefs.cycle_length) : null
  const infosPhase = phase ? getInfosPhase(phase) : null

  const dateAffichee = debut
    ? format(debut, 'd MMMM yyyy', { locale: fr })
    : null

  function demanderChangementMode(coche: boolean) {
    const mode: ModeUtilisateur = coche ? 'cycle' : 'sans_cycle'
    if (mode === prefs.mode_utilisateur) return
    setModeEnAttente(mode)
    setDialogOuvert(true)
  }

  async function confirmerChangementMode() {
    if (!modeEnAttente) return
    const ok = await onUpdate({ mode_utilisateur: modeEnAttente })
    if (ok) {
      setDialogOuvert(false)
      setModeEnAttente(null)
    }
  }

  async function sauverDuree(valeur: number) {
    const v = Math.min(35, Math.max(21, valeur))
    if (v === prefs.cycle_length) return
    await onUpdate({ cycle_length: v })
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 py-1">
        <Label htmlFor="toggle-cycle" className="text-sm font-medium">
          Avec cycle menstruel
        </Label>
        <Switch
          id="toggle-cycle"
          checked={avecCycle}
          onCheckedChange={demanderChangementMode}
        />
      </div>

      {!avecCycle ? (
        <p className="text-sm text-muted-foreground">Mode sans cycle — nutrition générale</p>
      ) : null}

      {avecCycle && infosPhase && jourDuCycle ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Phase aujourd&apos;hui</span>
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', infosPhase.couleurBadge)}>
            {infosPhase.label}
          </span>
          <span className="text-muted-foreground">Jour {jourDuCycle}</span>
        </div>
      ) : null}

      {avecCycle ? (
        <>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <Label htmlFor="duree-cycle">Durée du cycle</Label>
              <span className="font-medium tabular-nums">{dureeDraft} jours</span>
            </div>
            <Slider
              id="duree-cycle"
              min={21}
              max={35}
              value={dureeDraft}
              onValueChange={setDureeDraft}
              onPointerUp={(e) => {
                const v = Number((e.currentTarget as HTMLInputElement).value)
                void sauverDuree(v)
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Début du dernier cycle</Label>
            <Popover>
              <PopoverTrigger
                className={cn(
                  'inline-flex h-9 w-full max-w-xs items-center justify-start gap-2 rounded-lg border border-input',
                  'bg-background px-3 text-sm font-normal hover:bg-muted/50 dark:bg-neutral-950'
                )}
              >
                <CalendarIcon className="size-4 text-muted-foreground" aria-hidden />
                {dateAffichee ?? 'Choisir une date'}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <Input
                  type="date"
                  value={prefs.last_cycle_start ?? ''}
                  onChange={(e) => void onUpdate({ last_cycle_start: e.target.value || null })}
                  className="bg-background dark:bg-neutral-950"
                  aria-label="Date de début du dernier cycle"
                />
              </PopoverContent>
            </Popover>
          </div>
        </>
      ) : null}

      <Link
        href="/proches"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Gérer les proches
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>

      <Dialog open={dialogOuvert} onOpenChange={setDialogOuvert}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer de mode</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tes données sont conservées. La navigation Cycle sera masquée ou affichée selon le mode choisi.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDialogOuvert(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={() => void confirmerChangementMode()}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
