'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipForward, SkipBack, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PostureYoga } from '@/types'

type StatutTimer = 'idle' | 'en_cours' | 'pause' | 'termine'

interface TimerYogaProps {
  postures: PostureYoga[]
  onTermine?: () => void
}

function formaterTemps(sec: number): string {
  return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`
}

export function TimerYoga({ postures, onTermine }: TimerYogaProps) {
  const [statut, setStatut] = useState<StatutTimer>('idle')
  const [index, setIndex] = useState(0)
  const [tempsRestant, setTempsRestant] = useState(postures[0]?.dureeSec ?? 0)
  const [coches, setCoches] = useState<Set<number>>(new Set())
  const onTermineRef = useRef(onTermine)
  useEffect(() => { onTermineRef.current = onTermine }, [onTermine])

  // Décompte : avance toutes les secondes
  useEffect(() => {
    if (statut !== 'en_cours') return
    if (tempsRestant <= 0) return
    const timer = setTimeout(() => {
      if (tempsRestant - 1 <= 0) {
        setCoches((prev) => new Set([...prev, index]))
        if (index < postures.length - 1) {
          setIndex(index + 1)
          setTempsRestant(postures[index + 1].dureeSec)
        } else {
          setStatut('termine')
          onTermineRef.current?.()
        }
      } else {
        setTempsRestant((t) => t - 1)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [statut, tempsRestant, index, postures])

  function allerPosture(i: number) {
    setIndex(i)
    setTempsRestant(postures[i].dureeSec)
  }

  function reinitialiser() {
    setStatut('idle')
    setIndex(0)
    setTempsRestant(postures[0]?.dureeSec ?? 0)
    setCoches(new Set())
  }

  function toggleCoche(i: number) {
    setCoches((prev) => {
      const s = new Set(prev)
      s.has(i) ? s.delete(i) : s.add(i)
      return s
    })
  }

  const postureActuelle = postures[index]
  const progression = postureActuelle
    ? Math.round(((postureActuelle.dureeSec - tempsRestant) / postureActuelle.dureeSec) * 100)
    : 0

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-4">

      {/* Posture active + timer */}
      {statut !== 'idle' && statut !== 'termine' && postureActuelle && (
        <div className="flex flex-col gap-3 text-center">
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-wide">{index + 1} / {postures.length}</p>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">{postureActuelle.nom}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{postureActuelle.benefice}</p>
          </div>
          <p className="text-5xl font-mono font-bold text-neutral-900 dark:text-neutral-50">
            {formaterTemps(tempsRestant)}
          </p>
          {/* Barre de progression */}
          <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div className="h-1.5 rounded-full bg-neutral-900 dark:bg-white transition-all" style={{ width: `${progression}%` }} />
          </div>
          {/* Contrôles */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" disabled={index === 0} onClick={() => allerPosture(index - 1)} className="h-9 w-9">
              <SkipBack size={15} />
            </Button>
            <Button onClick={() => setStatut(statut === 'en_cours' ? 'pause' : 'en_cours')} className="h-9 px-6">
              {statut === 'en_cours' ? <><Pause size={15} className="mr-1" /> Pause</> : <><Play size={15} className="mr-1" /> Reprendre</>}
            </Button>
            <Button variant="outline" size="icon" disabled={index === postures.length - 1} onClick={() => allerPosture(index + 1)} className="h-9 w-9">
              <SkipForward size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* Fin de séance */}
      {statut === 'termine' && (
        <div className="text-center flex flex-col gap-3">
          <p className="text-2xl">🧘</p>
          <p className="font-semibold text-neutral-900 dark:text-neutral-50">Séance terminée !</p>
          <Button variant="outline" size="sm" onClick={reinitialiser} className="mx-auto flex items-center gap-1.5">
            <RefreshCw size={13} /> Recommencer
          </Button>
        </div>
      )}

      {/* Liste des postures (toujours visible) */}
      <div className="flex flex-col gap-1.5">
        {statut === 'idle' && (
          <Button onClick={() => setStatut('en_cours')} className="w-full mb-1 flex items-center gap-2">
            <Play size={14} /> Démarrer la séance guidée
          </Button>
        )}
        {postures.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              toggleCoche(i)
              if (statut !== 'idle' && statut !== 'termine') allerPosture(i)
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm
              ${i === index && statut !== 'idle' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'}
              ${coches.has(i) ? 'opacity-50 line-through' : ''}`}
          >
            <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px]
              ${coches.has(i) ? 'bg-neutral-400 border-neutral-400 text-white' : 'border-neutral-300 dark:border-neutral-600'}`}>
              {coches.has(i) ? '✓' : ''}
            </span>
            <span className="flex-1">{p.nom}</span>
            <span className="text-[11px] opacity-60 shrink-0">{formaterTemps(p.dureeSec)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
