'use client'

import { TabsNav, type OngletNav } from '@/components/shared/TabsNav'
import type { Phase } from '@/types'

const ONGLETS: OngletNav[] = [
  { id: 'planification', label: 'Planification', emoji: '📅' },
  { id: 'muscu', label: 'Muscu', emoji: '💪' },
  { id: 'natation', label: 'Natation', emoji: '🏊' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘' },
  { id: 'autre', label: 'Autre sport', emoji: '🎯' },
]

export interface TabsSportProps {
  onglet: string
  onChange: (onglet: string) => void
  phase: Phase | null
}

export function TabsSport({ onglet, onChange, phase }: TabsSportProps) {
  return <TabsNav onglets={ONGLETS} actif={onglet} onChange={onChange} phase={phase} />
}
