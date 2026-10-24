'use client'

import { LignesProgramme } from '@/components/sport/libre/LignesProgramme'
import { enregistrerContenuLibreSeance } from '@/lib/db/lignes-programme'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { TimerYoga } from '@/components/sport/TimerYoga'
import { YogaPostureLigne } from '@/components/sport/yoga/YogaPostureLigne'
import { MacrosSeanceCard } from '@/components/sport/MacrosSeanceCard'
import { CarteIntensiteSeance } from '@/components/parametres/CarteIntensiteSeance'
import { MuscuRessentiEmojis } from '@/components/sport/muscu/MuscuRessentiEmojis'
import { SelecteurVariante } from '@/components/sport/SelecteurVariante'
import { ProgrammeVide } from '@/components/sport/ProgrammeVide'
import { AssistantSeance } from '@/components/sport/aide/AssistantSeance'
import { BoutonAideSeance } from '@/components/sport/aide/BoutonAideSeance'
import { ModaleEditPosturesYoga } from '@/components/sport/ModaleEditPosturesYoga'
import { loggerSeanceYogaClient, modifierSeanceYogaClient } from '@/lib/sport/workouts-client'
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
import { BannerSuggestionGaia } from '@/components/sport/BannerSuggestionGaia'
import { adapterPosturesGaia, messageGaiaTousSports } from '@/lib/sport/gaia-adaptation'
import type {
  LigneSeanceLibre,
  IntensiteEffort,
  Phase,
  PostureYoga,
  PourcentagesGaia,
  ProfilEffort,
  SportVariante,
  TypeEffort,
  TypeYoga,
  WorkoutYogaComplet,
} from '@/types'

function parseType(n: string | null): TypeYoga | null {
  if (!n) return null
  const m = n.match(/^\[(\w+)\]/)
  const t = m?.[1]
  if (t === 'yin' || t === 'flow' || t === 'power') return t
  return null
}

