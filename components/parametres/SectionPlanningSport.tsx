'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  CalendarDays,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  Loader2,
  PersonStanding,
  Shuffle,
  Wind,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { upsertSeanceProfil } from '@/lib/db/seance-profils'
import { LABELS_PLANNING, PLANNING_DEFAUT } from '@/lib/planning-sport'
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

const TYPES_PLANNING: TypePlanningJour[] = [
  'muscu_full',
  'muscu_upper',
  'yoga',
  'natation',
  'autre',
  'repos',
]

const JOURS: { cle: keyof PlanningSport; label: string }[] = [
  { cle: 'lundi', label: 'Lundi' },
  { cle: 'mardi', label: 'Mardi' },
  { cle: 'mercredi', label: 'Mercredi' },
  { cle: 'jeudi', label: 'Jeudi' },
  { cle: 'vendredi', label: 'Vendredi' },
  { cle: 'samedi', label: 'Samedi' },
  { cle: 'dimanche', label: 'Dimanche' },
]

const DUREE_MIN_MINUTES = 15
const DUREE_MAX_MINUTES = 240

const OPTIONS_INTENSITE: {
  id: IntensiteEffort
  label: string
  Icon: typeof Wind
}[] = [
  { id: 'legere', label: 'Légère', Icon: Wind },
  { id: 'moderee', label: 'Modérée', Icon: Activity },
  { id: 'intense', label: 'Intense', Icon: Flame },
]

const OPTIONS_TYPE_EFFORT: {
  id: Exclude<TypeEffort, 'aucun'>
  label: string
  Icon: typeof Dumbbell
}[] = [
  { id: 'force', label: 'Force', Icon: Dumbbell },
  { id: 'cardio', label: 'Cardio', Icon: Heart },
  { id: 'mixte', label: 'Mixte', Icon: Shuffle },
  { id: 'mobilite', label: 'Mobilité', Icon: PersonStanding },
]

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
        if (!ok) {
          throw new Error('Impossible d’enregistrer le planning.')
        }
        if (seanceType !== 'repos' && profil) {
          await upsertSeanceProfil(userId, seanceType, profil)
          setProfilsParType((prev) => ({ ...prev, [seanceType]: profil }))
        }
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : 'Erreur lors de l’enregistrement du planning.'
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
    if (profil) {
      setProfilsParType((prev) => ({ ...prev, [seanceType]: profil }))
    }
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
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white/90 p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          <CalendarDays className="size-5 text-amber-600 dark:text-amber-500" aria-hidden />
          Mon planning sport
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Configure ta semaine type — Gaia adaptera les suggestions selon ta phase du cycle
        </p>
      </div>

      {erreur ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {erreur}
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {JOURS.map(({ cle, label }) => {
          const seanceType = planning[cle]
          const enChargement = chargementJour === cle
          const profil = profilPourType(seanceType, profilsParType)
          const afficherEffort = seanceType !== 'repos'

          return (
            <li
              key={cle}
              className="flex flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-50/80 p-3 dark:border-neutral-800 dark:bg-neutral-950/40"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  {enChargement ? (
                    <Loader2
                      className="size-4 shrink-0 animate-spin text-amber-600 dark:text-amber-500"
                      aria-hidden
                    />
                  ) : null}
                  <select
                    value={seanceType}
                    disabled={enChargement}
                    aria-label={`Activité du ${label}`}
                    onChange={(e) => void modifieTypeSeance(cle, e.target.value as TypePlanningJour)}
                    className="w-full min-w-0 rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm disabled:opacity-60 sm:max-w-xs dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
                  >
                    {TYPES_PLANNING.map((t) => {
                      const m = LABELS_PLANNING[t]
                      return (
                        <option key={t} value={t}>
                          {m.emoji} {m.label}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              {afficherEffort ? (
                <div className="space-y-3 border-t border-neutral-200/80 pt-3 dark:border-neutral-800">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-neutral-500 dark:text-neutral-400">Intensité</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {OPTIONS_INTENSITE.map(({ id, label: lib, Icon }) => (
                        <Button
                          key={id}
                          type="button"
                          size="sm"
                          variant={profil.intensite === id ? 'default' : 'outline'}
                          disabled={enChargement}
                          className={cn(
                            'h-auto min-h-9 flex-col gap-0.5 px-1 py-2 text-[11px] sm:flex-row sm:gap-1.5 sm:text-xs',
                            profil.intensite === id &&
                              'border-amber-600 bg-amber-600 text-white hover:bg-amber-700 dark:border-amber-600 dark:bg-amber-600'
                          )}
                          onClick={() =>
                            void modifieProfilEffort(cle, seanceType, { ...profil, intensite: id })
                          }
                        >
                          <Icon className="size-3.5 shrink-0" aria-hidden />
                          {lib}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-neutral-500 dark:text-neutral-400">
                      Type d&apos;effort
                    </Label>
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                      {OPTIONS_TYPE_EFFORT.map(({ id, label: lib, Icon }) => (
                        <Button
                          key={id}
                          type="button"
                          size="sm"
                          variant={profil.type_effort === id ? 'default' : 'outline'}
                          disabled={enChargement}
                          className={cn(
                            'h-auto min-h-9 gap-1 px-1.5 text-[11px] sm:text-xs',
                            profil.type_effort === id &&
                              'border-amber-600 bg-amber-600 text-white hover:bg-amber-700 dark:border-amber-600 dark:bg-amber-600'
                          )}
                          onClick={() =>
                            void modifieProfilEffort(cle, seanceType, { ...profil, type_effort: id })
                          }
                        >
                          <Icon className="size-3.5 shrink-0" aria-hidden />
                          {lib}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`duree-${cle}`}
                      className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400"
                    >
                      <Clock className="size-3.5" aria-hidden />
                      Durée (minutes)
                    </Label>
                    <Input
                      id={`duree-${cle}`}
                      type="number"
                      min={DUREE_MIN_MINUTES}
                      max={DUREE_MAX_MINUTES}
                      step={5}
                      disabled={enChargement}
                      value={profil.duree_min}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10)
                        const duree = Number.isFinite(v)
                          ? Math.min(DUREE_MAX_MINUTES, Math.max(DUREE_MIN_MINUTES, v))
                          : profil.duree_min
                        setProfilsParType((prev) => ({
                          ...prev,
                          [seanceType]: { ...profil, duree_min: duree },
                        }))
                      }}
                      onBlur={(e) => {
                        const v = parseInt(e.target.value, 10)
                        if (!Number.isFinite(v)) return
                        const duree = Math.min(
                          DUREE_MAX_MINUTES,
                          Math.max(DUREE_MIN_MINUTES, v)
                        )
                        void modifieProfilEffort(cle, seanceType, {
                          intensite: profil.intensite,
                          type_effort: profil.type_effort,
                          duree_min: duree,
                        })
                      }}
                      className="max-w-[8rem] bg-white dark:bg-neutral-950"
                    />
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
