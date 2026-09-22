'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { createEnseigne, updateEnseigne } from '@/lib/db/enseignes'
import { PALETTE_COULEURS_ENSEIGNE } from '@/lib/data/nutrition'
import { SelecteurRayonsEnseigne } from '@/components/parametres/SelecteurRayonsEnseigne'
import type { EnseigneDB, Rayon } from '@/types'

interface FormulaireEnseigneProps {
  /** null = création, sinon édition de cette enseigne */
  enseigne: EnseigneDB | null
  userId: string
  ordreActuelMax: number
  onEnregistre: (enseigne: EnseigneDB) => void
  onFermer: () => void
}

export function FormulaireEnseigne({ enseigne, userId, ordreActuelMax, onEnregistre, onFermer }: FormulaireEnseigneProps) {
  const [label, setLabel] = useState(enseigne?.label ?? '')
  const [emoji, setEmoji] = useState(enseigne?.emoji ?? '🛍️')
  const [couleur, setCouleur] = useState(enseigne?.couleur ?? PALETTE_COULEURS_ENSEIGNE[0]!.classe)
  const [rayons, setRayons] = useState<Set<Rayon>>(new Set(enseigne?.rayons ?? []))
  const [motsCles, setMotsCles] = useState((enseigne?.mots_cles ?? []).join(', '))
  const [chargement, setChargement] = useState(false)

  function toggleRayon(rayon: Rayon) {
    setRayons((prev) => {
      const suivant = new Set(prev)
      if (suivant.has(rayon)) suivant.delete(rayon)
      else suivant.add(rayon)
      return suivant
    })
  }

  async function handleSoumettre() {
    const labelPropre = label.trim()
    if (!labelPropre) {
      toast.error('Indique un nom pour l’enseigne.')
      return
    }
    const motsClesArray = motsCles
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0)

    setChargement(true)
    const data = { label: labelPropre, emoji: emoji.trim() || '🛍️', couleur, rayons: [...rayons], mots_cles: motsClesArray }

    if (enseigne) {
      const ok = await updateEnseigne(supabase, userId, enseigne.id, data)
      setChargement(false)
      if (ok) {
        onEnregistre({ ...enseigne, ...data })
        toast.success('Enseigne modifiée')
      } else {
        toast.error('Impossible d’enregistrer. Réessaie.')
      }
    } else {
      const row = await createEnseigne(supabase, userId, data, ordreActuelMax)
      setChargement(false)
      if (row) {
        onEnregistre(row)
        toast.success('Enseigne créée')
      } else {
        toast.error('Impossible de créer l’enseigne. Réessaie.')
      }
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onFermer() }}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{enseigne ? 'Modifier l’enseigne' : 'Nouvelle enseigne'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="grid grid-cols-[1fr_5rem] gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="enseigne-nom">Nom *</Label>
              <Input id="enseigne-nom" placeholder="Ex : Marché" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="enseigne-emoji">Emoji</Label>
              <Input id="enseigne-emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} className="text-center" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {PALETTE_COULEURS_ENSEIGNE.map((c) => (
                <button
                  key={c.classe}
                  type="button"
                  onClick={() => setCouleur(c.classe)}
                  aria-label={c.label}
                  className={`h-8 w-8 rounded-full border-2 ${c.classe} ${couleur === c.classe ? 'border-violet-500' : 'border-transparent'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Rayons rangés automatiquement ici</Label>
            <SelecteurRayonsEnseigne rayonsCoches={rayons} onToggle={toggleRayon} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="enseigne-mots-cles">
              Mots-clés supplémentaires <span className="text-neutral-400 text-xs">(séparés par des virgules)</span>
            </Label>
            <Input
              id="enseigne-mots-cles"
              placeholder="Ex : œufs, miel"
              value={motsCles}
              onChange={(e) => setMotsCles(e.target.value)}
            />
            <p className="text-xs text-neutral-400">
              Un article dont le nom contient un de ces mots ira ici en priorité, même s’il ne correspond à aucun rayon coché.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSoumettre} disabled={!label.trim() || chargement} className="alimentation-btn-primaire flex-1">
              {chargement ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button variant="outline" onClick={onFermer} disabled={chargement}>
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
