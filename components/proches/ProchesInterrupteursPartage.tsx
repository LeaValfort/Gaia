'use client'

import { Bell } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import type { PatchProcheConnection } from '@/lib/db/proches'
import type { Dispatch, SetStateAction } from 'react'

export function ProchesInterrupteursPartage({
  sync,
  vp,
  setVp,
  ve,
  setVe,
  vd,
  setVd,
  vh,
  setVh,
  vc,
  setVc,
  vl,
  setVl,
  vs,
  setVs,
  r1,
  setR1,
  r2,
  setR2,
  r3,
  setR3,
}: {
  sync: (p: PatchProcheConnection) => void
  vp: boolean
  setVp: Dispatch<SetStateAction<boolean>>
  ve: boolean
  setVe: Dispatch<SetStateAction<boolean>>
  vd: boolean
  setVd: Dispatch<SetStateAction<boolean>>
  vh: boolean
  setVh: Dispatch<SetStateAction<boolean>>
  vc: boolean
  setVc: Dispatch<SetStateAction<boolean>>
  vl: boolean
  setVl: Dispatch<SetStateAction<boolean>>
  vs: boolean
  setVs: Dispatch<SetStateAction<boolean>>
  r1: boolean
  setR1: Dispatch<SetStateAction<boolean>>
  r2: boolean
  setR2: Dispatch<SetStateAction<boolean>>
  r3: boolean
  setR3: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <>
      <div>
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-2">CE QU’IL VOIT</p>
        <div className="flex flex-col gap-2">
          <L sync={sync} k="voir_phase" v={vp} set={setVp} label="🌙 Phase du cycle" />
          <L sync={sync} k="voir_energie" v={ve} set={setVe} label="⚡ Niveau d’énergie" />
          <L sync={sync} k="voir_douleur" v={vd} set={setVd} label="😣 Niveau de douleur" />
          <L sync={sync} k="voir_humeur" v={vh} set={setVh} label="😊 Humeur" />
          <L sync={sync} k="voir_conseils" v={vc} set={setVc} label="💡 Conseils adaptés" />
          <Hint
            sync={sync}
            k="voir_libido"
            v={vl}
            set={setVl}
            label="🔥 Libido"
            hint="ℹ️ Désactivé par défaut — info sensible"
          />
          <Hint
            sync={sync}
            k="voir_symptomes"
            v={vs}
            set={setVs}
            label="🤒 Symptômes"
            hint="Active aussi le détail au clic sur la douleur"
          />
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300 flex items-center gap-1 mb-2">
          <Bell size={12} /> Notifications proche (v1 — rappels à brancher)
        </p>
        <div className="flex flex-col gap-2">
          <L sync={sync} k="notif_debut_regles" v={r1} set={setR1} label="🩸 Début des règles" />
          <L sync={sync} k="notif_energie_basse" v={r2} set={setR2} label="⚡ Énergie basse" />
          <L sync={sync} k="notif_douleur_haute" v={r3} set={setR3} label="😣 Douleur élevée" />
        </div>
      </div>
    </>
  )
}

function Hint<K extends keyof PatchProcheConnection>({
  k,
  v,
  set,
  label,
  hint,
  sync,
}: {
  k: K
  v: boolean
  set: Dispatch<SetStateAction<boolean>>
  label: string
  hint: string
  sync: (p: PatchProcheConnection) => void
}) {
  return (
    <div className="space-y-0.5">
      <label className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <Switch
          size="sm"
          checked={v}
          onCheckedChange={(c) => {
            const nv = Boolean(c)
            set(nv)
            void sync({ [k]: nv } as PatchProcheConnection)
          }}
        />
      </label>
      <p className="text-xs text-neutral-400 dark:text-neutral-500 pl-0.5">{hint}</p>
    </div>
  )
}

function L<K extends keyof PatchProcheConnection>({
  k,
  v,
  set,
  label,
  sync,
}: {
  k: K
  v: boolean
  set: Dispatch<SetStateAction<boolean>>
  label: string
  sync: (p: PatchProcheConnection) => void
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <Switch
        size="sm"
        checked={v}
        onCheckedChange={(c) => {
          const nv = Boolean(c)
          set(nv)
          void sync({ [k]: nv } as PatchProcheConnection)
        }}
      />
    </label>
  )
}
