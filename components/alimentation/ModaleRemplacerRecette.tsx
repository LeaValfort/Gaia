'use client'

import { useMemo, useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { insertRecetteGeneree } from '@/lib/db/recettes'
import { chercherRecettesIA } from '@/lib/ia/recherche-recettes-client'
import type { Phase, Recipe, RecetteGeneree, TypeRepas } from '@/types'

interface ModaleRemplacerRecetteProps {
  ouvert: boolean
  onOuvertChange: (o: boolean) => void
  typeRepas: TypeRepas
  phase: Phase
  recettes: Recipe[]
  /** Recette choisie (déjà en base) : le parent met à jour le planning. */
  onChoisir: (r: Recipe) => void
}

const LIGNE = 'flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800'

/**
 * Remplacer une recette du planning : parmi tes recettes (nom ou ingrédient),
 * ou via le moteur de recettes IA à partir d'un ingrédient ou d'une envie.
 */
export function ModaleRemplacerRecette({ ouvert, onOuvertChange, typeRepas, phase, recettes, onChoisir }: ModaleRemplacerRecetteProps) {
  const [q, setQ] = useState('')
  const [ia, setIa] = useState<RecetteGeneree[]>([])
  const [cherche, setCherche] = useState(false)
  const [sauvegarde, setSauvegarde] = useState<string | null>(null)

  const miennes = useMemo(() => {
    const t = q.trim().toLowerCase()
    return recettes
      .filter((r) => r.type_repas === typeRepas || r.type_repas === null)
      .filter((r) => !t || r.nom.toLowerCase().includes(t) || r.ingredients.some((i) => i.toLowerCase().includes(t)))
      .slice(0, 20)
  }, [q, recettes, typeRepas])

  async function chercherIA() {
    setCherche(true)
    try {
      setIa(await chercherRecettesIA({ recherche: q.trim(), typeRepas, phase }))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Recherche impossible')
    } finally {
      setCherche(false)
    }
  }

  /** Une suggestion IA est d'abord enregistrée comme vraie recette, puis planifiée. */
  async function choisirIA(r: RecetteGeneree) {
    setSauvegarde(r.nom)
    const { data } = await supabase.auth.getSession()
    const userId = data.session?.user.id
    const creee = userId ? await insertRecetteGeneree(supabase, userId, { ...r, type_repas: r.type_repas ?? typeRepas }) : null
    setSauvegarde(null)
    if (!creee) {
      toast.error('Impossible d’enregistrer cette recette')
      return
    }
    onChoisir(creee)
  }

  return (
    <Dialog open={ouvert} onOpenChange={onOuvertChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remplacer ce repas</DialogTitle>
          <DialogDescription>Cherche un ingrédient, un plat ou une envie.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex. saumon, curry, pois chiches…" className="h-10 pl-9" />
        </div>

        <section className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Mes recettes</p>
          {miennes.length ? (
            miennes.map((r) => (
              <button key={r.id} type="button" className={LIGNE} onClick={() => onChoisir(r)}>
                <span className="min-w-0 truncate">{r.nom}</span>
                {r.calories ? <span className="shrink-0 text-xs text-muted-foreground">{r.calories} kcal</span> : null}
              </button>
            ))
          ) : (
            <p className="px-2 text-sm text-muted-foreground">Aucune recette enregistrée ne correspond.</p>
          )}
        </section>

        <section className="space-y-1">
          <Button type="button" variant="outline" size="sm" onClick={() => void chercherIA()} disabled={cherche} className="w-full">
            <Sparkles className="mr-1.5 size-4" /> {cherche ? 'Recherche…' : q.trim() ? `Idées IA avec « ${q.trim()} »` : 'Idées IA pour ce repas'}
          </Button>
          {ia.map((r) => (
            <button key={r.nom} type="button" className={LIGNE} disabled={!!sauvegarde} onClick={() => void choisirIA(r)}>
              <span className="min-w-0">
                <span className="block truncate">{r.nom}</span>
                <span className="block text-xs text-muted-foreground">
                  {r.calories ? `${r.calories} kcal · ` : ''}
                  {r.temps_min} min
                </span>
              </span>
              <span className="shrink-0 text-xs text-amber-700 dark:text-amber-300">{sauvegarde === r.nom ? '…' : 'Choisir'}</span>
            </button>
          ))}
        </section>
      </DialogContent>
    </Dialog>
  )
}
