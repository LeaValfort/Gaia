'use client'

import { useState, useEffect } from 'react'
import { Plus, ShoppingCart, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { getShoppingItems, addShoppingItem, toggleShoppingItem, deleteShoppingItem } from '@/lib/db/nutrition'
import { ListeCoursesItem } from './ListeCoursesItem'
import { ENSEIGNES_DEFAUT } from '@/lib/data/nutrition'
import type { ShoppingItemComplet, Enseigne } from '@/types'

interface ListeCoursesProps { userId: string; weekStart: string }

export function ListeCourses({ userId, weekStart }: ListeCoursesProps) {
  const [articles, setArticles] = useState<ShoppingItemComplet[]>([])
  const [chargement, setChargement] = useState(true)
  const [enseigneActive, setEnseigneActive] = useState<Enseigne | 'tous'>('tous')
  const [nomNouvel, setNomNouvel] = useState('')
  const [quantiteNouvel, setQuantiteNouvel] = useState('')
  const [formOuvert, setFormOuvert] = useState(false)

  useEffect(() => {
    getShoppingItems(supabase, userId, weekStart).then((data) => {
      setArticles(data)
      setChargement(false)
    })
  }, [userId, weekStart])

  const articlesFiltres = enseigneActive === 'tous'
    ? articles
    : articles.filter((a) => a.enseigne === enseigneActive)

  const nonCoches = articlesFiltres.filter((a) => !a.fait)
  const coches    = articlesFiltres.filter((a) => a.fait)

  async function handleToggle(id: string, fait: boolean) {
    setArticles((prev) => prev.map((a) => a.id === id ? { ...a, fait: !fait } : a))
    await toggleShoppingItem(supabase, userId, id, !fait)
  }

  async function handleDelete(id: string) {
    setArticles((prev) => prev.filter((a) => a.id !== id))
    await deleteShoppingItem(supabase, userId, id)
  }

  async function handleToutCocher() {
    const ids = nonCoches.map((a) => a.id)
    setArticles((prev) => prev.map((a) => ids.includes(a.id) ? { ...a, fait: true } : a))
    await Promise.all(ids.map((id) => toggleShoppingItem(supabase, userId, id, true)))
  }

  async function handleAjouter() {
    if (!nomNouvel.trim()) return
    const item = await addShoppingItem(supabase, userId, {
      week_start: weekStart, nom: nomNouvel.trim(),
      quantite: quantiteNouvel.trim() || null, categorie: null,
      enseigne: enseigneActive === 'tous' ? null : enseigneActive,
      rayon: null, source: 'manuel', fait: false,
    })
    if (item) setArticles((prev) => [...prev, item])
    setNomNouvel(''); setQuantiteNouvel(''); setFormOuvert(false)
  }

  function compteur(enseigne: Enseigne | 'tous') {
    const liste = enseigne === 'tous' ? articles : articles.filter((a) => a.enseigne === enseigne)
    const restants = liste.filter((a) => !a.fait).length
    return restants
  }

  if (chargement) return <div className="h-32 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />

  return (
    <div className="flex flex-col gap-4">

      {/* Onglets enseignes */}
      <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-none">
        {[{ id: 'tous' as const, label: 'Tous', emoji: '🛒' }, ...ENSEIGNES_DEFAUT].map((e) => {
          const nb = compteur(e.id as Enseigne | 'tous')
          return (
            <button key={e.id} onClick={() => setEnseigneActive(e.id as Enseigne | 'tous')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors shrink-0 ${enseigneActive === e.id ? 'bg-violet-600 text-white border-violet-600' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>
              {e.emoji} {e.label}
              {nb > 0 && <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${enseigneActive === e.id ? 'bg-white/30 text-white' : 'bg-red-500 text-white'}`}>{nb}</span>}
            </button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setFormOuvert((o) => !o)} className="flex items-center gap-1.5 text-xs">
          <Plus size={13} /> Ajouter
        </Button>
        {nonCoches.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleToutCocher} className="flex items-center gap-1.5 text-xs">
            <CheckCheck size={13} /> Tout cocher ({nonCoches.length})
          </Button>
        )}
      </div>

      {/* Formulaire ajout */}
      {formOuvert && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <Input placeholder="Nom de l'article *" value={nomNouvel} onChange={(e) => setNomNouvel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAjouter()} className="flex-1 text-sm h-8" />
            <Input placeholder="Quantité" value={quantiteNouvel} onChange={(e) => setQuantiteNouvel(e.target.value)}
              className="w-24 text-sm h-8" />
          </div>
          <Button size="sm" onClick={handleAjouter} disabled={!nomNouvel.trim()} className="self-end h-7 text-xs">
            Ajouter
          </Button>
        </div>
      )}

      {/* Liste */}
      {articlesFiltres.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-neutral-400">
          <ShoppingCart size={28} />
          <p className="text-sm">Liste vide — ajoute des articles ci-dessus</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {nonCoches.map((a) => <ListeCoursesItem key={a.id} article={a} onToggle={handleToggle} onDelete={handleDelete} />)}
          {coches.length > 0 && (
            <>
              <p className="text-xs text-neutral-400 px-3 pt-2 pb-1">✅ Dans le panier ({coches.length})</p>
              {coches.map((a) => <ListeCoursesItem key={a.id} article={a} onToggle={handleToggle} onDelete={handleDelete} />)}
            </>
          )}
        </div>
      )}

    </div>
  )
}
