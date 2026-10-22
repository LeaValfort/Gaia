'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createRecurringTodo } from '@/lib/db/recurring-todos'
import { AVEC_DATE_POSE, DUREES_ANS, LIBELLES_CONTRACEPTION } from '@/lib/sante/rdv'
import { cn } from '@/lib/utils'
import type { SanteProfil, TypeContraception } from '@/types'

interface FormulaireContraceptionProps {
  userId: string
  profil: SanteProfil
  onMaj: (maj: Partial<Omit<SanteProfil, 'user_id' | 'updated_at'>>) => Promise<boolean>
}

const PASTILLE = 'rounded-full border px-3 py-1.5 text-sm transition-colors'
const ACTIVE = 'border-violet-500 bg-violet-50 font-medium text-violet-900 dark:bg-violet-950/50 dark:text-violet-100'
const INACTIVE = 'border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300'

/** Contraception : type, date de pose et durée de validité, rappel pilule. */
export function FormulaireContraception({ userId, profil, onMaj }: FormulaireContraceptionProps) {
  const [ajoutPilule, setAjoutPilule] = useState(false)
  const avecPose = AVEC_DATE_POSE.includes(profil.contraception)

  async function maj(m: Partial<Omit<SanteProfil, 'user_id' | 'updated_at'>>) {
    if (!(await onMaj(m))) toast.error('Enregistrement impossible')
  }

  async function ajouterRappelPilule() {
    setAjoutPilule(true)
    try {
      await createRecurringTodo(userId, { text: '💊 Prendre la pilule', frequency: 'daily', week_days: null, month_day: null })
      toast.success('Ajouté à tes tâches récurrentes, tous les jours')
    } catch {
      toast.error('Impossible d’ajouter la tâche')
    } finally {
      setAjoutPilule(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(LIBELLES_CONTRACEPTION) as TypeContraception[]).map((t) => (
          <button key={t} type="button" onClick={() => void maj({ contraception: t })} className={cn(PASTILLE, profil.contraception === t ? ACTIVE : INACTIVE)}>
            {LIBELLES_CONTRACEPTION[t]}
          </button>
        ))}
      </div>

      {avecPose ? (
        <div className="space-y-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900/60">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">Date de pose</span>
            <Input
              type="date"
              className="w-44"
              value={profil.date_pose ?? ''}
              onChange={(e) => void maj({ date_pose: e.target.value || null })}
            />
          </label>
          <div className="space-y-1 text-sm">
            <p className="font-medium text-neutral-800 dark:text-neutral-200">À changer au bout de</p>
            <div className="flex flex-wrap gap-1.5">
              {DUREES_ANS.map((a) => (
                <button key={a} type="button" onClick={() => void maj({ duree_ans: profil.duree_ans === a ? null : a })} className={cn(PASTILLE, profil.duree_ans === a ? ACTIVE : INACTIVE)}>
                  {a} ans
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Ça dépend du modèle : la durée est indiquée sur la notice ou ta carte de pose, sinon demande à ton ou ta gynéco.
            </p>
          </div>
        </div>
      ) : null}

      {profil.contraception === 'pilule' ? (
        <Button type="button" variant="outline" size="sm" disabled={ajoutPilule} onClick={() => void ajouterRappelPilule()}>
          💊 Ajouter « Prendre la pilule » à mes tâches de chaque jour
        </Button>
      ) : null}
    </div>
  )
}
