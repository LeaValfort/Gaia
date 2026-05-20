'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Footprints, Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { saveMacroProfile, updateMacroProfile } from '@/lib/db/macro-profiles'
import { calculerMB, calculerTDEE } from '@/lib/macro-calculator'
import {
  colonnesLegacyDepuisManuels,
  LIBELLE_INTENSITE,
  macrosManuelsDepuisProfil,
  recapMacrosPlanning,
  seancesUniquesDuPlanning,
  type RecapSeancePlanning,
} from '@/lib/macros-planning-recap'
import { planningEffectif } from '@/lib/macros-du-jour'
import { LABELS_PLANNING } from '@/lib/planning-sport'
import type { MacroProfileSaveData } from '@/lib/db/macro-profiles'
import type {
  MacroProfile,
  MacrosJour,
  MacrosManuelsParSeance,
  MacrosMode,
  NiveauActivite,
  Objectif,
  SeanceProfil,
  TypePlanningJour,
  UserPreferences,
} from '@/types'
import { cn } from '@/lib/utils'

const ETAPES = ['Profil', 'Mode de vie', 'Objectif', 'Résultats'] as const
const SOMMEIL_MIN = 4
const SOMMEIL_MAX = 10
const POIDS_MIN_KG = 30
const POIDS_MAX_KG = 200
const MACROS_MODE_AUTO: MacrosMode = 'auto'
const MACROS_MODE_MANUEL: MacrosMode = 'manuel'
const CLE_MACROS_MODE_LOCAL = 'gaia_macros_mode'

function lireModeLocal(): MacrosMode | null {
  if (typeof window === 'undefined') return null
  const v = window.localStorage.getItem(CLE_MACROS_MODE_LOCAL)
  return v === 'manuel' || v === 'auto' ? v : null
}

function ecrireModeLocal(mode: MacrosMode): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CLE_MACROS_MODE_LOCAL, mode)
}

const DELAI_MOIS_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: '1 mois' },
  { value: 2, label: '2 mois' },
  { value: 3, label: '3 mois' },
  { value: 6, label: '6 mois' },
]

const OPTIONS_ACTIVITE: {
  id: NiveauActivite
  label: string
  description: string
}[] = [
  { id: 'sedentaire', label: 'Sédentaire', description: 'Bureau, peu de marche au quotidien' },
  { id: 'leger', label: 'Légèrement actif', description: '1 à 3 séances légères par semaine' },
  { id: 'modere', label: 'Modérément actif', description: '3 à 5 séances régulières' },
  { id: 'actif', label: 'Très actif', description: '6+ séances ou activité physique soutenue' },
]

const OPTIONS_OBJECTIF: { id: Objectif; label: string; description: string }[] = [
  { id: 'perte_gras', label: 'Perte de gras', description: 'Déficit marqué pour perdre du poids' },
  { id: 'recompo', label: 'Recomposition', description: 'Léger déficit, maintien musculaire' },
  { id: 'maintien', label: 'Maintien', description: 'Stabiliser poids et énergie' },
]

type LigneManuelle = {
  kcal: string
  proteines: string
  glucides: string
  lipides: string
}

interface SectionCalculateurMacrosProps {
  userId: string
  profilInitial: MacroProfile | null
  prefs: UserPreferences
  seanceProfilsInitiales: SeanceProfil[]
  onUpdate: (updates: Partial<Omit<UserPreferences, 'id' | 'user_id'>>) => Promise<boolean>
  onMacrosModeChange: (mode: MacrosMode) => Promise<boolean>
}

function profilPourCalcul(
  userId: string,
  poids: number,
  poidsCibleKg: number | null,
  delaiMois: number | null,
  taille: number,
  age: number,
  objectif: Objectif,
  activite: NiveauActivite,
  sommeil: number,
  pas: number
): MacroProfile {
  return {
    id: '',
    user_id: userId,
    poids_kg: poids,
    poids_cible_kg: poidsCibleKg,
    delai_mois: delaiMois,
    taille_cm: taille,
    age,
    objectif,
    activite,
    sommeil_heures: sommeil,
    pas_quotidiens: pas,
    mb: null,
    tdee: null,
    kcal_base: null,
    proteines_g: null,
    glucides_g: null,
    lipides_g: null,
    kcal_sport: null,
    proteines_sport_g: null,
    glucides_sport_g: null,
    lipides_sport_g: null,
    kcal_repos: null,
    proteines_repos_g: null,
    glucides_repos_g: null,
    lipides_repos_g: null,
    macros_manuels: null,
    updated_at: new Date().toISOString(),
  }
}

