'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import type { Recipe, ShoppingItem, Phase, TypeRepas } from '@/types'

// ── RECETTES ────────────────────────────────────────────────

export async function getRecettes(filters?: {
  phase?: Phase | null
  typeRepas?: TypeRepas | null
}): Promise<Recipe[]> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase.from('recipes').select('*').eq('user_id', user.id)
  if (filters?.phase)     query = query.eq('phase', filters.phase)
  if (filters?.typeRepas) query = query.eq('type_repas', filters.typeRepas)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function sauvegarderRecette(data: {
  nom: string
  ingredients: string[]
  temps_min: number | null
  phase: Phase | null
  type_repas: TypeRepas | null
  raison: string | null
}): Promise<void> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connectée')

  const { error } = await supabase.from('recipes').insert({ ...data, user_id: user.id })
  if (error) throw error
}

export async function supprimerRecette(id: string): Promise<void> {
  const supabase = await creerClientServeur()
  const { error } = await supabase.from('recipes').delete().eq('id', id)
  if (error) throw error
}

// ── LISTE DE COURSES ─────────────────────────────────────────

export async function getShoppingItems(weekStart: string): Promise<ShoppingItem[]> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase.from('shopping_items').select('*').eq('user_id', user.id).eq('week_start', weekStart).order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addShoppingItem(weekStart: string, nom: string): Promise<void> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connectée')

  const { error } = await supabase.from('shopping_items').insert({ user_id: user.id, week_start: weekStart, nom })
  if (error) throw error
}

export async function toggleShoppingItem(id: string, fait: boolean): Promise<void> {
  const supabase = await creerClientServeur()
  const { error } = await supabase.from('shopping_items').update({ fait }).eq('id', id)
  if (error) throw error
}

export async function supprimerShoppingItem(id: string): Promise<void> {
  const supabase = await creerClientServeur()
  const { error } = await supabase.from('shopping_items').delete().eq('id', id)
  if (error) throw error
}

export async function genererListeCourses(weekStart: string, noms: string[]): Promise<void> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connectée')

  // Récupère les articles existants pour éviter les doublons
  const { data: existants } = await supabase.from('shopping_items').select('nom').eq('user_id', user.id).eq('week_start', weekStart)
  const nomsExistants = new Set((existants ?? []).map((a) => a.nom.toLowerCase()))
  const nouveaux = noms.filter((n) => !nomsExistants.has(n.toLowerCase()))

  if (nouveaux.length > 0) {
    const { error } = await supabase.from('shopping_items').insert(nouveaux.map((nom) => ({ user_id: user.id, week_start: weekStart, nom })))
    if (error) throw error
  }
}
