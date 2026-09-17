'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { loggerSeanceNatationClient, modifierSeanceNatationClient } from '@/lib/sport/workouts-client'
import { blocsDefautPourNiveau, totauxDepuisBlocs } from '@/lib/data/swimming'
import { MacrosSeanceCard } from '@/components/sport/MacrosSeanceCard'
import { BannerSuggestionGaia } from '@/components/sport/BannerSuggestionGaia'
import { SelecteurVariante, type OngletFixeVariante } from '@/components/sport/SelecteurVariante'
import { ModaleEditBlocsNatation } from '@/components/sport/ModaleEditBlocsNatation'
import { BlocNatationLigne } from '@/components/sport/natation/BlocNatationLigne'
import { appliquerPourcentage, messagePourcentageGaia } from '@/lib/planning-sport'
import {
  activerVariante,
  creerVariante,
  getVariantes,
  mettreAJourContenuVariante,
  renommerVariante,
  supprimerVariante,
} from '@/lib/db/sport-variantes'
import { supabase } from '@/lib/supabase'
import {
  POURCENTAGES_GAIA_DEFAUT,
  SWIM_LEVEL_MAX,
  SWIM_LEVEL_MIN,
  type BlocNatation,
  type Phase,
  type PourcentagesGaia,
  type SportVariante,
  type WorkoutNatationComplet,
} from '@/types'
import { cn } from '@/lib/utils'

const RESS = ['😴', '😕', '😊', '⚡', '🚀'] as const
/** Distance en natation arrondie au 25m le plus proche (usage courant en piscine). */
const ARRONDI_DISTANCE_M = 25

/** Préfixe des ids d'onglets fixes représentant un niveau du catalogue (ex. "niveau:3"). */
const PREFIXE_NIVEAU = 'niveau:'
const NIVEAUX_ONGLETS: OngletFixeVariante[] = Array.from(
  { length: SWIM_LEVEL_MAX - SWIM_LEVEL_MIN + 1 },
  (_, i) => i + SWIM_LEVEL_MIN
).map((n) => ({ id: `${PREFIXE_NIVEAU}${n}`, label: `Niveau ${n}` }))