function macrosVersLigne(m: MacrosJour): LigneManuelle {
  return {
    kcal: String(m.kcal),
    proteines: String(m.proteines),
    glucides: String(m.glucides),
    lipides: String(m.lipides),
  }
}

function parseLigneManuelle(ligne: LigneManuelle): MacrosJour | null {
  const kcal = parseInt(ligne.kcal, 10)
  const proteines = parseInt(ligne.proteines, 10)
  const glucides = parseInt(ligne.glucides, 10)
  const lipides = parseInt(ligne.lipides, 10)
  if (
    !Number.isFinite(kcal) ||
    !Number.isFinite(proteines) ||
    !Number.isFinite(glucides) ||
    !Number.isFinite(lipides)
  ) {
    return null
  }
  return { kcal, proteines, glucides, lipides }
}

function CardRecapSeance({ item }: { item: RecapSeancePlanning }) {
  const { macros, profilEffort, titre, emoji } = item
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          <span aria-hidden>{emoji}</span> {titre}
        </p>
        <Badge
          variant="outline"
          className="border-amber-600/40 text-[10px] text-amber-800 dark:text-amber-200"
        >
          {LIBELLE_INTENSITE[profilEffort.intensite]}
        </Badge>
      </div>
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-neutral-500 dark:text-neutral-400">Kcal</dt>
          <dd className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">
            {macros.kcal}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-neutral-500 dark:text-neutral-400">Protéines</dt>
          <dd className="font-medium tabular-nums">{macros.proteines} g</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-neutral-500 dark:text-neutral-400">Glucides</dt>
          <dd className="font-medium tabular-nums">{macros.glucides} g</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-neutral-500 dark:text-neutral-400">Lipides</dt>
          <dd className="font-medium tabular-nums">{macros.lipides} g</dd>
        </div>
      </dl>
    </div>
  )
}

