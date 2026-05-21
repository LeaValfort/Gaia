'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import type { UserPreferences } from '@/types'

interface SectionAlimentationProps {
  prefs: UserPreferences
  onUpdate: (updates: Partial<Omit<UserPreferences, 'id' | 'user_id'>>) => Promise<boolean>
}

function TagList({
  label,
  ariaLabel,
  items,
  placeholder,
  variant,
  onChange,
}: {
  label: string
  ariaLabel?: string
  items: string[]
  placeholder: string
  variant: 'default' | 'destructive'
  onChange: (next: string[]) => void
}) {
  const [draft, setDraft] = useState('')

  function ajouter() {
    const t = draft.trim()
    if (!t || items.includes(t)) return
    onChange([...items, t])
    setDraft('')
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex min-h-[28px] flex-wrap gap-1.5">
        {items.map((t) => (
          <Badge
            key={t}
            variant={variant === 'destructive' ? 'destructive' : 'secondary'}
            className="gap-1 pr-1 font-normal"
          >
            {t}
            <button
              type="button"
              className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
              onClick={() => onChange(items.filter((x) => x !== t))}
              aria-label={`Retirer ${t}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="h-9"
          aria-label={ariaLabel ?? label}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), ajouter())}
        />
        <Button type="button" size="sm" variant="outline" className="h-9 shrink-0" onClick={ajouter}>
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export function SectionAlimentation({ prefs, onUpdate }: SectionAlimentationProps) {
  const [likes, setLikes] = useState(prefs.food_likes)
  const [dislikes, setDislikes] = useState(prefs.food_dislikes)
  const [allergies, setAllergies] = useState(prefs.food_allergies)
  const [cook, setCook] = useState(prefs.cook_time_minutes)
  const [suiviCalorique, setSuiviCalorique] = useState(prefs.suivi_calorique !== false)

  useEffect(() => {
    setLikes(prefs.food_likes)
    setDislikes(prefs.food_dislikes)
    setAllergies(prefs.food_allergies)
    setCook(prefs.cook_time_minutes)
    setSuiviCalorique(prefs.suivi_calorique !== false)
  }, [
    prefs.food_likes,
    prefs.food_dislikes,
    prefs.food_allergies,
    prefs.cook_time_minutes,
    prefs.suivi_calorique,
  ])

  return (
    <>
      <div className="flex items-center justify-between gap-4 py-1">
        <Label htmlFor="suivi-calorique">Suivi calorique</Label>
        <Switch
          id="suivi-calorique"
          checked={suiviCalorique}
          onCheckedChange={(v) => {
            setSuiviCalorique(v)
            void onUpdate({ suivi_calorique: v })
          }}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <Label htmlFor="temps-cuisine">Temps de cuisine</Label>
          <span className="font-medium tabular-nums">{cook} min</span>
        </div>
        <Slider
          id="temps-cuisine"
          min={15}
          max={60}
          value={cook}
          onValueChange={setCook}
          onPointerUp={(e) => {
            const v = Number((e.currentTarget as HTMLInputElement).value)
            if (v !== prefs.cook_time_minutes) void onUpdate({ cook_time_minutes: v })
          }}
        />
      </div>

      <TagList
        label="Aliments aimés"
        items={likes}
        placeholder="ex: saumon, avocat…"
        variant="default"
        onChange={(next) => {
          setLikes(next)
          void onUpdate({ food_likes: next })
        }}
      />

      <TagList
        label="Aliments non aimés"
        items={dislikes}
        placeholder="ex: chou-fleur…"
        variant="default"
        onChange={(next) => {
          setDislikes(next)
          void onUpdate({ food_dislikes: next })
        }}
      />

      <TagList
        ariaLabel="Ajouter une allergie ou intolérance"
        label="Allergies / intolérances"
        items={allergies}
        placeholder="ex: gluten, arachides…"
        variant="destructive"
        onChange={(next) => {
          setAllergies(next)
          void onUpdate({ food_allergies: next })
        }}
      />
    </>
  )
}
