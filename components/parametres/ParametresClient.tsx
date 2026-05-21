'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Calendar,
  Database,
  Moon,
  RotateCcw,
  Settings,
  Utensils,
} from 'lucide-react'
import { AccordeonSection } from '@/components/parametres/AccordeonSection'
import { SectionAlimentation } from '@/components/parametres/SectionAlimentation'
import { SectionApp } from '@/components/parametres/SectionApp'
import { SectionCalculateurMacros } from '@/components/parametres/SectionCalculateurMacros'
import { SectionDonneesCompte } from '@/components/parametres/SectionDonneesCompte'
import { SectionMonCycle } from '@/components/parametres/SectionMonCycle'
import { SectionPlanningSport } from '@/components/parametres/SectionPlanningSport'
import { SectionTachesRecurrentes } from '@/components/parametres/SectionTachesRecurrentes'
import { setMacrosMode, updateUserPreferences } from '@/lib/db/parametres'
import type { MacroProfile, MacrosMode, RecurringTodo, SeanceProfil, UserPreferences } from '@/types'

type SectionId = 'cycle' | 'sport' | 'nutrition' | 'taches' | 'app' | 'donnees'

interface ParametresClientProps {
  prefsInitiales: UserPreferences
  userId: string
  recurringTodosInitiales: RecurringTodo[]
  macroProfilInitial: MacroProfile | null
  seanceProfilsInitiales: SeanceProfil[]
  messageUrl?: string
}

export function ParametresClient({
  prefsInitiales,
  userId,
  recurringTodosInitiales,
  macroProfilInitial,
  seanceProfilsInitiales,
  messageUrl,
}: ParametresClientProps) {
  const router = useRouter()
  const [prefs, setPrefs] = useState(prefsInitiales)
  const [sectionOuverte, setSectionOuverte] = useState<SectionId | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    setPrefs(prefsInitiales)
  }, [prefsInitiales])

  useEffect(() => {
    if (messageUrl === 'active-le-mode-cycle-pour-acceder-ici') {
      toast.info('Active le mode « Avec cycle » dans les paramètres pour accéder à la page Cycle.')
      setSectionOuverte('cycle')
    }
  }, [messageUrl])

  const toggleSection = useCallback((id: SectionId) => {
    setSectionOuverte((prev) => (prev === id ? null : id))
  }, [])

  const onUpdate = useCallback(
    async (updates: Partial<Omit<UserPreferences, 'id' | 'user_id'>>) => {
      const prev = prefs
      setPrefs((p) => ({ ...p, ...updates }))
      setErreur(null)
      const ok = await updateUserPreferences(updates)
      if (ok) {
        router.refresh()
      } else {
        setPrefs(prev)
        setErreur('Impossible d’enregistrer. Réessaie.')
        toast.error('Impossible d’enregistrer. Réessaie.')
      }
      return ok
    },
    [prefs, router]
  )

  const onMacrosModeChange = useCallback(
    async (mode: MacrosMode): Promise<boolean> => {
      const prev = prefs.macros_mode ?? 'auto'
      setPrefs((p) => ({ ...p, macros_mode: mode }))
      const result = await setMacrosMode(mode)
      if (!result.ok) {
        setPrefs((p) => ({ ...p, macros_mode: prev }))
        const msg =
          result.error ??
          'Impossible d’enregistrer le mode. Exécute supabase/RUN_MACROS_MIGRATIONS.sql dans Supabase.'
        toast.error(msg)
        return false
      }
      return true
    },
    [prefs.macros_mode]
  )

  return (
    <div className="mx-auto w-full max-w-lg">
      {erreur ? (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {erreur}
        </p>
      ) : null}

      <div className="rounded-xl border border-neutral-200 bg-white/60 dark:border-neutral-800 dark:bg-neutral-900/40">
        <AccordeonSection
          id="cycle"
          titre="Mon cycle"
          icone={Moon}
          ouvert={sectionOuverte === 'cycle'}
          onToggle={() => toggleSection('cycle')}
        >
          <SectionMonCycle prefs={prefs} onUpdate={onUpdate} />
        </AccordeonSection>

        <AccordeonSection
          id="sport"
          titre="Planning sport"
          icone={Calendar}
          ouvert={sectionOuverte === 'sport'}
          onToggle={() => toggleSection('sport')}
        >
          <SectionPlanningSport
            prefs={prefs}
            userId={userId}
            seanceProfilsInitiales={seanceProfilsInitiales}
            onUpdate={onUpdate}
          />
        </AccordeonSection>

        <AccordeonSection
          id="nutrition"
          titre="Nutrition & macros"
          icone={Utensils}
          ouvert={sectionOuverte === 'nutrition'}
          onToggle={() => toggleSection('nutrition')}
        >
          <SectionAlimentation prefs={prefs} onUpdate={onUpdate} />
          {prefs.suivi_calorique !== false ? (
            <SectionCalculateurMacros
              userId={userId}
              profilInitial={macroProfilInitial}
              prefs={prefs}
              seanceProfilsInitiales={seanceProfilsInitiales}
              onUpdate={onUpdate}
              onMacrosModeChange={onMacrosModeChange}
            />
          ) : null}
        </AccordeonSection>

        <AccordeonSection
          id="taches"
          titre="Tâches récurrentes"
          icone={RotateCcw}
          ouvert={sectionOuverte === 'taches'}
          onToggle={() => toggleSection('taches')}
        >
          <SectionTachesRecurrentes userId={userId} todosInitiales={recurringTodosInitiales} />
        </AccordeonSection>

        <AccordeonSection
          id="app"
          titre="Application"
          icone={Settings}
          ouvert={sectionOuverte === 'app'}
          onToggle={() => toggleSection('app')}
        >
          <SectionApp prefs={prefs} onUpdate={onUpdate} />
        </AccordeonSection>

        <AccordeonSection
          id="donnees"
          titre="Données & compte"
          icone={Database}
          ouvert={sectionOuverte === 'donnees'}
          onToggle={() => toggleSection('donnees')}
        >
          <SectionDonneesCompte userId={userId} />
        </AccordeonSection>
      </div>
    </div>
  )
}