export function OngletNatation({
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
  seanceExistante?: WorkoutNatationComplet | null
  onEnregistre?: () => void
  /** Pourcentages d'ajustement par phase, réglables dans Paramètres > Planning sport */
  pourcentages?: PourcentagesGaia
}) {
  const router = useRouter()
  const edit = !!seanceExistante
  const [niv, setNiv] = useState(seanceExistante?.swim.level ?? 1)
  const [distReelle, setDistReelle] = useState(
    seanceExistante?.swim.total_distance_m != null ? String(seanceExistante.swim.total_distance_m) : ''
  )
  const [notes, setNotes] = useState(seanceExistante?.notes ?? '')
  const [res, setRes] = useState(seanceExistante?.feeling ?? 0)
  const [ch, setCh] = useState(false)
  const [mode, setMode] = useState<'normale' | 'gaia'>('normale')
  const [variantes, setVariantes] = useState<SportVariante[]>([])
  const [varianteActiveId, setVarianteActiveId] = useState<string | null>(null)
  const [blocs, setBlocs] = useState<BlocNatation[] | null>(null)
  const [modaleBlocs, setModaleBlocs] = useState(false)

  useEffect(() => {
    setNiv(seanceExistante?.swim.level ?? 1)
    setDistReelle(
      seanceExistante?.swim.total_distance_m != null ? String(seanceExistante.swim.total_distance_m) : ''
    )
    setNotes(seanceExistante?.notes ?? '')
    setRes(seanceExistante?.feeling ?? 0)
  }, [seanceExistante, date])

  useEffect(() => {
    let actif = true
    void (async () => {
      const vs = await getVariantes(supabase, userId, 'natation', 'na')
      if (!actif) return
      setVariantes(vs)
      const active = vs.find((v) => v.est_active) ?? null
      setVarianteActiveId(active?.id ?? null)
      setBlocs(active?.blocs_natation?.length ? active.blocs_natation : null)
    })()
    return () => {
      actif = false
    }
  }, [userId])

  // Garde le niveau de base synchronisé, sauf si des blocs personnalisés priment déjà.
  useEffect(() => {
    if (!varianteActiveId || blocs) return
    void mettreAJourContenuVariante(supabase, varianteActiveId, { niveauNatation: niv })
    setVariantes((prev) => prev.map((v) => (v.id === varianteActiveId ? { ...v, niveau_natation: niv } : v)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [niv])

  async function selectionnerVarianteNatation(id: string | null) {
    const ok = await activerVariante(supabase, userId, 'natation', 'na', id)
    if (!ok) {
      toast.error('Impossible de changer de variante.')
      return
    }
    setVarianteActiveId(id)
    const v = id ? variantes.find((x) => x.id === id) ?? null : null
    if (v?.niveau_natation) setNiv(v.niveau_natation)
    setBlocs(v?.blocs_natation?.length ? v.blocs_natation : null)
  }

  /** Gère la sélection dans la rangée d'onglets fusionnée : niveaux fixes du catalogue + variantes perso. */
  async function choisirOnglet(id: string) {
    if (id.startsWith(PREFIXE_NIVEAU)) {
      const n = parseInt(id.slice(PREFIXE_NIVEAU.length), 10)
      if (!Number.isFinite(n)) return
      if (varianteActiveId) await selectionnerVarianteNatation(null)
      setNiv(n)
      return
    }
    await selectionnerVarianteNatation(id)
  }

  async function creerVarianteNatation(nom: string) {
    const v = await creerVariante(supabase, userId, 'natation', 'na', nom, {
      niveauNatation: niv,
      ...(blocs ? { blocsNatation: blocs } : {}),
    })
    if (!v) {
      toast.error('Création de la variante impossible.')
      return
    }
    setVariantes((prev) => [...prev, v])
    setVarianteActiveId(v.id)
  }

  async function renommerVarianteNatation(id: string, nom: string) {
    const ok = await renommerVariante(supabase, id, nom)
    if (ok) setVariantes((prev) => prev.map((v) => (v.id === id ? { ...v, nom } : v)))
    else toast.error('Renommage impossible.')
  }

  async function supprimerVarianteNatation(id: string) {
    const ok = await supprimerVariante(supabase, id)
    if (!ok) {
      toast.error('Suppression impossible.')
      return
    }
    setVariantes((prev) => prev.filter((v) => v.id !== id))
    if (varianteActiveId === id) {
      setVarianteActiveId(null)
      setBlocs(null)
    }
  }

  async function sauvegarderBlocsNatation(nouveauxBlocs: BlocNatation[]) {
    if (!varianteActiveId) {
      const v = await creerVariante(supabase, userId, 'natation', 'na', 'Séance par défaut', {
        niveauNatation: niv,
        blocsNatation: nouveauxBlocs,
      })
      if (!v) {
        toast.error('Enregistrement impossible.')
        throw new Error('creation-variante')
      }
      setVariantes((prev) => [...prev, v])
      setVarianteActiveId(v.id)
    } else {
      const ok = await mettreAJourContenuVariante(supabase, varianteActiveId, { blocsNatation: nouveauxBlocs })
      if (!ok) {
        toast.error('Enregistrement impossible.')
        throw new Error('maj-variante')
      }
      const id = varianteActiveId
      setVariantes((prev) => prev.map((v) => (v.id === id ? { ...v, blocs_natation: nouveauxBlocs } : v)))
    }
    setBlocs(nouveauxBlocs)
    toast.success('Blocs enregistrés')
  }

  // Blocs affichés/utilisés pour les calculs : les blocs perso s'ils existent, sinon le
  // point de départ dérivé du niveau — toujours affichés en lignes séparées (une par exercice).
  const blocsAffiches = blocs ?? blocsDefautPourNiveau(niv)
  const effectif = totauxDepuisBlocs(blocsAffiches)
  const distanceCible = phase && mode === 'gaia'
    ? appliquerPourcentage(effectif.distanceTotale, pourcentages[phase], ARRONDI_DISTANCE_M)
    : effectif.distanceTotale
  const dist = parseInt(distReelle, 10)
  const totalM = Number.isFinite(dist) && dist > 0 ? dist : distanceCible
  const rCrawl = effectif.distanceTotale > 0 ? effectif.crawlM / effectif.distanceTotale : 0.7
  const crawlM = Math.round(totalM * rCrawl)
  const breaststrokeM = Math.max(0, totalM - crawlM)

  async function save() {
    setCh(true)
    try {
      const nat = {
        level: niv,
        totalDistance: totalM,
        crawlM,
        breaststrokeM,
        blockStructure: effectif.structureTexte,
      }
      if (edit && seanceExistante) {
        await modifierSeanceNatationClient(seanceExistante.id, {
          ...nat,
          feeling: res || null,
          notes: notes || null,
        })
      } else {
        await loggerSeanceNatationClient({ date, feeling: res || null, notes: notes || null, natation: nat })
      }
      toast.success('Séance enregistrée ! 🏊')
      onEnregistre?.()
      router.refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Enregistrement impossible.'
      toast.error(msg)
    } finally {
      setCh(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-emerald-200/80 bg-[#ECFDF5]/80 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
      {edit ? (
        <div className="flex items-center gap-2 text-sm text-[#065F46] dark:text-emerald-200">
          <Pencil className="size-4" /> Modification
        </div>
      ) : null}
      <SelecteurVariante
        variantes={variantes}
        activeId={varianteActiveId ?? `${PREFIXE_NIVEAU}${niv}`}
        onSelect={(id) => void choisirOnglet(id)}
        onCreer={(nom) => void creerVarianteNatation(nom)}
        onRenommer={(id, nom) => void renommerVarianteNatation(id, nom)}
        onSupprimer={(id) => void supprimerVarianteNatation(id)}
        onglets={NIVEAUX_ONGLETS}
        couleurActif="bg-[#059669] text-white"
      />
      <div className="flex flex-col gap-2 rounded-lg border border-emerald-200/60 bg-white/60 p-3 text-sm dark:border-emerald-800 dark:bg-emerald-950/30">
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 flex-1 font-medium text-neutral-900 dark:text-neutral-50">
            {blocs ? 'Blocs personnalisés' : 'Structure de la séance'}
          </p>
          <Button type="button" size="sm" variant="outline" onClick={() => setModaleBlocs(true)} className="shrink-0">
            <Pencil className="mr-1 size-3" /> Modifier
          </Button>
        </div>
        <div className="flex flex-col gap-1.5">
          {blocsAffiches.map((b, i) => (
            <BlocNatationLigne key={i} bloc={b} />
          ))}
        </div>
      </div>
      {phase ? (
        <BannerSuggestionGaia
          phase={phase}
          message={messagePourcentageGaia(phase, pourcentages[phase])}
          modeActif={mode}
          onChangerMode={setMode}
        />
      ) : null}
      <div>
        <p className="text-xs text-neutral-500">Distance réelle nagée (m)</p>
        <Input
          type="number"
          min={0}
          value={distReelle}
          onChange={(e) => setDistReelle(e.target.value)}
          className="border-emerald-200 dark:border-emerald-800"
          placeholder={`ex. ${distanceCible}`}
        />
      </div>
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="border-emerald-200 text-sm dark:border-emerald-800" placeholder="Notes (optionnel)" />
      <div>
        <p className="mb-1 text-xs font-semibold text-[#059669] dark:text-emerald-200">Ressenti</p>
        <div className="flex flex-wrap justify-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRes(i === res ? 0 : i)}
              className={cn(
                'rounded-full border-2 p-2 text-lg',
                i === res ? 'border-[#059669] bg-emerald-100 dark:bg-emerald-900/50' : 'border-transparent'
              )}
            >
              {RESS[i - 1]}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-[#059669]/30 bg-[#ECFDF5] px-4 py-3 text-sm text-[#065F46] dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
        <p className="font-semibold">Bilan</p>
        <p>
          Niveau {niv} · {totalM} m prévus{mode === 'gaia' && totalM !== effectif.distanceTotale ? ' (ajusté)' : ''} · Nage libre + Brasse
        </p>
      </div>
      {userId ? (
        <MacrosSeanceCard
          typeSeance="natation"
          userId={userId}
          phase={phase ?? 'folliculaire'}
          workoutId={seanceExistante?.id}
          seanceExistante={seanceExistante ?? null}
        />
      ) : null}
      <Button onClick={() => void save()} disabled={ch} className="w-full bg-[#059669] hover:bg-emerald-700">
        {ch ? '…' : edit ? 'Mettre à jour' : 'Enregistrer'}
      </Button>
      {modaleBlocs ? (
        <ModaleEditBlocsNatation
          niveauActuel={niv}
          blocsActuels={blocs ?? []}
          onFermer={() => setModaleBlocs(false)}
          onSauvegarde={sauvegarderBlocsNatation}
        />
      ) : null}
    </div>
  )
}
