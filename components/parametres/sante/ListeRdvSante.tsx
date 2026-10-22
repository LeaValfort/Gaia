'use client'

import { Check, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { echeanceRdv } from '@/lib/sante/rdv'
import { cn } from '@/lib/utils'
import type { RdvSante, RdvSanteAffiche } from '@/types'

interface ListeRdvSanteProps {
  rdvs: RdvSanteAffiche[]
  onControleFait: () => Promise<boolean>
  onRdvFait: (r: RdvSante) => Promise<boolean>
  onSupprimer: (id: string) => Promise<boolean>
}

export function ListeRdvSante({ rdvs, onControleFait, onRdvFait, onSupprimer }: ListeRdvSanteProps) {
  if (!rdvs.length) return <p className="text-sm text-muted-foreground">Aucun rendez-vous à venir.</p>

  async function fait(r: RdvSanteAffiche) {
    const ok = r.source === 'controle_sterilet' ? await onControleFait() : r.rdv ? await onRdvFait(r.rdv) : false
    if (ok) toast.success(r.rdv?.recurrence_mois || r.source === 'controle_sterilet' ? 'C’est noté, prochain rappel programmé' : 'C’est noté')
    else toast.error('Mise à jour impossible')
  }

  return (
    <ul className="space-y-2">
      {rdvs.map((r) => {
        const e = r.date ? echeanceRdv(r.date) : null
        return (
          <li key={r.cle} className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{r.titre}</p>
              <p className={cn('text-xs', e?.urgent ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-muted-foreground')}>
                {e ? e.texte : r.detail}
                {r.rdv?.recurrence_mois ? ` · tous les ${r.rdv.recurrence_mois} mois` : ''}
              </p>
            </div>
            {r.source !== 'changement_contraception' && r.date ? (
              <Button type="button" size="sm" variant="outline" onClick={() => void fait(r)} className="shrink-0">
                <Check className="mr-1 size-3.5" /> Fait
              </Button>
            ) : null}
            {r.rdv ? (
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Supprimer le rendez-vous"
                className="h-8 w-8 shrink-0 text-neutral-400 hover:text-rose-600"
                onClick={() => void onSupprimer(r.rdv!.id).then((ok) => !ok && toast.error('Suppression impossible'))}
              >
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
