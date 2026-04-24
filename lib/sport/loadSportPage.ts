import { format, parseISO, startOfWeek } from 'date-fns'
import { getDonneesCyclePourAffichage } from '@/lib/db/cycles'
import { getSeancesDuJour } from '@/lib/db/workouts'
import { creerClientServeur } from '@/lib/supabase-server'
import { getCycleDay, getPhaseAvecStats } from '@/lib/cycle'
import { PLANNING_DEFAUT } from '@/lib/planning-sport'
import { DEFAULT_MODE_UTILISATEUR } from '@/types'
import type { Phase, PlanningSport, WorkoutMuscuComplet, WorkoutNatationComplet, WorkoutYogaComplet } from '@/types'

export interface SportPageInitial {
  date: string
  weekStart: string
  userId: string
  prenom: string
  sansCycle: boolean
  phase: Phase | null
  jourDuCycle: number | null
  cycleLength: number
  seances: {
    muscu: WorkoutMuscuComplet | null
    natation: WorkoutNatationComplet | null
    yoga: WorkoutYogaComplet | null
  }
  planning: PlanningSport
}

export async function loadSportPage(): Promise<SportPageInitial> {
  const maintenant = new Date()
  const date = format(maintenant, 'yyyy-MM-dd')
  const weekStart = format(startOfWeek(maintenant, { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const prenom =
    user?.user_metadata?.full_name?.trim().split(/\s+/)[0] ??
    user?.user_metadata?.first_name?.trim() ??
    user?.email?.split('@')[0] ??
    'toi'

  const [donnees, seances] = await Promise.all([
    getDonneesCyclePourAffichage(),
    getSeancesDuJour(date),
  ])

  const { prefs, stats, effectiveStart, cycleLength } = donnees
  const sansCycle = (prefs?.mode_utilisateur ?? DEFAULT_MODE_UTILISATEUR) === 'sans_cycle'

  let phase: Phase | null = null
  let jourDuCycle: number | null = null
  if (!sansCycle && effectiveStart) {
    jourDuCycle = getCycleDay(parseISO(effectiveStart), maintenant, cycleLength)
    phase = getPhaseAvecStats(jourDuCycle, stats, cycleLength)
  }

  return {
    date,
    weekStart,
    userId: user?.id ?? '',
    prenom,
    sansCycle,
    phase,
    jourDuCycle,
    cycleLength,
    seances,
    planning: prefs?.planning_sport ?? PLANNING_DEFAUT,
  }
}
