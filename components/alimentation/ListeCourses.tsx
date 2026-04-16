'use client'

import { useState, useEffect } from 'react'
import { Plus, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { getShoppingItems, toggleShoppingItem, deleteShoppingItem } from '@/lib/db/courses'
import { ENSEIGNES_DEFAUT, getSemainesDisponibles } from '@/lib/data/courses'
import { CarteEnseigne } from './CarteEnseigne'
import { FormulaireArticle } from './FormulaireArticle'
import type { ShoppingItemComplet, Enseigne } from '@/types'

interface ListeCoursesProps { userId: string; weekStart: string }

export function ListeCourses({ userId, weekStart: weekStartInitial }: ListeCoursesProps) {
  const semaines = getSemainesDisponibles()
  const [semaine, setSemaine] = useState(weekStartInitial)
  const [articles, setArticles] = useState<ShoppingItemComplet[]>([])
  const [chargement, setChargement] = useState(true)
  const [enseigneActive, setEnseigneActive] = useState<string | null>(null)
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)

  useEffect(() => {
    setChargement(true)
    getShoppingItems(supabase, userId, semaine).then((data) => {
      setArticles(data)
      setChargement(false)
    })
  }, [userId, semaine])

  function nbRestants(enseigneId: string) {
    return articles.filter((a) => (a.enseigne ?? 'grande_surface') === enseigneId && !a.fait).length
  }

  async function handleToggle(id: string, fait: boolean) {
    setArticles((prev) => prev.map((a) => a.id === id ? { ...a, fait: !fait } : a))
    await toggleShoppingItem(supabase, id, !fait)
  }

  async function handleDelete(id: string) {
    setArticles((prev) => prev.filter((a) => a.id !== id))
    await deleteShoppingItem(supabase, id)
  }

  async function handleToutCocher(enseigneId: string) {
    const ids = articles.filter((a) => (a.enseigne ?? 'grande_surface') === enseigneId && !a.fait).map((a) => a.id)
    setArticles((prev) => prev.map((a) => ids.includes(a.id) ? { ...a, fait: true } : a))
    await Promise.all(ids.map((id) => toggleShoppingItem(supabase, id, true)))
  }

  const enseigneSelectionnee = ENSEIGNES_DEFAUT.find((e) => e.id === enseigneActive) ?? null

  return (
    <div className="flex flex-col gap-5">

      {/* Sélecteur de semaine */}
      <Select value={semaine} onValueChange={setSemaine}>
        <SelectTrigger className="w-full sm:w-72 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {semaines.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {chargement ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Grille enseignes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ENSEIGNES_DEFAUT.map((e) => {
              const nb = nbRestants(e.id)
              const actif = enseigneActive === e.id
              return (
                <button key={e.id} onClick={() => setEnseigneActive(actif ? null : e.id)}
                  className={`relative rounded-2xl p-4 text-left transition-all border-2 ${actif ? 'border-violet-500 shadow-md' : 'border-transparent'} ${e.couleur}`}>
                  <p className="text-2xl mb-1">{e.emoji}</p>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 leading-tight">{e.label}</p>
                  {nb > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {nb}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Bouton ajouter */}
          <Button variant="outline" size="sm" onClick={() => setFormulaireOuvert(true)} className="self-start gap-1.5 text-xs">
            <Plus size={13} /> Ajouter un article
          </Button>

          {/* Carte enseigne sélectionnée */}
          {enseigneSelectionnee ? (
            <CarteEnseigne
              enseigne={enseigneSelectionnee}
              articles={articles.filter((a) => (a.enseigne ?? 'grande_surface') === enseigneSelectionnee.id)}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onToutCocher={() => handleToutCocher(enseigneSelectionnee.id)}
            />
          ) : (
            articles.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-neutral-400">
                <ShoppingCart size={28} />
                <p className="text-sm">Aucun article cette semaine — clique sur &ldquo;Ajouter un article&rdquo;</p>
              </div>
            )
          )}
        </>
      )}

      {/* Dialog formulaire */}
      {formulaireOuvert && (
        <FormulaireArticle
          enseignes={ENSEIGNES_DEFAUT}
          weekStart={semaine}
          userId={userId}
          onAjoute={(a) => setArticles((prev) => [...prev, a])}
          onFermer={() => setFormulaireOuvert(false)}
        />
      )}

    </div>
  )
}
