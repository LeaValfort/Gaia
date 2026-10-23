'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useNotificationsPush } from '@/hooks/useNotificationsPush'
import { getRecapActif, setRecapActif } from '@/lib/db/proches-notif-prefs'
import { supabase } from '@/lib/supabase'

const AIDE: Partial<Record<ReturnType<typeof useNotificationsPush>['etat'], string>> = {
  ios_ecran_accueil: 'Sur iPhone : ouvre Gaia dans Safari, Partager → « Sur l’écran d’accueil », puis ouvre Gaia depuis l’icône pour activer les notifications.',
  chargement: 'Vérification de cet appareil…',
  non_supporte: 'Notifications indisponibles ici. Sur iPhone : ouvre Gaia depuis l’icône de l’écran d’accueil (iOS 16.4 ou plus).',
  refuse: 'Les notifications sont bloquées pour Gaia : autorise-les dans les réglages du téléphone ou du navigateur.',
}

/** Proches : activer les notifications sur cet appareil + récap quotidien (côté proche qui reçoit). */
export function CarteNotificationsProches({ userId }: { userId: string }) {
  const { etat, raison, activer, desactiver } = useNotificationsPush()
  const [recap, setRecap] = useState(true)
  const [ch, setCh] = useState(false)

  useEffect(() => {
    let annule = false
    getRecapActif(supabase, userId).then((v) => !annule && setRecap(v))
    return () => {
      annule = true
    }
  }, [userId])

  async function basculer() {
    setCh(true)
    try {
      if (etat === 'actif') await desactiver()
      else {
        await activer()
        toast.success('Notifications activées sur cet appareil')
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Activation impossible')
    } finally {
      setCh(false)
    }
  }

  async function changerRecap(v: boolean) {
    setRecap(v)
    if (!(await setRecapActif(supabase, userId, v))) {
      setRecap(!v)
      toast.error('Réglage non enregistré')
    }
  }

  return (
    <section className="mb-6 space-y-3 rounded-2xl border border-rose-200 bg-white p-4 dark:border-rose-900/50 dark:bg-neutral-900">
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 size-5 shrink-0 text-rose-500" aria-hidden />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Notifications</p>
          <p className="text-xs text-muted-foreground">
            Sois prévenue quand une personne que tu suis a ses règles ou une douleur forte, selon ce qu’elle t’autorise.
          </p>
          {AIDE[etat] ? <p className="text-xs text-amber-700 dark:text-amber-300">{AIDE[etat]}</p> : null}
          {raison ? <p className="text-[11px] text-muted-foreground">Détail : {raison}</p> : null}
        </div>
      </div>
      {etat === 'actif' || etat === 'inactif' ? (
        <Button type="button" size="sm" variant={etat === 'actif' ? 'outline' : 'default'} disabled={ch} onClick={() => void basculer()} className="w-full">
          {etat === 'actif' ? <BellOff className="mr-1.5 size-4" /> : <Bell className="mr-1.5 size-4" />}
          {ch ? '…' : etat === 'actif' ? 'Désactiver sur cet appareil' : 'Activer les notifications'}
        </Button>
      ) : null}
      <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <Label htmlFor="recap-proches" className="text-sm font-normal">
          Récap du soir (vers 20 h) : énergie basse, humeur difficile
        </Label>
        <Switch id="recap-proches" checked={recap} onCheckedChange={(v) => void changerRecap(v)} />
      </div>
    </section>
  )
}
