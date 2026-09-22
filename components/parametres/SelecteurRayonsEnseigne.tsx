'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { getRayonsOrdonnes } from '@/lib/data/courses'
import type { Rayon } from '@/types'

interface SelecteurRayonsEnseigneProps {
  rayonsCoches: Set<Rayon>
  onToggle: (rayon: Rayon) => void
}

/** Cases à cocher pour choisir les rayons entiers rangés automatiquement dans une enseigne. */
export function SelecteurRayonsEnseigne({ rayonsCoches, onToggle }: SelecteurRayonsEnseigneProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {getRayonsOrdonnes().map(({ rayon, config }) => (
        <div key={rayon} className="flex items-center gap-2">
          <Checkbox id={`rayon-${rayon}`} checked={rayonsCoches.has(rayon)} onCheckedChange={() => onToggle(rayon)} />
          <Label htmlFor={`rayon-${rayon}`} className="text-sm font-normal cursor-pointer">
            {config.emoji} {config.label}
          </Label>
        </div>
      ))}
    </div>
  )
}
