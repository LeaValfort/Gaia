'use client'

// Chronomètre qui compte de 0 vers le haut.
// Quand on met en pause, il remplit automatiquement le champ durée via onDuration.

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface ChronoTimerProps {
  onDuration: (minutes: number) => void
}

type StatutChrono = 'idle' | 'running' | 'paused'

export function ChronoTimer({ onDuration }: ChronoTimerProps) {
  const [statut, setStatut] = useState<StatutChrono>('idle')
  const [elapsed, setElapsed] = useState(0) // secondes
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (statut === 'running') {
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [statut])

  function formater(sec: number): string {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function pauser() {
    setStatut('paused')
    onDuration(Math.max(1, Math.round(elapsed / 60)))
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 w-fit">
      <span className="font-mono text-base font-semibold text-neutral-900 dark:text-neutral-50 w-16 tabular-nums">
        {formater(elapsed)}
      </span>
      <div className="flex gap-1.5">
        {statut !== 'running' ? (
          <button type="button" onClick={() => setStatut('running')}
            className="w-7 h-7 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center hover:opacity-80 transition-opacity">
            <Play size={12} />
          </button>
        ) : (
          <button type="button" onClick={pauser}
            className="w-7 h-7 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center hover:opacity-80 transition-opacity">
            <Pause size={12} />
          </button>
        )}
        <button type="button" onClick={() => { setStatut('idle'); setElapsed(0) }}
          className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center hover:opacity-80 transition-opacity">
          <RotateCcw size={12} />
        </button>
      </div>
      {statut === 'paused' && (
        <span className="text-xs text-violet-500 dark:text-violet-400">→ durée pré-remplie</span>
      )}
    </div>
  )
}
