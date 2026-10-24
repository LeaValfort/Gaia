'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SelecteurRecurrence } from '@/components/parametres/SelecteurRecurrence'
import { SPORTS_CONFIG } from '@/lib/data/sportsConfig'
import { LABELS_PLANNING } from '@/lib/planning-sport'
import { cn } from '@/lib/utils'
import type { ModeleSeance, NouvellePlanningSportEntry, SportVariante, TypeActivite, TypeVarianteSport } from '@/types'

/** Choix du sport : un type à programmes (muscu, natation, yoga) ou une activité « autre sport ». */
type ChoixSport = { type: TypeVarianteSport } | { type: 'autre'; activite: TypeActivite }

const TYPES_PROGRAMMES: TypeVarianteSport[] = ['muscu_full', 'muscu_upper', 'natation', 'yoga']
const PILL = 'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors'
const PILL_ACTIVE = 'border-amber-600 bg-amber-600 text-white'
const PILL_INACTIF = 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100'

interface AjoutSeancePlanningProps {
  variantesParType: Record<TypeVarianteSport, SportVariante[]>
  modeles: ModeleSeance[]
  /** Autres sports déjà pratiqués : proposés même sans modèle. */
  activitesLoggees: TypeActivite[]
  enCours: boolean
  onValider: (entree: Omit<NouvellePlanningSportEntry, 'jour_semaine'>) => void
  onAnnuler: () => void
}

/** Ajout d'une séance au planning : sport → programme / modèle → fréquence → Valider. */
export function AjoutSeancePlanning({ variantesParType, modeles, activitesLoggees, enCours, onValider, onAnnuler }: AjoutSeancePlanningProps) {
  const [sport, setSport] = useState<ChoixSport | null>(null)
  // id d'une variante (muscu/natation/yoga) ou d'un modèle (autres sports) ; null = par défaut
  const [programme, setProgramme] = useState<string | null>(null)
  const [recurrence, setRecurrence] = useState({ intervalle: 1, decalage: 0 })
  const [tousLesSports, setTousLesSports] = useState(false)

  // Sports proposés : ceux qui ont déjà un modèle de séance ou des séances enregistrées.
  const connus = new Set<TypeActivite>([...modeles.map((m) => m.sport_type), ...activitesLoggees])
  const autresSports = SPORTS_CONFIG.filter((s) => s.type !== 'natation_libre' && (tousLesSports || connus.has(s.type)))

  const choisir = (s: ChoixSport) => {
    setSport(s)
    setProgramme(null)
  }
  const estChoisi = (s: ChoixSport) =>
    sport?.type === s.type && (s.type !== 'autre' || (sport.type === 'autre' && sport.activite === s.activite))

  const options: { id: string; nom: string }[] = !sport
    ? []
    : sport.type === 'autre'
      ? modeles.filter((m) => m.sport_type === sport.activite).map((m) => ({ id: m.id, nom: m.nom }))
      : variantesParType[sport.type].map((v) => ({ id: v.id, nom: v.lieu === 'maison' || v.lieu === 'salle' ? `${v.nom} (${v.lieu})` : v.nom }))

  function valider() {
    if (!sport) return
    const base = { intervalle_semaines: recurrence.intervalle, decalage_semaine: recurrence.decalage }
    if (sport.type === 'autre') onValider({ ...base, type_seance: 'autre', activite_type: sport.activite, modele_id: programme })
    else onValider({ ...base, type_seance: sport.type, variante_id: programme })
  }

  return (
    <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3 dark:border-amber-900/50 dark:bg-amber-950/10">
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">1. Sport</p>
        <div className="flex flex-wrap gap-1.5">
          {TYPES_PROGRAMMES.map((t) => (
            <button key={t} type="button" onClick={() => choisir({ type: t })} className={cn(PILL, estChoisi({ type: t }) ? PILL_ACTIVE : PILL_INACTIF)}>
              {LABELS_PLANNING[t].emoji} {LABELS_PLANNING[t].label}
            </button>
          ))}
          {autresSports.map((s) => (
            <button
              key={s.type}
              type="button"
              onClick={() => choisir({ type: 'autre', activite: s.type })}
              className={cn(PILL, estChoisi({ type: 'autre', activite: s.type }) ? PILL_ACTIVE : PILL_INACTIF)}
            >
              {s.nom}
            </button>
          ))}
          {!tousLesSports ? (
            <button type="button" onClick={() => setTousLesSports(true)} className={cn(PILL, 'border-dashed border-neutral-300 text-muted-foreground dark:border-neutral-700')}>
              Autre sport…
            </button>
          ) : null}
        </div>
      </div>

      {sport ? (
        <>
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              2. {sport.type === 'autre' ? 'Séance' : 'Programme'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setProgramme(null)} className={cn(PILL, programme === null ? PILL_ACTIVE : PILL_INACTIF)}>
                Séance libre (choisie le jour même)
              </button>
              {options.map((o) => (
                <button key={o.id} type="button" onClick={() => setProgramme(o.id)} className={cn(PILL, programme === o.id ? PILL_ACTIVE : PILL_INACTIF)}>
                  {o.nom}
                </button>
              ))}
            </div>
            {sport.type === 'autre' && !options.length ? (
              <p className="text-[11px] text-muted-foreground">Pas encore de modèle pour ce sport : enregistre une séance comme modèle sur la page Sport.</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">3. Fréquence</p>
            <SelecteurRecurrence
              intervalleSemaines={recurrence.intervalle}
              decalageSemaine={recurrence.decalage}
              onChange={(intervalle, decalage) => setRecurrence({ intervalle, decalage })}
            />
          </div>
        </>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={onAnnuler}>
          Annuler
        </Button>
        <Button type="button" size="sm" disabled={!sport || enCours} onClick={valider} className="bg-amber-600 text-white hover:bg-amber-700">
          {enCours ? 'Ajout…' : 'Valider'}
        </Button>
      </div>
    </div>
  )
}
