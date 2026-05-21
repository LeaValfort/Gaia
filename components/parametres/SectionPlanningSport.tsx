'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { upsertSeanceProfil } from '@/lib/db/seance-profils'
import { PLANNING_DEFAUT } from '@/lib/planning-sport'
import {
  PROFILS_DEFAUT,
  type IntensiteEffort,
  type PlanningSport,
  type ProfilEffort,
  type SeanceProfil,
  type TypeEffort,
  type TypePlanningJour,
  type UserPreferences,
} from '@/types'
import { cn } from '@/lib/utils'

const SEANCES: { id: TypePlanningJour; label: string }[] = [
  { id: 'repos', label: 'Repos' },
  { id: 'muscu_full', label: 'Full body' },
  { id: 'muscu_upper', label: 'Upper' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'natation', label: 'Natation' },
  { id: 'autre', label: 'Autre' },
]

const JOURS: { cle: keyof PlanningSport; label: string }[] = [
  { cle: 'lundi', label: 'Lun' },
  { cle: 'mardi', label: 'Mar' },
  { cle: 'mercredi', label: 'Mer' },
  { cle: 'jeudi', label: 'Jeu' },
  { cle: 'vendredi', label: 'Ven' },
  { cle: 'samedi', label: 'Sam' },
  { cle: 'dimanche', label: 'Dim' },
]

const INTENSITES: { id: IntensiteEffort; label: string }[] = [
  { id: 'legere', label: 'Légère' },
  { id: 'moderee', label: 'Modérée' },
  { id: 'intense', label: 'Intense' },
]

const EFFORTS: { id: Exclude<TypeEffort, 'aucun'>; label: string }[] = [
  { id: 'force', label: 'Force' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'mixte', label: 'Mixte' },
  { id: 'mobilite', label: 'Mobilité' },
]

const DUREE_MIN = 15
const DUREE_MAX = 240

const PROFIL_AUTRE_DEFAUT: ProfilEffort = {
  intensite: 'moderee',
  type_effort: 'mixte',
  duree_min: 60,
}

function planningEffectif(prefs: UserPreferences): PlanningSport {
  const d = PLANNING_DEFAUT
  const p = prefs.planning_sport
  if (!p) return d
  return {
    lundi: p.lundi ?? d.lundi,
    mardi: p.mardi ?? d.mardi,
    mercredi: p.mercredi ?? d.mercredi,
    jeudi: p.jeudi ?? d.jeudi,
    vendredi: p.vendredi ?? d.vendredi,
    samedi: p.samedi ?? d.samedi,
    dimanche: p.dimanche ?? d.dimanche,
  }
}

function profilDefautPourType(seanceType: TypePlanningJour): ProfilEffort {
  const defaut = PROFILS_DEFAUT[seanceType]
  if (defaut) return { ...defaut }
  if (seanceType === 'autre') return { ...PROFIL_AUTRE_DEFAUT }
  return { ...PROFILS_DEFAUT.repos }
}

function profilsDepuisSeances(seances: SeanceProfil[]): Record<string, ProfilEffort> {
  const map: Record<string, ProfilEffort> = {}
  for (const s of seances) {
    map[s.seance_type] = {
      intensite: s.intensite,
      type_effort: s.type_effort,
      duree_min: s.duree_min,
    }
  }
  return map
}

function profilPourType(
  seanceType: TypePlanningJour,
  profilsParType: Record<string, ProfilEffort>
): ProfilEffort {
  const perso = profilsParType[seanceType]
  if (perso) return { ...perso }
  return profilDefautPourType(seanceType)
}

export interface SectionPlanningSportProps {
  prefs: UserPreferences
  userId: string
  seanceProfilsInitiales: SeanceProfil[]
  onUpdate: (updates: Partial<UserPreferences>) => Promise<boolean>
}

