'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loggerSeanceNatation } from '@/lib/db/workouts'
import { NIVEAUX_NATATION } from '@/lib/sport'
import { format } from 'date-fns'
import { SWIM_LEVEL_MIN, SWIM_LEVEL_MAX } from '@/types'

export function OngletNatation() {
  const router = useRouter()
  const [niveau, setNiveau] = useState(1)
  const [crawl, setCrawl] = useState('')
  const [brasse, setBrasse] = useState('')
  const [structure, setStructure] = useState('')
  const [ressenti, setRessenti] = useState(0)
  const [notes, setNotes] = useState('')
  const [chargement, setChargement] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)

  const niveauInfo = NIVEAUX_NATATION[niveau]
  const totalM = (parseInt(crawl) || 0) + (parseInt(brasse) || 0)

  async function sauvegarder() {
    setChargement(true)
    try {
      await loggerSeanceNatation({
        date: format(new Date(), 'yyyy-MM-dd'),
        feeling: ressenti || null,
        notes: notes || null,
        natation: {
          level: niveau,
          totalDistance: totalM || niveauInfo.distanceTotale,
          crawlM: parseInt(crawl) || 0,
          breaststrokeM: parseInt(brasse) || 0,
          blockStructure: structure || niveauInfo.description,
        },
      })
      setSauvegarde(true)
      setCrawl('')
      setBrasse('')
      setStructure('')
      setNotes('')
      setRessenti(0)
      setTimeout(() => setSauvegarde(false), 3000)
      router.refresh()
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Sélection du niveau */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Niveau actuel</p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: SWIM_LEVEL_MAX - SWIM_LEVEL_MIN + 1 }, (_, i) => i + SWIM_LEVEL_MIN).map((n) => (
            <button
              key={n}
              onClick={() => setNiveau(n)}
              className={`flex-1 min-w-[120px] px-3 py-2.5 rounded-xl text-sm transition-all text-left
                ${niveau === n ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}
            >
              <span className="font-semibold block">{NIVEAUX_NATATION[n].label}</span>
              <span className="text-xs opacity-70">{NIVEAUX_NATATION[n].description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Distances */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Crawl (m)</p>
          <Input type="number" min={0} placeholder="ex : 750" value={crawl} onChange={(e) => setCrawl(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Brasse (m)</p>
          <Input type="number" min={0} placeholder="ex : 250" value={brasse} onChange={(e) => setBrasse(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Total</p>
          <div className="h-10 px-3 flex items-center rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {totalM > 0 ? `${totalM} m` : `${niveauInfo.distanceTotale} m (ref.)`}
          </div>
        </div>
      </div>

      {/* Structure des blocs */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Structure des blocs</p>
        <Input placeholder={niveauInfo.description} value={structure} onChange={(e) => setStructure(e.target.value)} />
      </div>

      {/* Ressenti */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Ressenti</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button key={val} onClick={() => setRessenti(val)} className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${ressenti === val ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 scale-110' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>{val}</button>
          ))}
        </div>
      </div>

      <Button onClick={sauvegarder} disabled={chargement} className="w-full sm:w-auto sm:self-start">
        {chargement ? 'Sauvegarde...' : sauvegarde ? '✓ Séance enregistrée !' : 'Enregistrer la séance'}
      </Button>
    </div>
  )
}
