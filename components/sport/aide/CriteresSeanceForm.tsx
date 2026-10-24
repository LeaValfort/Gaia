'use client'

import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DUREES_AIDE, MATERIEL_AIDE, NIVEAUX_AIDE, OBJECTIFS_AIDE, SPORTS_AVEC_MATERIEL, ZONES_AIDE } from '@/lib/data/aide-seance'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import { cn } from '@/lib/utils'
import type { CriteresSeance, Phase } from '@/types'

const PILL = 'rounded-full border px-2.5 py-1 text-xs transition-colors'
const ACTIF = 'border-amber-600 bg-amber-600 text-white'
const INACTIF = 'border-neutral-200 text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-200'

interface CriteresSeanceFormProps {
  criteres: CriteresSeance
  /** Phase du jour, proposée pour adapter la séance. */
  phaseDuJour: Phase | null
  onChange: (c: CriteresSeance) => void
}

function Groupe({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{titre}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

/** Questions de l'assistant : objectif, niveau, durée, matériel, zones, envies, phase. */
export function CriteresSeanceForm({ criteres: c, phaseDuJour, onChange }: CriteresSeanceFormProps) {
  const maj = (u: Partial<CriteresSeance>) => onChange({ ...c, ...u })
  const basculer = (liste: string[], v: string) => (liste.includes(v) ? liste.filter((x) => x !== v) : [...liste, v])
  const pill = (actif: boolean, label: string, onClick: () => void) => (
    <button key={label} type="button" onClick={onClick} className={cn(PILL, actif ? ACTIF : INACTIF)}>
      {label}
    </button>
  )

  return (
    <div className="space-y-4">
      <Groupe titre="Objectif">{OBJECTIFS_AIDE[c.sport].map((o) => pill(c.objectif === o, o, () => maj({ objectif: o })))}</Groupe>
      <Groupe titre="Niveau">{NIVEAUX_AIDE.map((n) => pill(c.niveau === n, n, () => maj({ niveau: n })))}</Groupe>
      <Groupe titre="Durée">{DUREES_AIDE.map((d) => pill(c.duree_min === d, `${d} min`, () => maj({ duree_min: d })))}</Groupe>
      {SPORTS_AVEC_MATERIEL.includes(c.sport) ? (
        <Groupe titre="Matériel">{MATERIEL_AIDE.map((m) => pill(c.materiel.includes(m), m, () => maj({ materiel: basculer(c.materiel, m) })))}</Groupe>
      ) : null}
      <Groupe titre="Zones / focus">{ZONES_AIDE[c.sport].map((z) => pill(c.zones.includes(z), z, () => maj({ zones: basculer(c.zones, z) })))}</Groupe>
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Envies ou à éviter</p>
        <Textarea
          rows={2}
          value={c.envies}
          onChange={(e) => maj({ envies: e.target.value })}
          placeholder="Ex. pas de sauts (genoux), j'adore les fentes, finir par des étirements…"
          className="text-sm"
        />
      </div>
      {phaseDuJour ? (
        <label className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2 text-sm dark:bg-neutral-800/60">
          <span>Adapter à ma phase ({PHASES_DESIGN[phaseDuJour].label})</span>
          <Switch checked={c.phase != null} onCheckedChange={(v) => maj({ phase: v ? phaseDuJour : null })} />
        </label>
      ) : null}
    </div>
  )
}
