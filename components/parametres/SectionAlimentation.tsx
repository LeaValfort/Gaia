'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Plus, Utensils, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
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
  label?: string
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

  function retirer(v: string) {
    onChange(items.filter((x) => x !== v))
  }

  return (
    <div className="space-y-2">
      {label ? <Label>{label}</Label> : null}
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
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
              onClick={() => retirer(t)}
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
          aria-label={ariaLabel ?? label ?? 'Ajouter un élément'}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), ajouter())}
        />
        <Button type="button" size="sm" variant="outline" className="shrink-0 h-9" onClick={ajouter}>
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

  useEffect(() => {
    setLikes(prefs.food_likes)
    setDislikes(prefs.food_dislikes)
    setAllergies(prefs.food_allergies)
    setCook(prefs.cook_time_minutes)
  }, [prefs.food_likes, prefs.food_dislikes, prefs.food_allergies, prefs.cook_time_minutes])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Utensils className="size-4 text-emerald-500" aria-hidden />
          Profil alimentaire
        </CardTitle>
        <CardDescription>Temps de cuisine et listes pour personnaliser les suggestions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Temps de cuisine disponible</Label>
            <span className="font-medium">{cook} minutes</span>
          </div>
          <Slider
            min={10}
            max={90}
            value={cook}
            onValueChange={setCook}
            onPointerUp={(e) => {
              const v = Number((e.currentTarget as HTMLInputElement).value)
              if (v !== prefs.cook_time_minutes) void onUpdate({ cook_time_minutes: v })
            }}
          />
        </div>

        <TagList label="Aliments aimés" items={likes} placeholder="ex: saumon, avocat…" variant="default" onChange={(next) => { setLikes(next); void onUpdate({ food_likes: next }) }} />
        <TagList label="Aliments non aimés" items={dislikes} placeholder="ex: chou-fleur…" variant="default" onChange={(next) => { setDislikes(next); void onUpdate({ food_dislikes: next }) }} />

        <div className="space-y-2 rounded-lg border border-red-200/80 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-3">
          <Label className="flex items-center gap-1.5 text-red-800 dark:text-red-300">
            <AlertTriangle className="size-3.5" aria-hidden />
            Allergies / intolérances
          </Label>
          <TagList
            ariaLabel="Ajouter une allergie ou intolérance"
            items={allergies}
            placeholder="ex: gluten, arachides…"
            variant="destructive"
            onChange={(next) => {
              setAllergies(next)
              void onUpdate({ food_allergies: next })
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
