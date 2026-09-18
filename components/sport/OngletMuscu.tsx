'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { BilanSeance } from '@/components/sport/BilanSeance'
import { MacrosSeanceCard } from '@/components/sport/MacrosSeanceCard'
import { BannerSuggestionGaia } from '@/components/sport/BannerSuggestionGaia'
import { CarteIntensiteSeance } from '@/components/parametres/CarteIntensiteSeance'
import { ExerciceItem } from '@/components/sport/ExerciceItem'
import { ModaleEditSeance } from '@/components/sport/ModaleEditSeance'
import { ONGLET_DEFAUT_ID, SelecteurVariante } from '@/components/sport/SelecteurVariante'
import { MuscuRessentiEmojis } from '@/components/sport/muscu/MuscuRessentiEmojis'
import { MuscuTypeLieu } from '@/components/sport/muscu/MuscuTypeLieu'
import { Button } from '@/components/ui/button'
import { EXERCICES, getExercicesParSeance } from '@/lib/data/exercises'
import { getDernieresCharges } from '@/lib/db/charges'
import {
  activerVariante,
  creerVariante,
  getVariantes,
  mettreAJourContenuVariante,
  mettreAJourProfilVariante,
  renommerVariante,
  supprimerVariante,
} from '@/lib/db/sport-variantes'
import { supabase } from '@/lib/supabase'
import { adapterSeancePhase } from '@/lib/planning-sport'
import { enregistrerSeanceMuscuComplet } from '@/lib/sport/muscuEnregistrement'
import {
  avecDernierPoids,
  enrichirDepuisCatalog,
  exCatalogVersAdapte,
} from '@/lib/sport/muscuExerciceAdapte'
import { exercicesDepuisCustom, exercicesToCustom, typeMuscuVersPlanning } from '@/lib/sport/muscuCustomMap'
import { POURCENTAGES_GAIA_DEFAUT } from '@/types'
import type {
  DerniereCharge,
  ExerciceCustom,
  IntensiteEffort,
  Lieu,
  Phase,
  PourcentagesGaia,
  ProfilEffort,
  SeanceAdaptee,
  SportVariante,
  TypeEffort,
  TypeSeanceMuscle,
  WorkoutMuscuComplet,
} from '@/types'

const NOTES: Record<string, TypeSeanceMuscle> = { 'Full body': 'full_body', 'Upper / Lower': 'upper_lower' }
const LBL: Record<TypeSeanceMuscle, string> = { full_body: 'Full body', upper_lower: 'Upper / Lower' }
type M = 'normale' | 'gaia'

