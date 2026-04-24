import { Activity, HeartPulse, Zap } from 'lucide-react'
import { StatCardProgression } from '@/components/progression/StatCardProgression'
import type { StatsResume } from '@/types'

export function ProgressionStatsRow({ stats }: { stats: StatsResume }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCardProgression label="Séances" value={stats.seancesCeMois} sub="ce mois" icon={<Activity size={12} />} />
      <StatCardProgression
        label="Énergie"
        value={stats.energieMoyenne ?? '—'}
        sub="moy. sur 5"
        labelClass="text-amber-600 dark:text-amber-400"
        icon={<Zap size={12} />}
      />
      <StatCardProgression
        label="Douleur"
        value={stats.douleurMoyenne ?? '—'}
        sub="moy. sur 10"
        labelClass="text-teal-600 dark:text-teal-400"
        icon={<HeartPulse size={12} />}
      />
    </div>
  )
}

export function ProgressionStatsCol({ stats }: { stats: StatsResume }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <StatCardProgression label="Séances" value={stats.seancesCeMois} sub="ce mois" icon={<Activity size={12} />} />
      <StatCardProgression
        label="Énergie moy."
        value={stats.energieMoyenne ?? '—'}
        sub="sur 5"
        labelClass="text-amber-600 dark:text-amber-400"
        icon={<Zap size={12} />}
      />
      <StatCardProgression
        label="Douleur moy."
        value={stats.douleurMoyenne ?? '—'}
        sub="sur 10"
        labelClass="text-teal-600 dark:text-teal-400"
        icon={<HeartPulse size={12} />}
      />
    </div>
  )
}
