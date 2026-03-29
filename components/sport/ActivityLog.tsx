'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PillsSelector } from '@/components/cycle/PillsSelector'
import { ChronoTimer } from './ChronoTimer'
import { SPORTS_CONFIG, FEELINGS, ACTIVITY_LOG_INITIAL, getSportConfig, type ConfigChamp } from '@/lib/data/sportsConfig'
import { loggerActivite } from '@/lib/db/activities'
import type { ActivityLogFormData, TypeActivite } from '@/types'
import { format } from 'date-fns'

// Formate une allure décimale en "X'YY''/km"
function formaterAllure(allureDecimal: number): string {
  const min = Math.floor(allureDecimal)
  const sec = Math.round((allureDecimal - min) * 60)
  return `${min}'${String(sec).padStart(2, '0')}''`
}

export function ActivityLog() {
  const router = useRouter()
  const [formData, setFormData] = useState<ActivityLogFormData>(ACTIVITY_LOG_INITIAL)
  const [chargement, setChargement] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)

  const sportType = formData.sport_type
  const config = sportType ? getSportConfig(sportType) : null

  // Calculs automatiques vitesse / allure
  const dist = parseFloat(formData.distance_km) || 0
  const dur  = parseFloat(formData.duration_min) || 0
  const vitesse  = sportType === 'velo'   && dist > 0 && dur > 0 ? Math.round((dist / (dur / 60)) * 10) / 10 : null
  const allureD  = sportType === 'course' && dist > 0 && dur > 0 ? dur / dist : null
  const allureStr = allureD ? formaterAllure(Math.round(allureD * 10) / 10) : null

  function set(champ: keyof ActivityLogFormData, val: string) {
    setFormData((p) => ({ ...p, [champ]: val }))
  }

  function choisirSport(type: TypeActivite) {
    setFormData({ ...ACTIVITY_LOG_INITIAL, sport_type: type })
  }

  function renderChamp(champ: ConfigChamp) {
    const valeur = formData[champ.cle] as string
    const label = champ.label + (champ.unite ? ` (${champ.unite})` : '') + (champ.optionnel ? ' — optionnel' : '')
    return (
      <div key={champ.cle} className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">{label}</p>
        {champ.type === 'duree' ? (
          <div className="flex flex-col gap-2">
            <Input type="number" min={0} value={valeur} onChange={(e) => set(champ.cle, e.target.value)} placeholder="ex: 45" />
            <ChronoTimer onDuration={(m) => set(champ.cle, String(m))} />
          </div>
        ) : (
          <Input type={champ.type === 'nombre' ? 'number' : 'text'} min={0} value={valeur}
            onChange={(e) => set(champ.cle, e.target.value)} placeholder={champ.placeholder ?? ''} />
        )}
      </div>
    )
  }

  async function sauvegarder() {
    if (!sportType) return
    setChargement(true)
    try {
      await loggerActivite({ ...formData, date: format(new Date(), 'yyyy-MM-dd') })
      setSauvegarde(true)
      setFormData(ACTIVITY_LOG_INITIAL)
      setTimeout(() => setSauvegarde(false), 3000)
      router.refresh()
    } finally { setChargement(false) }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Sélection du sport */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Quel sport ?</p>
        <div className="flex flex-wrap gap-2">
          {SPORTS_CONFIG.map((s) => (
            <button key={s.type} type="button" onClick={() => choisirSport(s.type)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border
                ${sportType === s.type
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'}`}>
              <s.Icone size={14} />
              {s.nom}
            </button>
          ))}
        </div>
      </div>

      {/* Champs dynamiques selon le sport */}
      {config && (
        <div className="flex flex-col gap-4">
          {config.champs.map(renderChamp)}
        </div>
      )}

      {/* Vitesse / Allure calculées */}
      {vitesse && (
        <div className="flex items-center gap-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 px-4 py-2.5 text-sm">
          ⚡ Vitesse moyenne : <span className="font-semibold ml-1">{vitesse} km/h</span>
        </div>
      )}
      {allureStr && (
        <div className="flex items-center gap-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 px-4 py-2.5 text-sm">
          🏃 Allure moyenne : <span className="font-semibold ml-1">{allureStr} /km</span>
        </div>
      )}

      {/* Ressenti + Notes (communs à tous les sports) */}
      {sportType && (
        <>
          <PillsSelector label="Ressenti" options={FEELINGS}
            selected={formData.feeling ? [formData.feeling] : []}
            onChange={(v) => set('feeling', v[0] ?? '')}
            multiSelect={false}
          />
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Notes — optionnel</p>
            <Textarea value={formData.notes} onChange={(e) => set('notes', e.target.value)}
              placeholder="Observations, lieu, conditions..." className="resize-none text-sm" rows={2} />
          </div>
          <Button onClick={sauvegarder} disabled={chargement} className="w-full sm:w-auto sm:self-start">
            {chargement ? 'Sauvegarde...' : sauvegarde ? '✓ Activité enregistrée !' : 'Enregistrer l\'activité'}
          </Button>
        </>
      )}
    </div>
  )
}
