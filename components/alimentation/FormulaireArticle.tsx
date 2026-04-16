'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { addShoppingItem } from '@/lib/db/courses'
import { ENSEIGNES_DEFAUT, RAYONS_CONFIG, getRayonsOrdonnes } from '@/lib/data/courses'
import type { EnseigneConfig } from '@/lib/data/courses'
import type { ShoppingItemComplet, Rayon } from '@/types'

interface FormulaireArticleProps {
  enseignes: EnseigneConfig[]
  weekStart: string
  userId: string
  onAjoute: (article: ShoppingItemComplet) => void
  onFermer: () => void
}

const ENSEIGNE_VIDE = '__aucune__'
const RAYON_VIDE    = '__aucun__'

export function FormulaireArticle({ weekStart, userId, onAjoute, onFermer }: FormulaireArticleProps) {
  const [nom, setNom]           = useState('')
  const [quantite, setQuantite] = useState('')
  const [enseigne, setEnseigne] = useState(ENSEIGNE_VIDE)
  const [rayon, setRayon]       = useState(RAYON_VIDE)
  const [chargement, setChargement] = useState(false)

  const rayonsOrdonnes = getRayonsOrdonnes()

  async function handleSoumettre() {
    if (!nom.trim()) return
    setChargement(true)
    const nouvel = await addShoppingItem(supabase, userId, {
      week_start: weekStart,
      nom: nom.trim(),
      quantite: quantite.trim() || null,
      enseigne: enseigne === ENSEIGNE_VIDE ? null : enseigne,
      rayon: rayon === RAYON_VIDE ? null : rayon as Rayon,
      source: 'manuel',
    })
    setChargement(false)
    if (nouvel) {
      onAjoute(nouvel)
      onFermer()
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onFermer() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un article</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nom">Nom de l&apos;article *</Label>
            <Input
              id="nom"
              placeholder="Ex : Lentilles vertes"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSoumettre()}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quantite">Quantité <span className="text-neutral-400 text-xs">(optionnel)</span></Label>
            <Input
              id="quantite"
              placeholder="Ex : 500g, x2, 1 bouteille"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Enseigne</Label>
              <Select value={enseigne} onValueChange={setEnseigne}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Aucune" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ENSEIGNE_VIDE}>Aucune</SelectItem>
                  {ENSEIGNES_DEFAUT.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.emoji} {e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Rayon</Label>
              <Select value={rayon} onValueChange={setRayon}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RAYON_VIDE}>Aucun</SelectItem>
                  {rayonsOrdonnes.map(({ rayon: r, config }) => (
                    <SelectItem key={r} value={r}>{config.emoji} {config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSoumettre} disabled={!nom.trim() || chargement} className="w-full">
            {chargement ? 'Ajout...' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
