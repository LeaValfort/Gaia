'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { JourPlanningCalendrier } from '@/components/parametres/JourPlanningCalendrier'
import {
  creerEntreePlanning,
  getEntreesPlanning,
  modifierEntreePlanning,
  supprimerEntreePlanning,
} from '@/lib/db/planning-sport-entries'
import { getToutesVariantesPourType } from '@/lib/db/sport-variantes'
import { grouperEntreesParJour } from '@/lib/planning-sport-recurrence'
import { supabase } from '@/lib/supabase'
import type {
  JourSemaine,
  MacrosMode,
  NouvellePlanningSportEntry,
  PlanningSportEntry,
  SportVariante,
  TypeVarianteSport,
} from '@/types'

const JOURS: { cle: JourSemaine; label: string }[] = [
  { cle: 'lundi', label: 'Lundi' },
  { cle: 'mardi', label: 'Mardi' },
  { cle: 'mercredi', label: 'Mercredi' },
  { cle: 'jeudi', label: 'Jeudi' },
  { cle: 'vendredi', label: 'Vendredi' },
  { cle: 'samedi', label: 'Samedi' },
  { cle: 'dimanche', label: 'Dimanche' },
]

const TYPES_VARIANTES: TypeVarianteSport[] = ['muscu_full', 'muscu_upper', 'natation', 'yoga']
const VARIANTES_VIDES: Record<TypeVarianteSport, SportVariante[]> = {
  muscu_full: [],
  muscu_upper: [],
  natation: [],
  yoga: [],
}

/**
 * Calendrier hebdo du planning sport : plusieurs séances possibles par jour,
 * chacune avec une récurrence et un programme (ou « libre ») optionnels.
 * L'intensité de chaque programme (pour les macros) se règle sur la page Sport,
 * pas ici. En mode macros Auto, le « libre » n'est plus proposé pour Muscu/
 * Natation/Yoga : un programme précis est requis (voir `macrosMode`).
 * N'a aucun effet sur le planning jour-par-jour existant — ce branchement
 * viendra dans une étape suivante.
 */
export function SectionPlanningSportCalendrier({
  userId,
  macrosMode,
}: {
  userId: string
  macrosMode: MacrosMode
}) {
  const [entrees, setEntrees] = useState<PlanningSportEntry[]>([])
  const [variantesParType, setVariantesParType] = useState(VARIANTES_VIDES)
  const [chargement, setChargement] = useState(true)
  const [jourOuvert, setJourOuvert] = useState<JourSemaine | null>(null)
  const [entreeEnCours, setEntreeEnCours] = useState<string | null>(null)

  useEffect(() => {
    async function charger() {
      setChargement(true)
      const [ent, ...variantes] = await Promise.all([
        getEntreesPlanning(supabase, userId),
        ...TYPES_VARIANTES.map((t) => getToutesVariantesPourType(supabase, userId, t)),
      ])
      setEntrees(ent)
      const map = { ...VARIANTES_VIDES }
      TYPES_VARIANTES.forEach((t, i) => {
        map[t] = variantes[i]
      })
      setVariantesParType(map)
      setChargement(false)
    }
    void charger()
  }, [userId])

  const parJour = useMemo(() => grouperEntreesParJour(entrees), [entrees])

  async function ajouter(jour: JourSemaine, type: PlanningSportEntry['type_seance']) {
    const nouvelle = await creerEntreePlanning(supabase, userId, { jour_semaine: jour, type_seance: type })
    if (!nouvelle) {
      toast.error('Impossible d’ajouter la séance.')
      return
    }
    setEntrees((prev) => [...prev, nouvelle])
    setJourOuvert(null)
  }

  async function changer(id: string, updates: Partial<NouvellePlanningSportEntry>) {
    setEntreeEnCours(id)
    const ok = await modifierEntreePlanning(supabase, id, updates)
    if (ok) {
      setEntrees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
    } else {
      toast.error('Impossible d’enregistrer la modification.')
    }
    setEntreeEnCours(null)
  }

  async function supprimer(id: string) {
    setEntreeEnCours(id)
    const ok = await supprimerEntreePlanning(supabase, id)
    if (ok) setEntrees((prev) => prev.filter((e) => e.id !== id))
    else toast.error('Impossible de supprimer.')
    setEntreeEnCours(null)
  }

  if (chargement) return <p className="text-sm text-muted-foreground">Chargement…</p>

  return (
    <div className="space-y-4">
      {JOURS.map(({ cle, label }) => (
        <JourPlanningCalendrier
          key={cle}
          label={label}
          entrees={parJour[cle]}
          variantesParType={variantesParType}
          macrosObligatoire={macrosMode === 'auto'}
          ouvert={jourOuvert === cle}
          entreeEnCours={entreeEnCours}
          onToggleAjout={() => setJourOuvert((prev) => (prev === cle ? null : cle))}
          onAjouter={(type) => void ajouter(cle, type)}
          onChangerVariante={(id, v) => void changer(id, { variante_id: v })}
          onChangerActivite={(id, a) => void changer(id, { activite_type: a })}
          onChangerRecurrence={(id, i, d) => void changer(id, { intervalle_semaines: i, decalage_semaine: d })}
          onSupprimer={(id) => void supprimer(id)}
        />
      ))}
    </div>
  )
}
