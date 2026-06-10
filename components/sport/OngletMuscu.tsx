'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { BilanSeance } from '@/components/sport/BilanSeance'
import { MacrosSeanceCard } from '@/components/sport/MacrosSeanceCard'
import { BannerSuggestionGaia } from '@/components/sport/BannerSuggestionGaia'
import { ExerciceItem } from '@/components/sport/ExerciceItem'
import { ModaleEditSeance } from '@/components/sport/ModaleEditSeance'
import { MuscuRessentiEmojis } from '@/components/sport/muscu/MuscuRessentiEmojis'
import { MuscuTypeLieu } from '@/components/sport/muscu/MuscuTypeLieu'
import { Button } from '@/components/ui/button'
import { EXERCICES, getExercicesParSeance } from '@/lib/data/exercises'
import { getDernieresCharges } from '@/lib/db/charges'
import { getSeanceCustom } from '@/lib/db/seances-custom'
import { supabase } from '@/lib/supabase'
import { adapterSeancePhase } from '@/lib/planning-sport'
import { enregistrerSeanceMuscuComplet } from '@/lib/sport/muscuEnregistrement'
import {
  avecDernierPoids,
  enrichirDepuisCatalog,
  exCatalogVersAdapte,
} from '@/lib/sport/muscuExerciceAdapte'
import { exercicesDepuisCustom, exercicesToCustom, typeMuscuVersPlanning } from '@/lib/sport/muscuCustomMap'
import type { DerniereCharge, ExerciceCustom, Lieu, Phase, PlanningSport, SeanceAdaptee, TypeSeanceMuscle, WorkoutMuscuComplet } from '@/types'

const NOTES: Record<string, TypeSeanceMuscle> = { 'Full body': 'full_body', 'Upper / Lower': 'upper_lower' }
const LBL: Record<TypeSeanceMuscle, string> = { full_body: 'Full body', upper_lower: 'Upper / Lower' }
type M = 'normale' | 'gaia'

export function OngletMuscu({
  phase,
  userId,
  date,
  planning: _planning,
  seanceExistante,
  onEnregistre,
}: {
  phase: Phase | null
  userId: string
  date: string
  planning: PlanningSport
  seanceExistante?: WorkoutMuscuComplet | null
  onEnregistre?: () => void
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
    const a = adapterSeancePhase(b, dernieres, pPh)
    return { ...a, exercices: enrichirDepuisCatalog(a.exercices, list) }
  }, [custom, list, dernieres, pPh])

  const normaux = useMemo(() => {
    const m = new Map(dernieres.map((d) => [d.exercise_name, d]))
    return list.map((e) => avecDernierPoids(exCatalogVersAdapte(e), m.get(e.nom)))
  }, [list, dernieres])
  const aff = mode === 'gaia' && seanceA ? seanceA.exercices : normaux
  const enCours = useMemo(() => aff.find((e) => !exercicesFaits.includes(e.nom))?.nom, [aff, exercicesFaits])

  useEffect(() => {
    if (!userId) return
    let x = true
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || !x) return
      const [c, d] = await Promise.all([
        getSeanceCustom(supabase, user.id, typeMuscuVersPlanning(typeSeance), lieu),
        getDernieresCharges(supabase, user.id),
      ])
      if (!x) return
      setCustom(c?.length ? c : null)
      setDernieres(d)
      const o: Record<string, number> = {}
      d.forEach((e) => {
        o[e.exercise_name] = e.weight_kg
      })
      setCharges((s) => ({ ...o, ...s }))
    })()
    return () => {
      x = false
    }
  }, [userId, typeSeance, lieu])

  const togg = useCallback((n: string) => {
    setExercicesFaits((f) => (f.includes(n) ? f.filter((y) => y !== n) : [...f, n]))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <MuscuTypeLieu type={typeSeance} lieu={lieu} phase={phase} onType={setTypeSeance} onLieu={setLieu} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">💪 {LBL[typeSeance]} — {lieu === 'maison' ? '🏠' : '🏋️'}</p>
        {userId ? (
          <Button type="button" size="sm" variant="outline" onClick={() => setModale(true)} className="shrink-0">
            <Pencil className="mr-1 size-3" /> Modifier
          </Button>
        ) : null}
      </div>
      {phase && seanceA ? (
        <BannerSuggestionGaia phase={phase} suggestion={seanceA} modeActif={mode} onChangerMode={setMode} />
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
      {modale && userId ? (
        <ModaleEditSeance
          typeSeance={typeMuscuVersPlanning(typeSeance)}
          lieu={lieu}
          userId={userId}
          exercicesActuels={custom?.length ? custom : exercicesToCustom(list)}
          exercicesCatalogue={EXERCICES}
          onFermer={() => setModale(false)}
          onSauvegarde={async () => {
            const {
              data: { user },
            } = await supabase.auth.getUser()
            if (user) {
              const c = await getSeanceCustom(supabase, user.id, typeMuscuVersPlanning(typeSeance), lieu)
              setCustom(c?.length ? c : null)
            }
            setModale(false)
            r.refresh()
          }}
          onReinitialise={() => setCustom(null)}
        />
      ) : null}
    </div>
  )
}