export function OngletMuscu({
  phase,
  userId,
  date,
  seanceExistante,
  onEnregistre,
  pourcentages = POURCENTAGES_GAIA_DEFAUT,
}: {
  phase: Phase | null
  userId: string
  date: string
  seanceExistante?: WorkoutMuscuComplet | null
  onEnregistre?: () => void
  /** Pourcentages d'ajustement par phase, réglables dans Paramètres > Planning sport */
  pourcentages?: PourcentagesGaia
}) {
  const r = useRouter()
  const edit = !!seanceExistante
  const [typeSeance, setTypeSeance] = useState<TypeSeanceMuscle>(
    seanceExistante?.notes && NOTES[seanceExistante.notes] ? NOTES[seanceExistante.notes]! : 'full_body'
  )
  const [lieu, setLieu] = useState<Lieu>(seanceExistante?.location ?? 'maison')
  const [mode, setMode] = useState<M>('normale')
  const [exercicesFaits, setExercicesFaits] = useState<string[]>(() =>
    seanceExistante ? [...new Set(seanceExistante.sets.map((s) => s.exercise_name))] : []
  )
  const [charges, setCharges] = useState<Record<string, number>>({})
  const [dernieres, setDernieres] = useState<DerniereCharge[]>([])
  const [variantes, setVariantes] = useState<SportVariante[]>([])
  const [varianteActiveId, setVarianteActiveId] = useState<string | null>(null)
  const [custom, setCustom] = useState<ExerciceCustom[] | null>(null)
  const [ressenti, setRessenti] = useState<number | null>(seanceExistante?.feeling ?? null)
  const [modale, setModale] = useState(false)
  const [ch, setCh] = useState(false)
  const pPh = phase ?? 'folliculaire'

  useEffect(() => {
    if (!seanceExistante) {
      setExercicesFaits([])
      setRessenti(null)
      return
    }
    setTypeSeance(
      seanceExistante.notes && NOTES[seanceExistante.notes] ? NOTES[seanceExistante.notes]! : 'full_body'
    )
    setLieu(seanceExistante.location ?? 'maison')
    setExercicesFaits([...new Set(seanceExistante.sets.map((s) => s.exercise_name))])
    setRessenti(seanceExistante.feeling ?? null)
    const chMap: Record<string, number> = {}
    seanceExistante.sets.forEach((s) => {
      if (s.weight_kg != null) chMap[s.exercise_name] = Number(s.weight_kg)
    })
    setCharges((prev) => ({ ...prev, ...chMap }))
  }, [seanceExistante, date])

  const list = useMemo(() => (custom?.length ? exercicesDepuisCustom(custom, typeSeance, lieu) : getExercicesParSeance(typeSeance, lieu)), [custom, typeSeance, lieu])

  const seanceA = useMemo((): SeanceAdaptee | null => {
    if (!list.length) return null
    const b = custom?.length ? custom : exercicesToCustom(list)
    const a = adapterSeancePhase(b, dernieres, pPh, pourcentages)
    return { ...a, exercices: enrichirDepuisCatalog(a.exercices, list) }
  }, [custom, list, dernieres, pPh, pourcentages])

  const normaux = useMemo(() => {
    const m = new Map(dernieres.map((d) => [d.exercise_name, d]))
    return list.map((e) => avecDernierPoids(exCatalogVersAdapte(e), m.get(e.nom)))
  }, [list, dernieres])
  const aff = mode === 'gaia' && seanceA ? seanceA.exercices : normaux
  const enCours = useMemo(() => aff.find((e) => !exercicesFaits.includes(e.nom))?.nom, [aff, exercicesFaits])

  useEffect(() => {
    let actif = true
    void (async () => {
      const typePlanning = typeMuscuVersPlanning(typeSeance)
      const [vs, d] = await Promise.all([
        getVariantes(supabase, userId, typePlanning, lieu),
        getDernieresCharges(supabase, userId),
      ])
      if (!actif) return
      setVariantes(vs)
      const active = vs.find((v) => v.est_active) ?? null
      setVarianteActiveId(active?.id ?? null)
      setCustom(active?.exercices?.length ? active.exercices : null)
      setDernieres(d)
      const o: Record<string, number> = {}
      d.forEach((e) => {
        o[e.exercise_name] = e.weight_kg
      })
      setCharges((s) => ({ ...o, ...s }))
    })()
    return () => {
      actif = false
    }
  }, [userId, typeSeance, lieu])

  const togg = useCallback((n: string) => {
    setExercicesFaits((f) => (f.includes(n) ? f.filter((y) => y !== n) : [...f, n]))
  }, [])

  const varianteActive = variantes.find((v) => v.id === varianteActiveId) ?? null

  async function changerIntensiteMuscu(profil: ProfilEffort) {
    if (!varianteActive) return
    const typePlanning = typeMuscuVersPlanning(typeSeance)
    const ok = await mettreAJourProfilVariante(supabase, userId, typePlanning, varianteActive.id, profil)
    if (ok) {
      setVariantes((prev) => prev.map((v) => (v.id === varianteActive.id ? { ...v, ...profil } : v)))
    } else {
      toast.error('Impossible d’enregistrer l’intensité.')
    }
  }

  async function selectionnerVariante(id: string | null) {
    const typePlanning = typeMuscuVersPlanning(typeSeance)
    const ok = await activerVariante(supabase, userId, typePlanning, lieu, id)
    if (!ok) {
      toast.error('Impossible de changer de variante.')
      return
    }
    setVarianteActiveId(id)
    const v = id ? variantes.find((x) => x.id === id) ?? null : null
    setCustom(v?.exercices?.length ? v.exercices : null)
  }

  async function creerVarianteMuscu(nom: string) {
    const typePlanning = typeMuscuVersPlanning(typeSeance)
    const contenuBase = custom?.length ? custom : exercicesToCustom(list)
    const v = await creerVariante(supabase, userId, typePlanning, lieu, nom, { exercices: contenuBase })
    if (!v) {
      toast.error('Création de la variante impossible.')
      return
    }
    setVariantes((prev) => [...prev, v])
    setVarianteActiveId(v.id)
    setCustom(v.exercices)
  }

  async function renommerVarianteMuscu(id: string, nom: string) {
    const ok = await renommerVariante(supabase, id, nom)
    if (ok) setVariantes((prev) => prev.map((v) => (v.id === id ? { ...v, nom } : v)))
    else toast.error('Renommage impossible.')
  }

  async function supprimerVarianteMuscu(id: string) {
    const ok = await supprimerVariante(supabase, id)
    if (!ok) {
      toast.error('Suppression impossible.')
      return
    }
    setVariantes((prev) => prev.filter((v) => v.id !== id))
    if (varianteActiveId === id) {
      setVarianteActiveId(null)
      setCustom(null)
    }
  }

  async function sauvegarderContenuMuscu(exercices: ExerciceCustom[]) {
    const typePlanning = typeMuscuVersPlanning(typeSeance)
    if (!varianteActiveId) {
      const v = await creerVariante(supabase, userId, typePlanning, lieu, 'Séance par défaut', { exercices })
      if (!v) {
        toast.error('Enregistrement impossible.')
        throw new Error('creation-variante')
      }
      setVariantes((prev) => [...prev, v])
      setVarianteActiveId(v.id)
    } else {
      const ok = await mettreAJourContenuVariante(supabase, varianteActiveId, { exercices })
      if (!ok) {
        toast.error('Enregistrement impossible.')
        throw new Error('maj-variante')
      }
      const id = varianteActiveId
      setVariantes((prev) => prev.map((v) => (v.id === id ? { ...v, exercices } : v)))
    }
    setCustom(exercices)
    toast.success('Séance personnalisée enregistrée')
  }

  return (
    <div className="flex flex-col gap-4">
      <MuscuTypeLieu type={typeSeance} lieu={lieu} phase={phase} onType={setTypeSeance} onLieu={setLieu} />
      <SelecteurVariante
        variantes={variantes}
        activeId={varianteActiveId ?? ONGLET_DEFAUT_ID}
        onSelect={(id) => void selectionnerVariante(id === ONGLET_DEFAUT_ID ? null : id)}
        onCreer={(nom) => void creerVarianteMuscu(nom)}
        onRenommer={(id, nom) => void renommerVarianteMuscu(id, nom)}
        onSupprimer={(id) => void supprimerVarianteMuscu(id)}
      />
      {varianteActive ? (
        <CarteIntensiteSeance
          label={`Intensité — ${varianteActive.nom}`}
          profil={{ intensite: varianteActive.intensite, type_effort: varianteActive.type_effort, duree_min: varianteActive.duree_min }}
          onChangerIntensite={(v: IntensiteEffort) => void changerIntensiteMuscu({ intensite: v, type_effort: varianteActive.type_effort, duree_min: varianteActive.duree_min })}
          onChangerEffort={(v: Exclude<TypeEffort, 'aucun'>) => void changerIntensiteMuscu({ intensite: varianteActive.intensite, type_effort: v, duree_min: varianteActive.duree_min })}
          onChangerDuree={(v: number) => void changerIntensiteMuscu({ intensite: varianteActive.intensite, type_effort: varianteActive.type_effort, duree_min: v })}
        />
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">💪 {LBL[typeSeance]} — {lieu === 'maison' ? '🏠' : '🏋️'}</p>
        <Button type="button" size="sm" variant="outline" onClick={() => setModale(true)} className="shrink-0">
          <Pencil className="mr-1 size-3" /> Modifier
        </Button>
      </div>
      {phase && seanceA ? (
        <BannerSuggestionGaia phase={phase} message={seanceA.messageAdaptation} modeActif={mode} onChangerMode={setMode} />
      ) : null}
      <div className="flex flex-col gap-3">
        {aff.map((e) => (
          <ExerciceItem
            key={e.nom}
            domId={`exo-${e.nom.replace(/\s/g, '-')}`}
            exercice={e}
            fait={exercicesFaits.includes(e.nom)}
            charge={charges[e.nom] ?? e.chargeProposee ?? null}
            onToggle={() => togg(e.nom)}
            onChargeChange={(c) => setCharges((s) => ({ ...s, [e.nom]: c }))}
            enCours={e.nom === enCours}
            phase={phase}
          />
        ))}
      </div>
      <MuscuRessentiEmojis ressenti={ressenti} onChange={setRessenti} phase={phase} />
      <BilanSeance exercices={aff} exercicesFaits={exercicesFaits} typeSeance={typeSeance} />
      {userId && pPh ? (
        <MacrosSeanceCard
          typeSeance={typeMuscuVersPlanning(typeSeance)}
          userId={userId}
          phase={pPh}
          workoutId={seanceExistante?.id}
          seanceExistante={seanceExistante ?? null}
        />
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" onClick={() => { const n = aff.find((e) => !exercicesFaits.includes(e.nom)); if (n) document.getElementById(`exo-${n.nom.replace(/\s/g, '-')}`)?.scrollIntoView({ block: 'center' }) }}>
          ▶ Mode guidé
        </Button>
        <Button
          className="bg-rose-600 text-white hover:bg-rose-700"
          disabled={ch || !exercicesFaits.length}
          onClick={() => {
            if (!exercicesFaits.length) {
              toast.message('Coche au moins un exercice réalisé avant d’enregistrer.')
              return
            }
            setCh(true)
            void enregistrerSeanceMuscuComplet({
              date,
              lieu,
              typeSeance,
              ressenti,
              afficher: aff,
              exercicesFaits,
              charges,
              edit,
              seanceExistante: seanceExistante ?? null,
            })
              .then(() => {
                toast.success(edit ? 'Séance mise à jour ! 💪' : 'Séance enregistrée ! 💪')
                setExercicesFaits([])
                onEnregistre?.()
                r.refresh()
              })
              .catch((e: unknown) => {
                const msg = e instanceof Error ? e.message : 'Enregistrement impossible.'
                toast.error(msg)
              })
              .finally(() => setCh(false))
          }}
        >
          {ch ? '…' : edit ? 'Mettre à jour la séance' : 'Enregistrer la séance'}
        </Button>
      </div>
      {!exercicesFaits.length ? (
        <p className="text-xs text-muted-foreground">Coche les exercices que tu as faits pour activer l’enregistrement.</p>
      ) : null}
      {modale ? (
        <ModaleEditSeance
          typeSeance={typeMuscuVersPlanning(typeSeance)}
          lieu={lieu}
          exercicesActuels={custom?.length ? custom : exercicesToCustom(list)}
          exercicesCatalogue={EXERCICES}
          onFermer={() => setModale(false)}
          onSauvegarde={sauvegarderContenuMuscu}
        />
      ) : null}
    </div>
  )
}