export function SectionCalculateurMacros({
  userId,
  profilInitial,
  prefs,
  seanceProfilsInitiales,
  onUpdate,
  onMacrosModeChange,
}: SectionCalculateurMacrosProps) {
  const router = useRouter()
  const planning = useMemo(() => planningEffectif(prefs.planning_sport), [prefs.planning_sport])
  const [mode, setMode] = useState<MacrosMode>(
    prefs.macros_mode ?? lireModeLocal() ?? MACROS_MODE_AUTO
  )
  const [etape, setEtape] = useState(0)
  const [poids, setPoids] = useState('')
  const [poidsCible, setPoidsCible] = useState('')
  const [delaiMois, setDelaiMois] = useState<number | null>(null)
  const [taille, setTaille] = useState('')
  const [age, setAge] = useState('')
  const [activite, setActivite] = useState<NiveauActivite | null>(null)
  const [sommeil, setSommeil] = useState(7)
  const [pas, setPas] = useState('8000')
  const [objectif, setObjectif] = useState<Objectif | null>(null)
  const [chargement, setChargement] = useState(false)
  const [chargementMode, setChargementMode] = useState(false)
  const [chargementCarte, setChargementCarte] = useState<TypePlanningJour | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [lignesManuelles, setLignesManuelles] = useState<Partial<Record<TypePlanningJour, LigneManuelle>>>(
    {}
  )

  useEffect(() => {
    setMode(prefs.macros_mode ?? lireModeLocal() ?? MACROS_MODE_AUTO)
  }, [prefs.macros_mode])

  useEffect(() => {
    if (!profilInitial) return
    setPoids(String(profilInitial.poids_kg))
    setPoidsCible(
      profilInitial.poids_cible_kg != null ? String(profilInitial.poids_cible_kg) : ''
    )
    setDelaiMois(profilInitial.delai_mois)
    setTaille(String(profilInitial.taille_cm))
    setAge(String(profilInitial.age))
    setActivite(profilInitial.activite)
    setSommeil(profilInitial.sommeil_heures)
    setPas(String(profilInitial.pas_quotidiens))
    setObjectif(profilInitial.objectif)
  }, [profilInitial])

  const numeriques = useMemo(() => {
    const p = parseFloat(poids)
    const pc = parseFloat(poidsCible)
    const t = parseFloat(taille)
    const a = parseInt(age, 10)
    const ps = parseInt(pas, 10)
    return {
      poids: Number.isFinite(p) ? p : 0,
      poidsCible: Number.isFinite(pc) ? pc : 0,
      taille: Number.isFinite(t) ? t : 0,
      age: Number.isFinite(a) ? a : 0,
      pas: Number.isFinite(ps) ? ps : 0,
    }
  }, [poids, poidsCible, taille, age, pas])

  const profilCalcule = useMemo(() => {
    if (!activite || !objectif) return null
    if (numeriques.poids <= 0 || numeriques.taille <= 0 || numeriques.age <= 0) return null
    const base = profilPourCalcul(
      userId,
      numeriques.poids,
      numeriques.poidsCible > 0 ? numeriques.poidsCible : null,
      delaiMois,
      numeriques.taille,
      numeriques.age,
      objectif,
      activite,
      sommeil,
      numeriques.pas
    )
    if (profilInitial?.id) return { ...base, id: profilInitial.id }
    return base
  }, [activite, delaiMois, numeriques, objectif, profilInitial?.id, sommeil, userId])

  const recapPlanning = useMemo(() => {
    if (!profilCalcule) return null
    return recapMacrosPlanning(profilCalcule, planning, seanceProfilsInitiales)
  }, [profilCalcule, planning, seanceProfilsInitiales])

  const resultatsAuto = useMemo(() => {
    if (!profilCalcule || !recapPlanning) return null
    return {
      mb: calculerMB(numeriques.poids, numeriques.taille, numeriques.age),
      tdee: calculerTDEE(
        calculerMB(numeriques.poids, numeriques.taille, numeriques.age),
        activite!,
        numeriques.pas
      ),
      recap: recapPlanning,
    }
  }, [activite, numeriques, profilCalcule, recapPlanning])

  const typesPlanning = useMemo(() => seancesUniquesDuPlanning(planning), [planning])

  const initLignesManuelles = useCallback(() => {
    const stocke = macrosManuelsDepuisProfil(profilInitial)
    const next: Partial<Record<TypePlanningJour, LigneManuelle>> = {}
    for (const t of typesPlanning) {
      if (stocke[t]) {
        next[t] = macrosVersLigne(stocke[t]!)
        continue
      }
      if (profilCalcule && recapPlanning) {
        const card = recapPlanning.find((c) => c.seanceType === t)
        if (card) {
          next[t] = macrosVersLigne(card.macros)
          continue
        }
      }
      next[t] = { kcal: '', proteines: '', glucides: '', lipides: '' }
    }
    setLignesManuelles(next)
  }, [profilInitial, profilCalcule, recapPlanning, typesPlanning])

  useEffect(() => {
    if (mode === MACROS_MODE_MANUEL) initLignesManuelles()
  }, [mode, initLignesManuelles])

  async function changerMode(nouveau: MacrosMode) {
    if (nouveau === mode || chargementMode) return
    setErreur(null)
    const precedent = mode
    setMode(nouveau)
    setChargementMode(true)
    const ok = await onMacrosModeChange(nouveau)
    if (!ok) {
      ecrireModeLocal(nouveau)
      setMode(nouveau)
      toast.warning(
        'Mode affiché en local uniquement. Exécute supabase/RUN_MACROS_MIGRATIONS.sql dans Supabase pour enregistrer en base.'
      )
    } else {
      ecrireModeLocal(nouveau)
    }
    setChargementMode(false)
  }

  function reinitialiser() {
    setEtape(0)
    setPoids('')
    setPoidsCible('')
    setDelaiMois(null)
    setTaille('')
    setAge('')
    setActivite(null)
    setSommeil(7)
    setPas('8000')
    setObjectif(null)
    setErreur(null)
  }

  function validerEtapeCourante(): boolean {
    setErreur(null)
    if (etape === 0) {
      if (numeriques.poids <= 0 || numeriques.taille <= 0 || numeriques.age <= 0) {
        setErreur('Renseigne un poids, une taille et un âge valides.')
        return false
      }
      if (numeriques.poidsCible <= 0) {
        setErreur('Indique un poids cible valide.')
        return false
      }
      if (delaiMois == null) {
        setErreur('Choisis un délai pour atteindre ton poids cible.')
        return false
      }
    }
    if (etape === 1) {
      if (!activite) {
        setErreur('Choisis ton niveau d’activité.')
        return false
      }
      if (numeriques.pas < 0) {
        setErreur('Indique un nombre de pas valide.')
        return false
      }
    }
    if (etape === 2 && !objectif) {
      setErreur('Choisis un objectif.')
      return false
    }
    return true
  }

  function etapeSuivante() {
    if (!validerEtapeCourante()) return
    setEtape((e) => Math.min(e + 1, ETAPES.length - 1))
  }

  function etapePrecedente() {
    setErreur(null)
    setEtape((e) => Math.max(e - 1, 0))
  }

  async function appliquerMacros() {
    if (!resultatsAuto || !activite || !objectif || !profilCalcule) {
      setErreur('Complète le questionnaire avant d’appliquer.')
      return
    }

    setChargement(true)
    setErreur(null)
    try {
      const macrosManuels: MacrosManuelsParSeance = {}
      for (const card of resultatsAuto.recap) {
        macrosManuels[card.seanceType] = card.macros
      }

      const data: MacroProfileSaveData = {
        poids_kg: numeriques.poids,
        poids_cible_kg: numeriques.poidsCible,
        delai_mois: delaiMois,
        taille_cm: numeriques.taille,
        age: numeriques.age,
        objectif,
        activite,
        sommeil_heures: sommeil,
        pas_quotidiens: numeriques.pas,
        mb: resultatsAuto.mb,
        tdee: resultatsAuto.tdee,
        macros_manuels: macrosManuels,
        ...colonnesLegacyDepuisManuels(macrosManuels),
      }

      await saveMacroProfile(userId, data)
      await onMacrosModeChange(MACROS_MODE_AUTO)

      toast.success('Macros appliquées')
      router.refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur lors de l’enregistrement.'
      setErreur(msg)
      toast.error(msg)
    } finally {
      setChargement(false)
    }
  }

  async function sauvegarderCarteManuelle(seanceType: TypePlanningJour) {
    const ligne = lignesManuelles[seanceType]
    if (!ligne) return
    const macros = parseLigneManuelle(ligne)
    if (!macros) {
      setErreur('Renseigne des valeurs numériques valides pour cette séance.')
      toast.error('Valeurs invalides')
      return
    }

    setChargementCarte(seanceType)
    setErreur(null)
    try {
      if (!profilInitial) {
        throw new Error(
          'Crée d’abord ton profil via le calculateur automatique (étapes 1 à 3), puis reviens en saisie manuelle.'
        )
      }

      const existant = macrosManuelsDepuisProfil(profilInitial)
      const macrosManuels: MacrosManuelsParSeance = {
        ...existant,
        [seanceType]: macros,
      }

      await updateMacroProfile(userId, {
        macros_manuels: macrosManuels,
        ...colonnesLegacyDepuisManuels(macrosManuels),
      })

      toast.success('Macros enregistrées')
      router.refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur lors de l’enregistrement.'
      setErreur(msg)
      toast.error(msg)
    } finally {
      setChargementCarte(null)
    }
  }

  function majLigneManuelle(seanceType: TypePlanningJour, champ: keyof LigneManuelle, valeur: string) {
    setLignesManuelles((prev) => ({
      ...prev,
      [seanceType]: {
        kcal: prev[seanceType]?.kcal ?? '',
        proteines: prev[seanceType]?.proteines ?? '',
        glucides: prev[seanceType]?.glucides ?? '',
        lipides: prev[seanceType]?.lipides ?? '',
        [champ]: valeur,
      },
    }))
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div>
          <CardTitle className="text-base">Calculateur de macros</CardTitle>
          <CardDescription>
            Questionnaire personnalisé (Mifflin-St Jeor) ou saisie manuelle par séance.
          </CardDescription>
        </div>
        <div
          className="inline-flex w-full max-w-md rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-800"
          role="group"
          aria-label="Mode de saisie des macros"
        >
          <Button
            type="button"
            size="sm"
            variant={mode === MACROS_MODE_AUTO ? 'default' : 'ghost'}
            className={cn(
              'flex-1 rounded-md',
              mode === MACROS_MODE_AUTO &&
                'bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600'
            )}
            disabled={chargement}
            onClick={() => void changerMode(MACROS_MODE_AUTO)}
          >
            Calculateur automatique
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === MACROS_MODE_MANUEL ? 'default' : 'ghost'}
            className={cn(
              'flex-1 rounded-md',
              mode === MACROS_MODE_MANUEL &&
                'bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600'
            )}
            disabled={chargement || chargementMode}
            onClick={() => void changerMode(MACROS_MODE_MANUEL)}
          >
            Saisie manuelle
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {erreur ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          >
            {erreur}
          </p>
        ) : null}

        {mode === MACROS_MODE_MANUEL ? (
          <div className="space-y-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Saisis tes objectifs pour chaque type de séance de ton planning. Les jours
              correspondants utiliseront ces valeurs.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {typesPlanning.map((seanceType) => {
                const meta = recapPlanning?.find((c) => c.seanceType === seanceType)
                const ligne = lignesManuelles[seanceType]
                const enSave = chargementCarte === seanceType
                if (!ligne) return null
                return (
                  <div
                    key={seanceType}
                    className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50/80 p-3 dark:border-neutral-800 dark:bg-neutral-950/40"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                        {LABELS_PLANNING[seanceType].emoji}{' '}
                        {meta?.titre ?? LABELS_PLANNING[seanceType].label}
                      </p>
                      {meta ? (
                        <Badge variant="outline" className="text-[10px]">
                          {LIBELLE_INTENSITE[meta.profilEffort.intensite]}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          ['kcal', 'Kcal'],
                          ['proteines', 'Prot. (g)'],
                          ['glucides', 'Gluc. (g)'],
                          ['lipides', 'Lip. (g)'],
                        ] as const
                      ).map(([champ, lib]) => (
                        <div key={champ} className="space-y-1">
                          <Label className="text-[10px] text-neutral-500">{lib}</Label>
                          <Input
                            type="number"
                            min={0}
                            disabled={enSave}
                            value={ligne[champ]}
                            onChange={(e) => majLigneManuelle(seanceType, champ, e.target.value)}
                            className="h-8 bg-white dark:bg-neutral-950"
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="w-full bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600"
                      disabled={enSave}
                      onClick={() => void sauvegarderCarteManuelle(seanceType)}
                    >
                      {enSave ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Enregistrement…
                        </>
                      ) : (
                        'Sauvegarder'
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <>
            <nav aria-label="Étapes du calculateur" className="flex gap-1">
              {ETAPES.map((label, i) => (
                <div
                  key={label}
                  className={cn(
                    'flex-1 rounded-md px-1 py-2 text-center text-[10px] font-medium sm:text-xs',
                    i === etape
                      ? 'bg-amber-600 text-white dark:bg-amber-600'
                      : i < etape
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200'
                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                  )}
                >
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </div>
              ))}
            </nav>

            {etape === 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="macro-poids">Poids actuel (kg)</Label>
                  <Input
                    id="macro-poids"
                    type="number"
                    min={POIDS_MIN_KG}
                    max={POIDS_MAX_KG}
                    step={0.1}
                    value={poids}
                    onChange={(e) => setPoids(e.target.value)}
                    className="bg-white dark:bg-neutral-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="macro-poids-cible">Poids cible (kg)</Label>
                  <Input
                    id="macro-poids-cible"
                    type="number"
                    min={POIDS_MIN_KG}
                    max={POIDS_MAX_KG}
                    step={0.1}
                    value={poidsCible}
                    onChange={(e) => setPoidsCible(e.target.value)}
                    className="bg-white dark:bg-neutral-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="macro-delai">Délai souhaité</Label>
                  <select
                    id="macro-delai"
                    value={delaiMois ?? ''}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10)
                      setDelaiMois(Number.isFinite(v) ? v : null)
                    }}
                    className={cn(
                      'flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-xs',
                      'focus-visible:border-amber-600 focus-visible:ring-amber-600/30 focus-visible:ring-[3px] outline-none',
                      'dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50'
                    )}
                  >
                    <option value="" disabled>
                      Choisir…
                    </option>
                    {DELAI_MOIS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="macro-taille">Taille (cm)</Label>
                  <Input
                    id="macro-taille"
                    type="number"
                    min={120}
                    max={220}
                    value={taille}
                    onChange={(e) => setTaille(e.target.value)}
                    className="bg-white dark:bg-neutral-950"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2 sm:max-w-[50%]">
                  <Label htmlFor="macro-age">Âge</Label>
                  <Input
                    id="macro-age"
                    type="number"
                    min={14}
                    max={99}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="bg-white dark:bg-neutral-950"
                  />
                </div>
              </div>
            ) : null}

            {etape === 1 ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Niveau d&apos;activité général</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {OPTIONS_ACTIVITE.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setActivite(opt.id)}
                        className={cn(
                          'rounded-xl border p-3 text-left transition-colors',
                          activite === opt.id
                            ? 'border-amber-600 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/30'
                            : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700'
                        )}
                      >
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                          {opt.label}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                          {opt.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <Label htmlFor="macro-sommeil">Qualité du sommeil</Label>
                    <span className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                      {sommeil} h / nuit
                    </span>
                  </div>
                  <Slider
                    id="macro-sommeil"
                    min={SOMMEIL_MIN}
                    max={SOMMEIL_MAX}
                    value={sommeil}
                    onValueChange={setSommeil}
                    aria-label="Heures de sommeil par nuit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="macro-pas" className="flex items-center gap-1.5">
                    <Footprints className="size-3.5" aria-hidden />
                    Pas quotidiens moyens
                  </Label>
                  <Input
                    id="macro-pas"
                    type="number"
                    min={0}
                    max={50000}
                    step={500}
                    value={pas}
                    onChange={(e) => setPas(e.target.value)}
                    className="bg-white dark:bg-neutral-950"
                  />
                </div>
              </div>
            ) : null}

            {etape === 2 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {OPTIONS_OBJECTIF.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setObjectif(opt.id)}
                    className={cn(
                      'rounded-xl border p-3 text-left transition-colors',
                      objectif === opt.id
                        ? 'border-amber-600 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/30'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700'
                    )}
                  >
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {opt.description}
                    </p>
                  </button>
                ))}
              </div>
            ) : null}

            {etape === 3 && resultatsAuto ? (
              <div className="space-y-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  MB estimé : <strong>{resultatsAuto.mb}</strong> kcal · TDEE :{' '}
                  <strong>{resultatsAuto.tdee}</strong> kcal — selon ton planning sport
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {resultatsAuto.recap.map((item) => (
                    <CardRecapSeance key={item.seanceType} item={item} />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-1">
              {etape > 0 && etape < 3 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={etapePrecedente}
                  disabled={chargement}
                >
                  <ChevronLeft className="size-4" />
                  Précédent
                </Button>
              ) : null}

              {etape < 2 ? (
                <Button
                  type="button"
                  size="sm"
                  className="ml-auto bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600"
                  onClick={etapeSuivante}
                >
                  Suivant
                  <ChevronRight className="size-4" />
                </Button>
              ) : null}

              {etape === 2 ? (
                <Button
                  type="button"
                  size="sm"
                  className="ml-auto bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600"
                  onClick={() => {
                    if (validerEtapeCourante()) setEtape(3)
                  }}
                >
                  Voir les résultats
                  <ChevronRight className="size-4" />
                </Button>
              ) : null}

              {etape === 3 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={reinitialiser}
                    disabled={chargement}
                  >
                    <RotateCcw className="size-4" />
                    Recalculer
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="ml-auto bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600"
                    onClick={() => void appliquerMacros()}
                    disabled={chargement || !resultatsAuto}
                  >
                    {chargement ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Enregistrement…
                      </>
                    ) : (
                      'Appliquer ces macros'
                    )}
                  </Button>
                </>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
