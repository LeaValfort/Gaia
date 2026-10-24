'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { JourPlanningCalendrier } from '@/components/parametres/JourPlanningCalendrier'
import { getTypesActivitesLoggees } from '@/lib/db/activity-logs'
import { getModelesSeance } from '@/lib/db/modeles-seance'
import {
  creerEntreePlanning,
  getEntreesPlanning,
  modifierEntreePlanning,
  supprimerEntreePlanning,
} from '@/lib/db/planning-sport-entries'
import { getToutesVariantesPourType } from '@/lib/db/sport-variantes'
import { grouperEntreesParJour } from '@/lib/planning-sport-recurrence'
import { supabase } from '@/lib/supabase'
import type { JourSemaine, ModeleSeance, TypeActivite, NouvellePlanningSportEntry, PlanningSportEntry, SportVariante, TypeVarianteSport } from '@/types'

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
 * chacune avec un programme (ou modèle de séance) et une récurrence.
 * Sans programme précis, les macros utilisent le profil Gaia par défaut du sport.
 */
export function SectionPlanningSportCalendrier({ userId }: { userId: string }) {
  const [entrees, setEntrees] = useState<PlanningSportEntry[]>([])
  const [variantesParType, setVariantesParType] = useState(VARIANTES_VIDES)
  const [modeles, setModeles] = useState<ModeleSeance[]>([])
  const [activitesLoggees, setActivitesLoggees] = useState<TypeActivite[]>([])
  const [ajoutEnCours, setAjoutEnCours] = useState(false)
  const [chargement, setChargement] = useState(true)
  const [jourOuvert, setJourOuvert] = useState<JourSemaine | null>(null)
  const [entreeEnCours, setEntreeEnCours] = useState<string | null>(null)

  useEffect(() => {
    async function charger() {
      setChargement(true)
      const [ent, mods, activites, ...variantes] = await Promise.all([
        getEntreesPlanning(supabase, userId),
        getModelesSeance(supabase, userId),
        getTypesActivitesLoggees(supabase, userId),
        ...TYPES_VARIANTES.map((t) => getToutesVariantesPourType(supabase, userId, t)),
      ])
      setEntrees(ent)
      setModeles(mods)
      setActivitesLoggees(activites)
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

  async function ajouter(jour: JourSemaine, entree: Omit<NouvellePlanningSportEntry, 'jour_semaine'>) {
    setAjoutEnCours(true)
    const nouvelle = await creerEntreePlanning(supabase, userId, { ...entree, jour_semaine: jour })
    setAjoutEnCours(false)
    if (!nouvelle) {
      toast.error('Impossible d’ajouter la séance.')
      return
    }
    setEntrees((prev) => [...prev, nouvelle])
    setJourOuvert(null)
    toast.success('Séance ajoutée au planning')
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
    <div className="space-y-2">
      {JOURS.map(({ cle, label }) => (
        <JourPlanningCalendrier
          key={cle}
          label={label}
          entrees={parJour[cle]}
          variantesParType={variantesParType}
          modeles={modeles}
          activitesLoggees={activitesLoggees}
          ouvert={jourOuvert === cle}
          ajoutEnCours={ajoutEnCours}
          entreeEnCours={entreeEnCours}
          onToggleAjout={() => setJourOuvert((prev) => (prev === cle ? null : cle))}
          onAjouter={(e) => void ajouter(cle, e)}
          onModifier={(id, u) => void changer(id, u)}
          onSupprimer={(id) => void supprimer(id)}
        />
      ))}
    </div>
  )
}
