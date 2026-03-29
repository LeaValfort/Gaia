'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { loggerSeanceNatation } from '@/lib/db/workouts'
import { NIVEAUX_DETAIL, getNiveauDetail } from '@/lib/data/swimming'
import { SWIM_LEVEL_MIN, SWIM_LEVEL_MAX, ECHAUFFEMENT_NATATION } from '@/types'
import { format } from 'date-fns'

export function OngletNatation() {
  const router = useRouter()
  const [niveau, setNiveau] = useState(1)
  const [crawl, setCrawl] = useState('')
  const [brasse, setBrasse] = useState('')
  const [notes, setNotes] = useState('')
  const [ressenti, setRessenti] = useState(0)
  const [chargement, setChargement] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)

  const niveauInfo = getNiveauDetail(niveau)
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
          crawlM: parseInt(crawl) || niveauInfo.crawlM,
          breaststrokeM: parseInt(brasse) || niveauInfo.brasseM,
          blockStructure: niveauInfo.structure,
        },
      })
      setSauvegarde(true)
      setCrawl('')
      setBrasse('')
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
        <div className="flex flex-col gap-2">
          {Array.from({ length: SWIM_LEVEL_MAX - SWIM_LEVEL_MIN + 1 }, (_, i) => i + SWIM_LEVEL_MIN).map((n) => (
            <button key={n} onClick={() => setNiveau(n)}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all
                ${niveau === n ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
              <span className={`text-xs font-bold shrink-0 mt-0.5 w-16
                ${niveau === n ? 'text-white/70 dark:text-neutral-900/60' : 'text-neutral-400'}`}>
                Niv. {n}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm block">{NIVEAUX_DETAIL[n - 1].nom}</span>
                <span className={`text-xs block mt-0.5 ${niveau === n ? 'opacity-80' : 'opacity-60'}`}>
                  {NIVEAUX_DETAIL[n - 1].description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Détail du niveau sélectionné */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Structure de la séance</p>

        {/* Échauffement — commun à tous les niveaux */}
        <div className="flex items-start gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-400 w-16 shrink-0 mt-0.5">Éch.</span>
          <span className="text-sm text-neutral-600 dark:text-neutral-300">{ECHAUFFEMENT_NATATION} <span className="font-semibold">= 150 m</span></span>
        </div>

        {/* Exercice technique — spécifique au niveau */}
        <div className="flex items-start gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-400 w-16 shrink-0 mt-0.5">Drill</span>
          <span className="text-sm text-neutral-600 dark:text-neutral-300">{niveauInfo.exerciceTechnique} <span className="font-semibold">= 100 m</span></span>
        </div>

        {/* Set principal */}
        <div className="flex items-start gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-400 w-16 shrink-0 mt-0.5">Set</span>
          <span className="text-lg font-mono font-bold text-neutral-900 dark:text-neutral-50">{niveauInfo.structure}</span>
        </div>

        {/* Distances + critère */}
        <div className="flex flex-wrap gap-3 text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          <span>🏊 Crawl : {niveauInfo.crawlM} m</span>
          <span>🤽 Brasse : {niveauInfo.brasseM} m</span>
          <span>📏 Total : {niveauInfo.distanceTotale} m</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <ChevronRight size={13} className="shrink-0 mt-0.5" />
          <span><span className="font-medium">Critère niveau suivant :</span> {niveauInfo.critere}</span>
        </div>
      </div>

      {/* Distances réelles */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Crawl (m)</p>
          <Input type="number" min={0} placeholder={String(niveauInfo.crawlM)} value={crawl} onChange={(e) => setCrawl(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Brasse (m)</p>
          <Input type="number" min={0} placeholder={String(niveauInfo.brasseM)} value={brasse} onChange={(e) => setBrasse(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Total</p>
          <div className="h-10 px-3 flex items-center rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-semibold">
            {totalM > 0 ? `${totalM} m` : `${niveauInfo.distanceTotale} m (réf.)`}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Notes</p>
        <Textarea placeholder="Observations, difficultés, ressentis..." value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none text-sm" rows={2} />
      </div>

      {/* Ressenti */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Ressenti</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button key={val} onClick={() => setRessenti(val)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all
                ${ressenti === val ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 scale-110' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
              {val}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={sauvegarder} disabled={chargement} className="w-full sm:w-auto sm:self-start">
        {chargement ? 'Sauvegarde...' : sauvegarde ? '✓ Séance enregistrée !' : 'Enregistrer la séance'}
      </Button>
    </div>
  )
}
