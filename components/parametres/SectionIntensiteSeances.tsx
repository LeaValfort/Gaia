'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CarteIntensiteSeance } from '@/components/parametres/CarteIntensiteSeance'
import { upsertSeanceProfil } from '@/lib/db/seance-profils'
import { PROFILS_DEFAUT, type ProfilEffort, type SeanceProfil, type TypePlanningJour } from '@/types'

const TYPES: { id: Exclude<TypePlanningJour, 'repos'>; label: string }[] = [
  { id: 'muscu_full', label: 'Muscu Full body' },
  { id: 'muscu_upper', label: 'Muscu Upper/Lower' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'natation', label: 'Natation' },
  { id: 'autre', label: 'Autre sport' },
]

const PROFIL_AUTRE_DEFAUT: ProfilEffort = { intensite: 'moderee', type_effort: 'mixte', duree_min: 60 }

function profilDefautPourType(type: TypePlanningJour): ProfilEffort {
  const defaut = PROFILS_DEFAUT[type]
  if (defaut) return { ...defaut }
  if (type === 'autre') return { ...PROFIL_AUTRE_DEFAUT }
  return { ...PROFILS_DEFAUT.repos }
}

function profilsDepuisSeances(seances: SeanceProfil[]): Record<string, ProfilEffort> {
  const map: Record<string, ProfilEffort> = {}
  for (const s of seances) {
    map[s.seance_type] = { intensite: s.intensite, type_effort: s.type_effort, duree_min: s.duree_min }
  }
  return map
}

export interface SectionIntensiteSeancesProps {
  userId: string
  seanceProfilsInitiales: SeanceProfil[]
}

/**
 * Intensité / effort / durée par type de séance, utilisés pour le calcul des
 * macros (mode Automatique). Indépendant du calendrier de planning : ce
 * réglage reste par type de séance pour l'instant, il migrera vers un réglage
 * par programme lors d'une étape suivante du chantier.
 */
export function SectionIntensiteSeances({ userId, seanceProfilsInitiales }: SectionIntensiteSeancesProps) {
  const [profilsParType, setProfilsParType] = useState<Record<string, ProfilEffort>>(() =>
    profilsDepuisSeances(seanceProfilsInitiales)
  )
  const [chargementType, setChargementType] = useState<TypePlanningJour | null>(null)

  useEffect(() => {
    setProfilsParType(profilsDepuisSeances(seanceProfilsInitiales))
  }, [seanceProfilsInitiales])

  async function modifierProfil(type: TypePlanningJour, profil: ProfilEffort) {
    setProfilsParType((prev) => ({ ...prev, [type]: profil }))
    setChargementType(type)
    try {
      await upsertSeanceProfil(userId, type, profil)
    } catch {
      toast.error('Impossible d’enregistrer l’intensité.')
    } finally {
      setChargementType(null)
    }
  }

  return (
    <ul className="flex flex-col gap-4">
      {TYPES.map(({ id, label }) => {
        const profil = profilsParType[id] ?? profilDefautPourType(id)
        return (
          <CarteIntensiteSeance
            key={id}
            label={label}
            profil={profil}
            enChargement={chargementType === id}
            onChangerIntensite={(v) => void modifierProfil(id, { ...profil, intensite: v })}
            onChangerEffort={(v) => void modifierProfil(id, { ...profil, type_effort: v })}
            onChangerDuree={(v) => void modifierProfil(id, { ...profil, duree_min: v })}
          />
        )
      })}
    </ul>
  )
}
