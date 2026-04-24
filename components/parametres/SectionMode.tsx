'use client'

import { useState, type ReactNode } from 'react'
import { Moon, Dumbbell, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ModeUtilisateur, UserPreferences } from '@/types'

interface SectionModeProps {
  prefs: UserPreferences
  onUpdate: (updates: Partial<Omit<UserPreferences, 'id' | 'user_id'>>) => Promise<boolean>
}

export function SectionMode({ prefs, onUpdate }: SectionModeProps) {
  const [dialogOuvert, setDialogOuvert] = useState(false)
  const [modeEnAttente, setModeEnAttente] = useState<ModeUtilisateur | null>(null)

  function demanderChangement(mode: ModeUtilisateur) {
    if (mode === prefs.mode_utilisateur) return
    setModeEnAttente(mode)
    setDialogOuvert(true)
  }

  async function confirmer() {
    if (!modeEnAttente) return
    const ok = await onUpdate({ mode_utilisateur: modeEnAttente })
    if (ok) {
      setDialogOuvert(false)
      setModeEnAttente(null)
    }
  }

  const carte = (mode: ModeUtilisateur, titre: string, desc: string, icone: ReactNode, badge?: string) => {
    const sel = prefs.mode_utilisateur === mode
    return (
      <button
        type="button"
        onClick={() => demanderChangement(mode)}
        className={`text-left rounded-2xl border transition-colors w-full ${
          sel
            ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/30 ring-1 ring-emerald-500/30'
            : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600'
        }`}
      >
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <span className="text-2xl" aria-hidden>{icone}</span>
              {badge ? <Badge variant="secondary" className="text-xs shrink-0">{badge}</Badge> : null}
            </div>
            <CardTitle className="text-base">{titre}</CardTitle>
            <CardDescription className="text-xs leading-relaxed">{desc}</CardDescription>
          </CardHeader>
        </Card>
      </button>
    )
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          👤 Mode de l&apos;application
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Choisis le mode adapté à ta situation.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {carte(
          'cycle',
          'Avec cycle menstruel',
          'Les recommandations s’adaptent à ta phase du cycle (sport, alimentation, calendrier).',
          <Moon className="size-7 text-violet-600 dark:text-violet-400" />,
          'Recommandé'
        )}
        {carte(
          'sans_cycle',
          'Sans cycle menstruel',
          'Nutrition anti-inflammatoire générale selon ton type de journée — sans suivi de cycle (ménopause, grossesse, CHC…).',
          <Dumbbell className="size-7 text-amber-600 dark:text-amber-400" />
        )}
      </div>

      <Dialog open={dialogOuvert} onOpenChange={setDialogOuvert}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer de mode</DialogTitle>
            <DialogDescription>
              Changer de mode masque ou affiche la section Cycle et la navigation associée. Tes données
              (journal, historique) sont conservées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDialogOuvert(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={() => void confirmer()} className="gap-1.5">
              <CheckCircle2 size={16} /> Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
