'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Nav } from '@/components/shared/Nav'
import { TabsSport } from '@/components/sport/TabsSport'
import { PhaseBannerSport } from '@/components/sport/PhaseBannerSport'
import { OngletMuscu } from '@/components/sport/OngletMuscu'
import { OngletNatation } from '@/components/sport/OngletNatation'
import { OngletYoga } from '@/components/sport/OngletYoga'
import { OngletAutreSport } from '@/components/sport/OngletAutreSport'
import { OngletPlanification } from '@/components/sport/OngletPlanification'
import type { SportPageInitial } from '@/lib/sport/loadSportPage'

export function SportPageClient({ initial }: { initial: SportPageInitial }) {
  const [onglet, setOnglet] = useState('muscu')
  const { date, userId, seances, sansCycle, phase, jourDuCycle, planning } = initial
  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-neutral-950">
      <Nav phase={phase} sansCycle={sansCycle} prenom={initial.prenom} />
      <div className="mx-auto max-w-3xl p-4 pb-24">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Sport</h1>
        </header>
        <div className="mb-3">
          <TabsSport onglet={onglet} onChange={setOnglet} phase={phase} />
        </div>
        {phase && jourDuCycle != null ? (
          <div className="mb-4">
            <PhaseBannerSport phase={phase} jourDuCycle={jourDuCycle} />
          </div>
        ) : null}
        <div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
          {onglet === 'planification' && <OngletPlanification phase={phase} planning={planning} />}
          {onglet === 'muscu' && (
            <OngletMuscu
              phase={phase}
              userId={userId}
              date={date}
              planning={planning}
              seanceExistante={seances.muscu}
            />
          )}
          {onglet === 'natation' && (
            <OngletNatation phase={phase} userId={userId} date={date} seanceExistante={seances.natation} />
          )}
          {onglet === 'yoga' && (
            <OngletYoga phase={phase} userId={userId} date={date} seanceExistante={seances.yoga} />
          )}
          {onglet === 'autre' && <OngletAutreSport userId={userId} date={date} />}
        </div>
      </div>
    </div>
  )
}
