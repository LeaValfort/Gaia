'use client'

import { addDays, format, parseISO, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Bell, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useNotificationsPush } from '@/hooks/useNotificationsPush'
import { usePilule } from '@/hooks/usePilule'
import { cn } from '@/lib/utils'

/** Pilule : prise du jour à cocher, 7 derniers jours, rappel par notification. */
export function CartePilule({ userId }: { userId: string }) {
  const p = usePilule(userId)
  const push = useNotificationsPush()
  const priseAuj = p.prises.get(p.aujourdhui)
  const jours = Array.from({ length: 7 }, (_, i) => format(addDays(subDays(new Date(), 6), i), 'yyyy-MM-dd'))

  async function basculer(date: string) {
    if (!(await p.basculerPrise(date))) toast.error('Enregistrement impossible')
  }

  async function changerRappel(rappel_actif: boolean, heure = p.reglages.heure) {
    if (rappel_actif && push.etat === 'inactif') {
      try {
        await push.activer()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Notifications non activées')
        return
      }
    }
    if (!(await p.majReglages({ rappel_actif, heure }))) toast.error('Réglage non enregistré')
  }

  if (p.chargement) return <p className="text-sm text-muted-foreground">Chargement…</p>

  return (
    <section className="space-y-4 rounded-2xl border border-violet-200 bg-white p-4 dark:border-violet-900/50 dark:bg-neutral-900/60">
      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">💊 Ma pilule</p>
      <Button
        type="button"
        onClick={() => void basculer(p.aujourdhui)}
        variant={priseAuj ? 'outline' : 'default'}
        className={cn('w-full', !priseAuj && 'bg-violet-600 text-white hover:bg-violet-700')}
      >
        {priseAuj ? (
          <>
            <Check className="mr-1.5 size-4" /> Prise à {format(parseISO(priseAuj), 'HH:mm')} — toucher pour annuler
          </>
        ) : (
          'J’ai pris ma pilule aujourd’hui'
        )}
      </Button>
      <div className="flex justify-between gap-1">
        {jours.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => void basculer(d)}
            className="flex flex-1 flex-col items-center gap-1 text-[10px] text-muted-foreground"
            aria-label={`${format(parseISO(d), 'EEEE d', { locale: fr })} : ${p.prises.has(d) ? 'prise' : 'non prise'}`}
          >
            {format(parseISO(d), 'EEEEE', { locale: fr })}
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full border',
                p.prises.has(d) ? 'border-violet-500 bg-violet-500 text-white' : 'border-neutral-200 dark:border-neutral-700'
              )}
            >
              {p.prises.has(d) ? <Check className="size-3.5" /> : null}
            </span>
          </button>
        ))}
      </div>
      <div className="space-y-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-sm">
            <Bell className="size-4 text-violet-500" aria-hidden /> Rappel chaque jour
          </span>
          <Switch checked={p.reglages.rappel_actif} onCheckedChange={(v) => void changerRappel(v)} />
        </div>
        {p.reglages.rappel_actif ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            à
            <Input type="time" value={p.reglages.heure} onChange={(e) => e.target.value && void changerRappel(true, e.target.value)} className="h-9 w-28" />
            <span className="text-xs">(sauf si déjà prise)</span>
          </label>
        ) : null}
        {p.reglages.rappel_actif && push.etat !== 'actif' && push.etat !== 'chargement' ? (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Notifications pas encore actives sur cet appareil : sur iPhone, ouvre Gaia depuis l’icône de l’écran d’accueil, puis réactive le rappel.
          </p>
        ) : null}
      </div>
    </section>
  )
}
