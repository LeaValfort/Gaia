'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { TimerYoga } from '@/components/sport/TimerYoga'
import { YogaPostureLigne } from '@/components/sport/yoga/YogaPostureLigne'
import { MacrosSeanceCard } from '@/components/sport/MacrosSeanceCard'
import { MuscuRessentiEmojis } from '@/components/sport/muscu/MuscuRessentiEmojis'
import { ONGLET_DEFAUT_ID, SelecteurVariante } from '@/components/sport/SelecteurVariante'
import { ModaleEditPosturesYoga } from '@/components/sport/ModaleEditPosturesYoga'
import { getSeanceParPhase, getSeanceYoga } from '@/lib/data/yoga'
import { loggerSeanceYogaClient, modifierSeanceYogaClient } from '@/lib/sport/workouts-client'
import {
  activerVariante,
  creerVariante,
  getVariantes,
  mettreAJourContenuVariante,
  renommerVariante,
  supprimerVariante,
} from '@/lib/db/sport-variantes'
import { supabase } from '@/lib/supabase'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import type { Phase, PostureYoga, SeanceYoga, SportVariante, TypeYoga, WorkoutYogaComplet } from '@/types'

function parseType(n: string | null): TypeYoga | null {
  if (!n) return null
  const m = n.match(/^\[(\w+)\]/)
  const t = m?.[1]
  if (t === 'yin' || t === 'flow' || t === 'power') return t
  return null
}

const MODES: { t: TypeYoga; label: string; e: string }[] = [
  { t: 'yin', label: 'Yin', e: '🌙' },
  { t: 'flow', label: 'Flow', e: '🌿' },
  { t: 'power', label: 'Power', e: '⚡' },
]

