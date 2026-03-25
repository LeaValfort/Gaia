'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { upsertPreferencesUtilisateur } from '@/lib/db/cycle'
import type { UserPreferences, Theme } from '@/types'
import { DEFAULT_CYCLE_LENGTH, DEFAULT_COOK_TIME } from '@/types'

interface FormulaireParametresProps {
  prefsInitiales: UserPreferences | null
}

export function FormulaireParametres({ prefsInitiales: p }: FormulaireParametresProps) {
  const router = useRouter()
  const { setTheme } = useTheme()

  const [dernierCycle, setDernierCycle] = useState(p?.last_cycle_start ?? '')
  const [dureeCycle, setDureeCycle] = useState(String(p?.cycle_length ?? DEFAULT_CYCLE_LENGTH))
  const [aimeListe, setAimeListe] = useState((p?.food_likes ?? []).join(', '))
  const [naimePasListe, setNaimePasListe] = useState((p?.food_dislikes ?? []).join(', '))
  const [allergies, setAllergies] = useState((p?.food_allergies ?? []).join(', '))
  const [tempsCuisine, setTempsCuisine] = useState(String(p?.cook_time_minutes ?? DEFAULT_COOK_TIME))
  const [theme, setThemeLocal] = useState<Theme>(p?.theme ?? 'system')
  const [chargement, setChargement] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)

  // Convertit "pomme, banane, kiwi" → ["pomme", "banane", "kiwi"]
  function parseListe(texte: string): string[] {
    return texte.split(',').map((s) => s.trim()).filter(Boolean)
  }

  async function sauvegarder() {
    setChargement(true)
    try {
      await upsertPreferencesUtilisateur({
        last_cycle_start: dernierCycle || null,
        cycle_length: parseInt(dureeCycle) || DEFAULT_CYCLE_LENGTH,
        food_likes: parseListe(aimeListe),
        food_dislikes: parseListe(naimePasListe),
        food_allergies: parseListe(allergies),
        cook_time_minutes: parseInt(tempsCuisine) || DEFAULT_COOK_TIME,
        theme,
      })
      setTheme(theme)
      setSauvegarde(true)
      setTimeout(() => setSauvegarde(false), 2000)
      router.refresh()
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Section cycle */}
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Mon cycle</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dernierCycle">Début du dernier cycle</Label>
            <Input
              id="dernierCycle"
              type="date"
              value={dernierCycle}
              onChange={(e) => setDernierCycle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dureeCycle">Durée du cycle (jours)</Label>
            <Input
              id="dureeCycle"
              type="number"
              min={21}
              max={40}
              value={dureeCycle}
              onChange={(e) => setDureeCycle(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Section alimentation */}
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-4">
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Profil alimentaire</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Sépare les éléments par des virgules</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aimeListe">Ce que j&apos;aime</Label>
            <Input id="aimeListe" placeholder="ex : saumon, avocat, chocolat noir" value={aimeListe} onChange={(e) => setAimeListe(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="naimePasListe">Ce que je n&apos;aime pas</Label>
            <Input id="naimePasListe" placeholder="ex : chou-fleur, betterave" value={naimePasListe} onChange={(e) => setNaimePasListe(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="allergies">Allergies / intolérances</Label>
            <Input id="allergies" placeholder="ex : gluten, lactose, noix" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5 sm:max-w-[200px]">
            <Label htmlFor="tempsCuisine">Temps de cuisine dispo (min)</Label>
            <Input id="tempsCuisine" type="number" min={5} max={120} value={tempsCuisine} onChange={(e) => setTempsCuisine(e.target.value)} />
          </div>
        </div>
      </section>

      {/* Section préférences */}
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Préférences</h2>
        <div className="flex flex-col gap-1.5 sm:max-w-[200px]">
          <Label>Thème</Label>
          <Select value={theme} onValueChange={(v) => setThemeLocal(v as Theme)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="system">Automatique</SelectItem>
              <SelectItem value="light">Clair</SelectItem>
              <SelectItem value="dark">Sombre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <Button onClick={sauvegarder} disabled={chargement} className="w-full sm:w-auto sm:self-start">
        {chargement ? 'Sauvegarde...' : sauvegarde ? '✓ Sauvegardé !' : 'Sauvegarder les paramètres'}
      </Button>
    </div>
  )
}
