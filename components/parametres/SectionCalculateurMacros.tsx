'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Footprints, Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { saveMacroProfile } from '@/lib/db/macro-profiles'
import { calculerMB, calculerMacrosJour, calculerTDEE } from '@/lib/macro-calculator'
import type { MacroProfileSaveData } from '@/lib/db/macro-profiles'
import type {
  MacroProfile,
  MacrosJour,
  NiveauActivite,
  Objectif,
  Phase,
} from '@/types'
import { cn } from '@/lib/utils'

const ETAPES = ['Profil', 'Mode de vie', 'Objectif', 'Résultats'] as const
const SOMMEIL_MIN = 4
const SOMMEIL_MAX = 10
const POIDS_MIN_KG = 30
const POIDS_MAX_KG = 200

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

interface SectionCalculateurMacrosProps {
  userId: string
  profilInitial: MacroProfile | null
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
    updated_at: new Date().toISOString(),
  }
}

function ColonneMacros({ titre, macros }: { titre: string; macros: MacrosJour }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {titre}
      </p>
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-neutral-500 dark:text-neutral-400">Kcal</dt>
          <dd className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">{macros.kcal}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-neutral-500 dark:text-neutral-400">Prot.</dt>
          <dd className="font-medium tabular-nums">{macros.proteines} g</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-neutral-500 dark:text-neutral-400">Gluc.</dt>
          <dd className="font-medium tabular-nums">{macros.glucides} g</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-neutral-500 dark:text-neutral-400">Lip.</dt>
          <dd className="font-medium tabular-nums">{macros.lipides} g</dd>
        </div>
      </dl>
    </div>
  )
}

export function SectionCalculateurMacros({
  userId,
  profilInitial,
}: SectionCalculateurMacrosProps) {
  const router = useRouter()
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
  const [erreur, setErreur] = useState<string | null>(null)

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

  const resultats = useMemo(() => {
    if (!activite || !objectif) return null
    if (numeriques.poids <= 0 || numeriques.taille <= 0 || numeriques.age <= 0) return null

    const profil = profilPourCalcul(
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

    const phaseSport: Phase = 'folliculaire'
    const phaseRepos: Phase = 'folliculaire'
    const phaseRegles: Phase = 'menstruation'

    return {
      mb: calculerMB(numeriques.poids, numeriques.taille, numeriques.age),
      tdee: calculerTDEE(
        calculerMB(numeriques.poids, numeriques.taille, numeriques.age),
        activite,
        numeriques.pas
      ),
      sport: calculerMacrosJour(profil, phaseSport, 'sport'),
      repos: calculerMacrosJour(profil, phaseRepos, 'repos'),
      regles: calculerMacrosJour(profil, phaseRegles, 'cycle'),
    }
  }, [activite, delaiMois, objectif, numeriques, sommeil, userId])

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
    if (!resultats || !activite || !objectif) {
      setErreur('Complète le questionnaire avant d’appliquer.')
      return
    }

    setChargement(true)
    setErreur(null)
    try {
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
        mb: resultats.mb,
        tdee: resultats.tdee,
        kcal_base: resultats.regles.kcal,
        proteines_g: resultats.regles.proteines,
        glucides_g: resultats.regles.glucides,
        lipides_g: resultats.regles.lipides,
        kcal_sport: resultats.sport.kcal,
        proteines_sport_g: resultats.sport.proteines,
        glucides_sport_g: resultats.sport.glucides,
        lipides_sport_g: resultats.sport.lipides,
        kcal_repos: resultats.repos.kcal,
        proteines_repos_g: resultats.repos.proteines,
        glucides_repos_g: resultats.repos.glucides,
        lipides_repos_g: resultats.repos.lipides,
      }

      await saveMacroProfile(userId, data)

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Calculateur de macros</CardTitle>
        <CardDescription>
          Questionnaire personnalisé (Mifflin-St Jeor) pour tes objectifs journaliers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
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

        {erreur ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {erreur}
          </p>
        ) : null}

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
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>{SOMMEIL_MIN} h</span>
                <span>{SOMMEIL_MAX} h</span>
              </div>
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
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Disponible dans Santé sur iPhone
              </p>
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
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{opt.label}</p>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{opt.description}</p>
              </button>
            ))}
          </div>
        ) : null}

        {etape === 3 && resultats ? (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              MB estimé : <strong>{resultats.mb}</strong> kcal · TDEE :{' '}
              <strong>{resultats.tdee}</strong> kcal
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ColonneMacros titre="Jour de sport" macros={resultats.sport} />
              <ColonneMacros titre="Jour de repos" macros={resultats.repos} />
              <ColonneMacros titre="Jour de règles" macros={resultats.regles} />
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          {etape > 0 && etape < 3 ? (
            <Button type="button" variant="outline" size="sm" onClick={etapePrecedente} disabled={chargement}>
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
                disabled={chargement || !resultats}
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
      </CardContent>
    </Card>
  )
}
