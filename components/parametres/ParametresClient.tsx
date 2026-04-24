'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SectionAlimentation } from '@/components/parametres/SectionAlimentation'
import { SectionApp } from '@/components/parametres/SectionApp'
import { SectionMode } from '@/components/parametres/SectionMode'
import { SectionCycle } from '@/components/parametres/SectionCycle'
import { SectionExport } from '@/components/parametres/SectionExport'
import { SectionProches } from '@/components/parametres/SectionProches'
import { SectionPlanningSport } from '@/components/parametres/SectionPlanningSport'
import { updateUserPreferences } from '@/lib/db/parametres'
import type { UserPreferences } from '@/types'

interface ParametresClientProps {
  prefsInitiales: UserPreferences
  userId: string
  messageUrl?: string
}

export function ParametresClient({
  prefsInitiales,
  userId,
  messageUrl,
}: ParametresClientProps) {
  const router = useRouter()
  const [prefs, setPrefs] = useState(prefsInitiales)

  useEffect(() => {
    setPrefs(prefsInitiales)
  }, [prefsInitiales])

  useEffect(() => {
    if (messageUrl === 'active-le-mode-cycle-pour-acceder-ici') {
      toast.info('Active le mode « Avec cycle » dans les paramètres pour accéder à la page Cycle.')
    }
  }, [messageUrl])

  const onUpdate = useCallback(
    async (updates: Partial<Omit<UserPreferences, 'id' | 'user_id'>>) => {
      const prev = prefs
      setPrefs((p) => ({ ...p, ...updates }))
      const ok = await updateUserPreferences(updates)
      if (ok) {
        toast.success('Enregistré')
        router.refresh()
      } else {
        setPrefs(prev)
        toast.error('Impossible d’enregistrer. Réessaie.')
      }
      return ok
    },
    [prefs, router]
  )

  return (
    <div className="flex flex-col gap-6">
      <SectionMode prefs={prefs} onUpdate={onUpdate} />
      <SectionProches />
      {prefs.mode_utilisateur === 'cycle' ? <SectionCycle prefs={prefs} onUpdate={onUpdate} /> : null}
      <SectionPlanningSport prefs={prefs} onUpdate={onUpdate} />
      <SectionAlimentation prefs={prefs} onUpdate={onUpdate} />
      <SectionApp prefs={prefs} onUpdate={onUpdate} />
      <SectionExport userId={userId} />
    </div>
  )
}
