'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ONGLET_DEFAUT_ID, SelecteurVariante } from '@/components/sport/SelecteurVariante'
import {
  activerVariante,
  creerVariante,
  getVariantes,
  renommerVariante,
  supprimerVariante,
} from '@/lib/db/sport-variantes'
import { supabase } from '@/lib/supabase'
import type { LieuVariante, SportVariante, TypeVarianteSport } from '@/types'

interface ComboSport {
  id: string
  typeSeance: TypeVarianteSport
  lieu: LieuVariante
  label: string
}

const COMBOS: ComboSport[] = [
  { id: 'muscu_full-maison', typeSeance: 'muscu_full', lieu: 'maison', label: 'Muscu Full body — Maison' },
  { id: 'muscu_full-salle', typeSeance: 'muscu_full', lieu: 'salle', label: 'Muscu Full body — Salle' },
  { id: 'muscu_upper-maison', typeSeance: 'muscu_upper', lieu: 'maison', label: 'Muscu Upper/Lower — Maison' },
  { id: 'muscu_upper-salle', typeSeance: 'muscu_upper', lieu: 'salle', label: 'Muscu Upper/Lower — Salle' },
  { id: 'natation-na', typeSeance: 'natation', lieu: 'na', label: 'Natation' },
  { id: 'yoga-na', typeSeance: 'yoga', lieu: 'na', label: 'Yoga' },
]

export interface SectionVariantesSportProps {
  userId: string
}

/**
 * Vue centralisée des séances personnalisées (variantes) : le menu déroulant
 * choisit un sport, et la bande d'onglets en dessous affiche la séance créée
 * pour ce sport — même sélecteur créer/renommer/activer/supprimer que sur
 * la page Sport, sans avoir à ouvrir l'onglet correspondant.
 */
export function SectionVariantesSport({ userId }: SectionVariantesSportProps) {
  const [comboId, setComboId] = useState(COMBOS[0].id)
  const [variantes, setVariantes] = useState<SportVariante[]>([])
  const [chargement, setChargement] = useState(false)

  const combo = COMBOS.find((c) => c.id === comboId) ?? COMBOS[0]
  const actif = variantes.find((v) => v.est_active) ?? null

  useEffect(() => {
    if (!userId) return
    let annule = false
    setChargement(true)
    void getVariantes(supabase, userId, combo.typeSeance, combo.lieu).then((vs) => {
      if (!annule) {
        setVariantes(vs)
        setChargement(false)
      }
    })
    return () => {
      annule = true
    }
  }, [userId, combo.typeSeance, combo.lieu])

  async function selectionner(id: string) {
    const varianteId = id === ONGLET_DEFAUT_ID ? null : id
    const ok = await activerVariante(supabase, userId, combo.typeSeance, combo.lieu, varianteId)
    if (!ok) {
      toast.error('Impossible de changer la séance active.')
      return
    }
    setVariantes((prev) => prev.map((v) => ({ ...v, est_active: v.id === varianteId })))
  }

  async function creer(nom: string) {
    const v = await creerVariante(supabase, userId, combo.typeSeance, combo.lieu, nom, {})
    if (!v) {
      toast.error('Impossible de créer la séance.')
      return
    }
    setVariantes((prev) => [...prev.map((p) => ({ ...p, est_active: false })), v])
  }

  async function renommer(id: string, nom: string) {
    const ok = await renommerVariante(supabase, id, nom)
    if (!ok) {
      toast.error('Impossible de renommer la séance.')
      return
    }
    setVariantes((prev) => prev.map((v) => (v.id === id ? { ...v, nom } : v)))
  }

  async function supprimer(id: string) {
    const ok = await supprimerVariante(supabase, id)
    if (!ok) {
      toast.error('Impossible de supprimer la séance.')
      return
    }
    setVariantes((prev) => prev.filter((v) => v.id !== id))
  }

  return (
    <div className="space-y-3">
      <Select value={comboId} onValueChange={(v) => setComboId(v)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COMBOS.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {chargement ? (
        <p className="text-xs text-muted-foreground">Chargement…</p>
      ) : (
        <SelecteurVariante
          variantes={variantes}
          activeId={actif?.id ?? ONGLET_DEFAUT_ID}
          onSelect={(id) => void selectionner(id)}
          onCreer={(nom) => void creer(nom)}
          onRenommer={(id, nom) => void renommer(id, nom)}
          onSupprimer={(id) => void supprimer(id)}
          couleurActif="bg-amber-600 text-white"
        />
      )}
    </div>
  )
}
