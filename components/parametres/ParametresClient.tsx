'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  BookOpen,
  Calendar,
  Database,
  Moon,
  RotateCcw,
  Settings,
  ShoppingBasket,
  Utensils,
} from 'lucide-react'
import { AccordeonSection } from '@/components/parametres/AccordeonSection'
import { SectionAlimentation } from '@/components/parametres/SectionAlimentation'
import { SectionBibliographie } from '@/components/parametres/SectionBibliographie'
import { SectionApp } from '@/components/parametres/SectionApp'
import { SectionCalculateurMacros } from '@/components/parametres/SectionCalculateurMacros'
import { SectionDonneesCompte } from '@/components/parametres/SectionDonneesCompte'
import { SectionEnseignes } from '@/components/parametres/SectionEnseignes'
import { SectionMonCycle } from '@/components/parametres/SectionMonCycle'
import { SectionPlanningSportCalendrier } from '@/components/parametres/SectionPlanningSportCalendrier'
import { SectionPourcentagesGaia } from '@/components/parametres/SectionPourcentagesGaia'
import { SectionTachesRecurrentes } from '@/components/parametres/SectionTachesRecurrentes'
import { setMacrosMode, updateUserPreferences } from '@/lib/db/parametres'
import type { EnseigneDB, MacroProfile, MacrosMode, RecurringTodo, SeanceProfil, Source, UserPreferences } from '@/types'

type SectionId = 'cycle' | 'sport' | 'nutrition' | 'enseignes' | 'taches' | 'app' | 'bibliographie' | 'donnees'

interface ParametresClientProps {
  prefsInitiales: UserPreferences
  userId: string
  recurringTodosInitiales: RecurringTodo[]
  macroProfilInitial: MacroProfile | null
  seanceProfilsInitiales: SeanceProfil[]
  sourcesInitiales: Source[]
  enseignesInitiales: EnseigneDB[]
  messageUrl?: string
}

export function ParametresClient({
  prefsInitiales,
  userId,
  recurringTodosInitiales,
  macroProfilInitial,
  seanceProfilsInitiales,
  sourcesInitiales,
  enseignesInitiales,
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
          <SectionPlanningSportCalendrier userId={userId} macrosMode={prefs.macros_mode ?? 'auto'} />
          <p className="mt-4 text-xs text-muted-foreground">
            L&apos;intensité de chaque programme (pour les macros) se règle maintenant sur la page Sport, à la création ou depuis l&apos;onglet du programme concerné.
            {(prefs.macros_mode ?? 'auto') === 'auto'
              ? ' En mode Auto, un programme précis (pas « libre ») est requis pour chaque séance planifiée afin de pouvoir calculer les macros à l’avance.'
              : ''}
          </p>
          <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pourcentages « Séance Gaia »
            </p>
            <SectionPourcentagesGaia prefs={prefs} onUpdate={onUpdate} />
          </div>
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
          id="enseignes"
          titre="Enseignes de courses"
          icone={ShoppingBasket}
          ouvert={sectionOuverte === 'enseignes'}
          onToggle={() => toggleSection('enseignes')}
        >
          <SectionEnseignes userId={userId} enseignesInitiales={enseignesInitiales} />
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
          id="bibliographie"
          titre="Bibliographie"
          icone={BookOpen}
          ouvert={sectionOuverte === 'bibliographie'}
          onToggle={() => toggleSection('bibliographie')}
        >
          <SectionBibliographie sources={sourcesInitiales} />
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