export function SectionPlanningSport({
  prefs,
  userId,
  seanceProfilsInitiales,
  onUpdate,
}: SectionPlanningSportProps) {
  const planning = useMemo(() => planningEffectif(prefs), [prefs])
  const [profilsParType, setProfilsParType] = useState<Record<string, ProfilEffort>>(() =>
    profilsDepuisSeances(seanceProfilsInitiales)
  )
  const [chargementJour, setChargementJour] = useState<keyof PlanningSport | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    setProfilsParType(profilsDepuisSeances(seanceProfilsInitiales))
  }, [seanceProfilsInitiales])

  const persisterJour = useCallback(
    async (
      jourCle: keyof PlanningSport,
      nextPlanning: PlanningSport,
      seanceType: TypePlanningJour,
      profil: ProfilEffort | null
    ) => {
      setChargementJour(jourCle)
      setErreur(null)
      try {
        const ok = await onUpdate({ planning_sport: nextPlanning })
        if (!ok) throw new Error('Impossible d’enregistrer le planning.')
        if (seanceType !== 'repos' && profil) {
          await upsertSeanceProfil(userId, seanceType, profil)
          setProfilsParType((prev) => ({ ...prev, [seanceType]: profil }))
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erreur lors de l’enregistrement.'
        setErreur(msg)
        toast.error(msg)
      } finally {
        setChargementJour(null)
      }
    },
    [onUpdate, userId]
  )

  async function modifieTypeSeance(jourCle: keyof PlanningSport, seanceType: TypePlanningJour) {
    const nextPlanning: PlanningSport = { ...planning, [jourCle]: seanceType }
    const profil = seanceType === 'repos' ? null : profilDefautPourType(seanceType)
    if (profil) setProfilsParType((prev) => ({ ...prev, [seanceType]: profil }))
    await persisterJour(jourCle, nextPlanning, seanceType, profil)
  }

  async function modifieProfilEffort(
    jourCle: keyof PlanningSport,
    seanceType: TypePlanningJour,
    profil: ProfilEffort
  ) {
    setProfilsParType((prev) => ({ ...prev, [seanceType]: profil }))
    await persisterJour(jourCle, planning, seanceType, profil)
  }

  return (
    <div className="space-y-4">
      {erreur ? (
        <p role="alert" className="text-sm text-destructive">
          {erreur}
        </p>
      ) : null}

      <ul className="flex flex-col gap-4">
        {JOURS.map(({ cle, label }) => {
          const seanceType = planning[cle]
          const enChargement = chargementJour === cle
          const profil = profilPourType(seanceType, profilsParType)
          const afficherEffort = seanceType !== 'repos'

          return (
            <li key={cle} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-sm font-medium text-neutral-800 dark:text-neutral-100">
                  {label}
                </span>
                {enChargement ? (
                  <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
                ) : null}
                <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                  {SEANCES.map(({ id, label: lib }) => (
                    <button
                      key={id}
                      type="button"
                      disabled={enChargement}
                      onClick={() => void modifieTypeSeance(cle, id)}
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors',
                        seanceType === id
                          ? 'border-amber-600 bg-amber-600 text-white dark:border-amber-500 dark:bg-amber-600'
                          : 'border-neutral-200 bg-transparent text-muted-foreground hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600'
                      )}
                    >
                      {lib}
                    </button>
                  ))}
                </div>
              </div>

              {afficherEffort ? (
                <div className="space-y-3 pl-10">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Intensité</p>
                    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Intensité">
                      {INTENSITES.map(({ id, label: lib }) => (
                        <button
                          key={id}
                          type="button"
                          disabled={enChargement}
                          onClick={() =>
                            void modifieProfilEffort(cle, seanceType, { ...profil, intensite: id })
                          }
                          className={cn(
                            'rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                            profil.intensite === id
                              ? 'border-amber-600 bg-amber-600 text-white'
                              : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600'
                          )}
                        >
                          {lib}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Effort</p>
                    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Type d'effort">
                      {EFFORTS.map(({ id, label: lib }) => (
                        <button
                          key={id}
                          type="button"
                          disabled={enChargement}
                          onClick={() =>
                            void modifieProfilEffort(cle, seanceType, { ...profil, type_effort: id })
                          }
                          className={cn(
                            'rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                            profil.type_effort === id
                              ? 'border-amber-600 bg-amber-600 text-white'
                              : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600'
                          )}
                        >
                          {lib}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={DUREE_MIN}
                      max={DUREE_MAX}
                      step={5}
                      disabled={enChargement}
                      value={profil.duree_min}
                      aria-label={`Durée ${label} en minutes`}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10)
                        const duree = Number.isFinite(v)
                          ? Math.min(DUREE_MAX, Math.max(DUREE_MIN, v))
                          : profil.duree_min
                        setProfilsParType((prev) => ({
                          ...prev,
                          [seanceType]: { ...profil, duree_min: duree },
                        }))
                      }}
                      onBlur={(e) => {
                        const v = parseInt(e.target.value, 10)
                        if (!Number.isFinite(v)) return
                        const duree = Math.min(DUREE_MAX, Math.max(DUREE_MIN, v))
                        void modifieProfilEffort(cle, seanceType, {
                          intensite: profil.intensite,
                          type_effort: profil.type_effort,
                          duree_min: duree,
                        })
                      }}
                      className="h-9 w-16 px-2 text-center text-sm tabular-nums dark:bg-neutral-950"
                    />
                    <span className="text-xs text-muted-foreground">min</span>
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
