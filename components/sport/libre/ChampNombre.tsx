'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ChampNombreProps {
  valeur: number | null
  onChange: (v: number | null) => void
  label: string
  unite?: string
  placeholder?: string
  className?: string
}

function versNombre(t: string): number | null {
  const s = t.trim().replace(',', '.')
  const n = Number(s)
  return s === '' || !Number.isFinite(n) ? null : n
}

/**
 * Petit champ numérique (virgule acceptée) suivi de son unité. Le texte tapé est
 * gardé tel quel (ex. « 12, ») pour pouvoir saisir des décimales sans être coupé.
 */
export function ChampNombre({ valeur, onChange, label, unite, placeholder, className }: ChampNombreProps) {
  const [texte, setTexte] = useState(valeur == null ? '' : String(valeur))
  // Valeur changée de l'extérieur (ex. modèle chargé) : on resynchronise le texte.
  const affiche = versNombre(texte) === valeur ? texte : valeur == null ? '' : String(valeur)

  return (
    <span className="inline-flex items-center gap-1">
      <Input
        className={cn('h-8 w-16 px-2 text-sm placeholder:text-neutral-300 dark:placeholder:text-neutral-600', className)}
        inputMode="decimal"
        aria-label={label}
        placeholder={placeholder}
        value={affiche}
        onChange={(e) => {
          setTexte(e.target.value)
          onChange(versNombre(e.target.value))
        }}
      />
      {unite ? <span>{unite}</span> : null}
    </span>
  )
}