export function OngletYoga({
  phase,
  userId,
  date,
  seanceExistante,
  onEnregistre,
}: {
  phase: Phase | null
  userId: string
  date: string
  seanceExistante?: WorkoutYogaComplet | null
  onEnregistre?: () => void
}) {
  const r = useRouter()
  const edit = !!seanceExistante
  const def: SeanceYoga = phase ? getSeanceParPhase(phase) : getSeanceYoga('flow')
  const [type, setType] = useState<TypeYoga>(parseType(seanceExistante?.notes ?? null) ?? def.type)
  const [timer, setTimer] = useState(false)
  const [coches, setCoches] = useState<Set<number>>(() => new Set())
  const [res, setRes] = useState(seanceExistante?.feeling ?? 0)
  const [notes, setNotes] = useState(() => (seanceExistante?.notes ?? '').replace(/^\[\w+\]\s*/, ''))
  const [ch, setCh] = useState(false)
  const [variantes, setVariantes] = useState<SportVariante[]>([])
  const [varianteActiveId, setVarianteActiveId] = useState<string | null>(null)
  const [modalePostures, setModalePostures] = useState(false)

  const varianteActive = variantes.find((v) => v.id === varianteActiveId) ?? null
  const seance = getSeanceYoga(type)
  const postures: PostureYoga[] = varianteActive?.postures?.length ? varianteActive.postures : seance.postures

  useEffect(() => {
    setCoches(new Set())
  }, [type, varianteActiveId])

  useEffect(() => {
    const defLocal: SeanceYoga = phase ? getSeanceParPhase(phase) : getSeanceYoga('flow')
    setType(parseType(seanceExistante?.notes ?? null) ?? defLocal.type)
    setRes(seanceExistante?.feeling ?? 0)
    setNotes((seanceExistante?.notes ?? '').replace(/^\[\w+\]\s*/, ''))
    setTimer(false)
  }, [seanceExistante, date, phase])

  useEffect(() => {
    let actif = true
    void (async () => {
      const vs = await getVariantes(supabase, userId, 'yoga', 'na')
      if (!actif) return
      setVariantes(vs)
      setVarianteActiveId(vs.find((v) => v.est_active)?.id ?? null)
    })()
    return () => {
      actif = false
    }
  }, [userId])

  const toggle = (i: number) =>
    setCoches((s) => {
      const n = new Set(s)
      n.has(i) ? n.delete(i) : n.add(i)
      return n
    })

  async function choisirType(t: TypeYoga) {
    setType(t)
    setTimer(false)
    if (varianteActiveId) {
      const ok = await activerVariante(supabase, userId, 'yoga', 'na', null)
      if (ok) setVarianteActiveId(null)
    }
  }

  async function selectionnerVarianteYoga(id: string | null) {
    const ok = await activerVariante(supabase, userId, 'yoga', 'na', id)
    if (!ok) {
      toast.error('Impossible de changer de variante.')
      return
    }
    setVarianteActiveId(id)
    setTimer(false)
  }

  async function creerVarianteYoga(nom: string) {
    const v = await creerVariante(supabase, userId, 'yoga', 'na', nom, { postures })
    if (!v) {
      toast.error('Création de la variante impossible.')
      return
    }
    setVariantes((prev) => [...prev, v])
    setVarianteActiveId(v.id)
  }

  async function renommerVarianteYoga(id: string, nom: string) {
    const ok = await renommerVariante(supabase, id, nom)
    if (ok) setVariantes((prev) => prev.map((v) => (v.id === id ? { ...v, nom } : v)))
    else toast.error('Renommage impossible.')
  }

  async function supprimerVarianteYoga(id: string) {
    const ok = await supprimerVariante(supabase, id)
    if (!ok) {
      toast.error('Suppression impossible.')
      return
    }
    setVariantes((prev) => prev.filter((v) => v.id !== id))
    if (varianteActiveId === id) setVarianteActiveId(null)
  }

  async function sauvegarderPosturesYoga(nouvelles: PostureYoga[]) {
    if (!varianteActiveId) {
      const v = await creerVariante(supabase, userId, 'yoga', 'na', 'Séance par défaut', { postures: nouvelles })
      if (!v) {
        toast.error('Enregistrement impossible.')
        throw new Error('creation-variante')
      }
      setVariantes((prev) => [...prev, v])
      setVarianteActiveId(v.id)
    } else {
      const ok = await mettreAJourContenuVariante(supabase, varianteActiveId, { postures: nouvelles })
      if (!ok) {
        toast.error('Enregistrement impossible.')
        throw new Error('maj-variante')
      }
      const id = varianteActiveId
      setVariantes((prev) => prev.map((v) => (v.id === id ? { ...v, postures: nouvelles } : v)))
    }
    toast.success('Postures enregistrées')
  }

  async function save() {
    setCh(true)
    try {
      const p = { type, dureeMin: seance.dureeMin, feeling: res > 0 ? res : null, notes: notes || null }
      if (edit && seanceExistante) await modifierSeanceYogaClient(seanceExistante.id, p)
      else await loggerSeanceYogaClient({ date, ...p })
      toast.success(edit ? 'Séance yoga mise à jour ! 🧘' : 'Séance yoga enregistrée ! 🧘')
      onEnregistre?.()
      r.refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Enregistrement impossible.'
      toast.error(msg)
    } finally {
      setCh(false)
    }
  }
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-violet-200/80 bg-[#F5F3FF]/80 p-4 dark:border-violet-900/50 dark:bg-violet-950/20">
      {edit ? (
        <div className="flex items-center gap-2 text-sm text-[#6D28D9] dark:text-violet-300">
          <Pencil className="size-4" /> Modification
        </div>
      ) : null}
      {phase && !edit ? (
        <p className="text-sm text-violet-800/80 dark:text-violet-200/90">
          Suggestion : {getSeanceParPhase(phase).nom}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => {
          const phasesConseillees = getSeanceYoga(m.t)
            .phaseCycle.map((p) => PHASES_DESIGN[p].label)
            .join(' · ')
          return (
            <button
              key={m.t}
              type="button"
              onClick={() => void choisirType(m.t)}
              className={`min-w-0 flex-1 rounded-lg px-2 py-2 text-center text-sm sm:px-3 ${
                type === m.t && !varianteActiveId ? 'bg-[#7C3AED] text-white' : 'bg-white/90 dark:bg-neutral-800/90'
              }`}
            >
              <span className="block">
                {m.e} {m.label}
              </span>
              <span className={`block text-[9px] font-normal ${type === m.t && !varianteActiveId ? 'text-white/80' : 'text-neutral-500 dark:text-neutral-400'}`}>
                {phasesConseillees}
              </span>
            </button>
          )
        })}
      </div>
      <SelecteurVariante
        variantes={variantes}
        activeId={varianteActiveId ?? ONGLET_DEFAUT_ID}
        onSelect={(id) => void selectionnerVarianteYoga(id === ONGLET_DEFAUT_ID ? null : id)}
        onCreer={(nom) => void creerVarianteYoga(nom)}
        onRenommer={(id, nom) => void renommerVarianteYoga(id, nom)}
        onSupprimer={(id) => void supprimerVarianteYoga(id)}
        couleurActif="bg-[#7C3AED] text-white"
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{seance.description}</p>
        <Button type="button" size="sm" variant="outline" onClick={() => setModalePostures(true)} className="shrink-0">
          <Pencil className="mr-1 size-3" /> Modifier
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {postures.map((p, i) => (
          <YogaPostureLigne key={i} p={p} index={i} fait={coches.has(i)} onToggle={toggle} />
        ))}
      </div>
      {!timer ? (
        <Button type="button" className="w-full border-violet-300 bg-[#7C3AED] hover:bg-violet-800" onClick={() => setTimer(true)}>
          ▶ Lancer le timer guidé
        </Button>
      ) : (
        <TimerYoga postures={postures} />
      )}
      <MuscuRessentiEmojis ressenti={res > 0 ? res : null} onChange={(n) => setRes(n ?? 0)} phase={phase} />
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="text-sm" placeholder="Notes" />
      {userId ? (
        <MacrosSeanceCard
          typeSeance="yoga"
          userId={userId}
          phase={phase ?? 'folliculaire'}
          workoutId={seanceExistante?.id}
          seanceExistante={seanceExistante ?? null}
        />
      ) : null}
      <Button onClick={() => void save()} disabled={ch} className="w-full bg-[#7C3AED] hover:bg-violet-800">
        {ch ? '…' : edit ? 'Mettre à jour' : 'Enregistrer'}
      </Button>
      {modalePostures ? (
        <ModaleEditPosturesYoga
          posturesActuelles={postures}
          posturesDefaut={seance.postures}
          onFermer={() => setModalePostures(false)}
          onSauvegarde={sauvegarderPosturesYoga}
        />
      ) : null}
    </div>
  )
}