export function OngletYoga({
  phase,
  userId,
  date,
  seanceExistante,
  onEnregistre,
  pourcentages,
}: {
  phase: Phase | null
  userId: string
  date: string
  seanceExistante?: WorkoutYogaComplet | null
  onEnregistre?: () => void
  pourcentages: PourcentagesGaia
}) {
  const r = useRouter()
  const edit = !!seanceExistante
  // Le style (yin/flow/power) n'est plus choisi : on garde celui d'une séance existante, sinon « flow ».
  const type: TypeYoga = parseType(seanceExistante?.notes ?? null) ?? 'flow'
  const [timer, setTimer] = useState(false)
  const [coches, setCoches] = useState<Set<number>>(() => new Set())
  const [res, setRes] = useState(seanceExistante?.feeling ?? 0)
  const [notes, setNotes] = useState(() => (seanceExistante?.notes ?? '').replace(/^\[\w+\]\s*/, ''))
  const [ch, setCh] = useState(false)
  const [lignesFaites, setLignesFaites] = useState<LigneSeanceLibre[]>(() => seanceExistante?.contenu_libre ?? [])
  const [variantes, setVariantes] = useState<SportVariante[]>([])
  const [varianteActiveId, setVarianteActiveId] = useState<string | null>(null)
  const [modalePostures, setModalePostures] = useState(false)
  const [pret, setPret] = useState(false)
  const [aide, setAide] = useState(false)

  const varianteActive = variantes.find((v) => v.id === varianteActiveId) ?? null
  // Plus de séance intégrée : uniquement les postures du programme créé.
  const postures: PostureYoga[] = varianteActive?.postures ?? []
  // Séance Gaia : durées des postures ajustées selon la phase (affichage + timer, le programme ne change pas).
  const [modeGaia, setModeGaia] = useState<'normale' | 'gaia'>('normale')
  const pct = phase ? pourcentages[phase] : 0
  const posturesSeance = modeGaia === 'gaia' ? adapterPosturesGaia(postures, pct) : postures

  useEffect(() => {
    setCoches(new Set())
  }, [varianteActiveId])

  useEffect(() => {
    setRes(seanceExistante?.feeling ?? 0)
    setNotes((seanceExistante?.notes ?? '').replace(/^\[\w+\]\s*/, ''))
    setTimer(false)
  }, [seanceExistante, date])

  useEffect(() => {
    let actif = true
    void (async () => {
      const vs = await getVariantes(supabase, userId, 'yoga', 'na')
      if (!actif) return
      setVariantes(vs)
      // Sans programme actif, on ouvre le premier programme existant.
      setVarianteActiveId((vs.find((v) => v.est_active) ?? vs[0])?.id ?? null)
      setPret(true)
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

  async function changerIntensiteYoga(profil: ProfilEffort) {
    if (!varianteActive) return
    const ok = await mettreAJourProfilVariante(supabase, userId, 'yoga', varianteActive.id, profil)
    if (ok) {
      setVariantes((prev) => prev.map((v) => (v.id === varianteActive.id ? { ...v, ...profil } : v)))
    } else {
      toast.error('Impossible d’enregistrer l’intensité.')
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

  async function creerVarianteYoga(nom: string, nouvelles: PostureYoga[] = []) {
    // Sans contenu (création manuelle), on ouvre directement l'ajout de postures.
    const v = await creerVariante(supabase, userId, 'yoga', 'na', nom, { postures: nouvelles })
    if (!v) {
      toast.error('Création de la variante impossible.')
      return
    }
    setVariantes((prev) => [...prev, v])
    setVarianteActiveId(v.id)
    if (!nouvelles.length) setModalePostures(true)
    else toast.success(`Programme « ${nom} » créé`)
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
    if (varianteActiveId === id) setVarianteActiveId(variantes.find((v) => v.id !== id)?.id ?? null)
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
      const dureePostures = Math.round(postures.reduce((t, x) => t + x.dureeSec, 0) / 60)
      const p = { type, dureeMin: varianteActive?.duree_min || dureePostures || 30, feeling: res > 0 ? res : null, notes: notes || null }
      if (edit && seanceExistante) await modifierSeanceYogaClient(seanceExistante.id, p)
      else await loggerSeanceYogaClient({ date, ...p })
      await enregistrerContenuLibreSeance(supabase, userId, date, 'yoga', lignesFaites, !!seanceExistante?.contenu_libre?.length)
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
  const cadre = 'flex flex-col gap-4 rounded-xl border border-violet-200/80 bg-[#F5F3FF]/80 p-4 dark:border-violet-900/50 dark:bg-violet-950/20'
  const assistant = aide ? (
    <AssistantSeance
      contexte={{ sport: 'yoga' }}
      phase={phase}
      libelleValider="Créer ce programme"
      onFermer={() => setAide(false)}
      onUtiliser={async (s, nom) => {
        await creerVarianteYoga(nom, s.postures)
        setAide(false)
      }}
    />
  ) : null
  if (!pret) return <p className="text-sm text-muted-foreground">Chargement…</p>
  if (!varianteActive) {
    return (
      <div className={cadre}>
        <ProgrammeVide sport="yoga" onCreer={(nom) => void creerVarianteYoga(nom)} onAide={() => setAide(true)} />
        {assistant}
      </div>
    )
  }

  return (
    <div className={cadre}>
      {edit ? (
        <div className="flex items-center gap-2 text-sm text-[#6D28D9] dark:text-violet-300">
          <Pencil className="size-4" /> Modification
        </div>
      ) : null}
      <SelecteurVariante
        variantes={variantes}
        onglets={[]}
        activeId={varianteActive.id}
        onSelect={(id) => void selectionnerVarianteYoga(id)}
        onCreer={(nom) => void creerVarianteYoga(nom)}
        onRenommer={(id, nom) => void renommerVarianteYoga(id, nom)}
        onSupprimer={(id) => void supprimerVarianteYoga(id)}
        couleurActif="bg-[#7C3AED] text-white"
      />
      <BoutonAideSeance onClick={() => setAide(true)} />
      {assistant}
      {varianteActive ? (
        <CarteIntensiteSeance
          label={`Intensité — ${varianteActive.nom}`}
          profil={{ intensite: varianteActive.intensite, type_effort: varianteActive.type_effort, duree_min: varianteActive.duree_min }}
          onChangerIntensite={(v: IntensiteEffort) => void changerIntensiteYoga({ intensite: v, type_effort: varianteActive.type_effort, duree_min: varianteActive.duree_min })}
          onChangerEffort={(v: Exclude<TypeEffort, 'aucun'>) => void changerIntensiteYoga({ intensite: varianteActive.intensite, type_effort: v, duree_min: varianteActive.duree_min })}
          onChangerDuree={(v: number) => void changerIntensiteYoga({ intensite: varianteActive.intensite, type_effort: varianteActive.type_effort, duree_min: v })}
        />
      ) : null}
      {phase ? (
        <BannerSuggestionGaia phase={phase} message={messageGaiaTousSports(phase, pct)} modeActif={modeGaia} onChangerMode={setModeGaia} />
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {postures.length ? `${postures.length} posture${postures.length > 1 ? 's' : ''}` : 'Aucune posture : appuie sur « Modifier » pour en ajouter.'}
        </p>
        <Button type="button" size="sm" variant="outline" onClick={() => setModalePostures(true)} className="shrink-0">
          <Pencil className="mr-1 size-3" /> Modifier
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {posturesSeance.map((p, i) => (
          <YogaPostureLigne key={i} p={p} index={i} fait={coches.has(i)} onToggle={toggle} />
        ))}
      </div>
      {!postures.length ? null : !timer ? (
        <Button type="button" className="w-full border-violet-300 bg-[#7C3AED] hover:bg-violet-800" onClick={() => setTimer(true)}>
          ▶ Lancer le timer guidé
        </Button>
      ) : (
        <TimerYoga postures={posturesSeance} />
      )}
      <LignesProgramme
        key={`yoga-${varianteActiveId ?? 'defaut'}-${seanceExistante?.id ?? 'nouvelle'}`}
        userId={userId}
        typeSeance="yoga"
        lieu="na"
        varianteId={varianteActiveId}
        sportSuggestions="pilates"
        lignesSeance={seanceExistante?.contenu_libre}
        onFaitesChange={setLignesFaites}
      />
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
          onFermer={() => setModalePostures(false)}
          onSauvegarde={sauvegarderPosturesYoga}
        />
      ) : null}
    </div>
  )
}
