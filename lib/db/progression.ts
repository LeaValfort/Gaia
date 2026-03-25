'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import { format, startOfWeek, subWeeks, endOfWeek, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export interface PointEnergieDouleur {
  date: string
  energie: number | null
  douleur: number | null
}

export interface PointSport {
  semaine: string
  seances: number
}

export interface StatsResume {
  seancesCeMois: number
  energieMoyenne: number | null
  douleurMoyenne: number | null
}

/**
 * Récupère les logs énergie/douleur des N derniers jours.
 */
export async function getDataEnergieDouleur(nbJours = 60): Promise<PointEnergieDouleur[]> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const depuis = new Date()
    depuis.setDate(depuis.getDate() - nbJours)

    const { data, error } = await supabase
      .from('daily_logs')
      .select('date, energy, pain')
      .eq('user_id', user.id)
      .gte('date', format(depuis, 'yyyy-MM-dd'))
      .order('date', { ascending: true })

    if (error) throw error

    return (data ?? []).map((row) => ({
      date: format(parseISO(row.date), 'd MMM', { locale: fr }),
      energie: row.energy ?? null,
      douleur: row.pain ?? null,
    }))
  } catch (erreur) {
    console.error('Erreur getDataEnergieDouleur:', erreur)
    return []
  }
}

/**
 * Récupère le nombre de séances par semaine sur N semaines.
 */
export async function getDataSportSemaines(nbSemaines = 8): Promise<PointSport[]> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const depuis = subWeeks(new Date(), nbSemaines)
    const { data, error } = await supabase
      .from('workouts')
      .select('date')
      .eq('user_id', user.id)
      .gte('date', format(depuis, 'yyyy-MM-dd'))

    if (error) throw error

    const workouts = data ?? []
    const maintenant = new Date()

    return Array.from({ length: nbSemaines }, (_, i) => {
      const debut = startOfWeek(subWeeks(maintenant, nbSemaines - 1 - i), { weekStartsOn: 1 })
      const fin = endOfWeek(debut, { weekStartsOn: 1 })
      const seances = workouts.filter((w) => {
        const d = parseISO(w.date)
        return d >= debut && d <= fin
      }).length
      return { semaine: format(debut, 'd MMM', { locale: fr }), seances }
    })
  } catch (erreur) {
    console.error('Erreur getDataSportSemaines:', erreur)
    return []
  }
}

/**
 * Calcule les stats résumées (séances du mois, moyennes énergie/douleur).
 */
export async function getStatsResume(): Promise<StatsResume> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { seancesCeMois: 0, energieMoyenne: null, douleurMoyenne: null }

    const debutMois = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')

    const [{ count }, { data: logs }] = await Promise.all([
      supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('date', debutMois),
      supabase.from('daily_logs').select('energy, pain').eq('user_id', user.id).gte('date', debutMois),
    ])

    const logsValides = logs ?? []
    const energies = logsValides.map((l) => l.energy).filter((v): v is number => v !== null)
    const douleurs = logsValides.map((l) => l.pain).filter((v): v is number => v !== null)

    return {
      seancesCeMois: count ?? 0,
      energieMoyenne: energies.length ? Math.round((energies.reduce((a, b) => a + b, 0) / energies.length) * 10) / 10 : null,
      douleurMoyenne: douleurs.length ? Math.round((douleurs.reduce((a, b) => a + b, 0) / douleurs.length) * 10) / 10 : null,
    }
  } catch (erreur) {
    console.error('Erreur getStatsResume:', erreur)
    return { seancesCeMois: 0, energieMoyenne: null, douleurMoyenne: null }
  }
}
