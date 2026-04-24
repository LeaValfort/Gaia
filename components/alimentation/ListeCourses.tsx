'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { getShoppingItems, toggleShoppingItem, deleteShoppingItem, deleteAllShoppingItemsForWeek } from '@/lib/db/courses'
import { ENSEIGNES_DEFAUT, getSemainesDisponibles } from '@/lib/data/courses'
import { grouperArticlesCourses } from '@/lib/courses-consolidation'
import { CarteEnseigne } from './CarteEnseigne'
import { FormulaireArticle } from './FormulaireArticle'
import type { ShoppingItemComplet } from '@/types'

interface ListeCoursesProps { userId: string; weekStart: string }

export function ListeCourses({ userId, weekStart: weekStartInitial }: ListeCoursesProps) {
  const semaines = getSemainesDisponibles()
  const [semaine, setSemaine] = useState(weekStartInitial)
  const [articles, setArticles] = useState<ShoppingItemComplet[]>([])
  const [chargement, setChargement] = useState(true)
  const [enseigneActive, setEnseigneActive] = useState<string | null>(null)
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [vidage, setVidage] = useState(false)

  useEffect(() => {
    setChargement(true)
    getShoppingItems(supabase, userId, semaine).then((data) => {
      setArticles(data)
      setChargement(false)
    })
  }, [userId, semaine])

  function nbRestants(enseigneId: string) {
    const subset = articles.filter((a) => (a.enseigne ?? 'grande_surface') === enseigneId && !a.fait)
    return grouperArticlesCourses(subset).length
  }

  async function handleToggleMany(ids: string[], nouvelEtatFait: boolean) {
    setArticles((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, fait: nouvelEtatFait } : a)))
    await Promise.all(ids.map((id) => toggleShoppingItem(supabase, id, nouvelEtatFait)))
  }

  async function handleDeleteMany(ids: string[]) {
    setArticles((prev) => prev.filter((a) => !ids.includes(a.id)))
    await Promise.all(ids.map((id) => deleteShoppingItem(supabase, id)))
  }

  async function handleToutCocher(enseigneId: string) {
    const ids = articles.filter((a) => (a.enseigne ?? 'grande_surface') === enseigneId && !a.fait).map((a) => a.id)
    setArticles((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, fait: true } : a)))
    await Promise.all(ids.map((id) => toggleShoppingItem(supabase, id, true)))
  }

  async function handleViderSemaine() {
    if (articles.length === 0) return
    const ok = window.confirm(
      'Supprimer tous les articles de la liste pour cette semaine ? Cette action est irréversible.'
    )
    if (!ok) return
    setVidage(true)
    await deleteAllShoppingItemsForWeek(supabase, userId, semaine)
    setArticles([])
    setEnseigneActive(null)
    setVidage(false)
  }

  const enseigneSelectionnee = ENSEIGNES_DEFAUT.find((e) => e.id === enseigneActive) ?? null

  return (
    <div className="flex flex-col gap-5">

      {/* Sélecteur de semaine */}
      <Select value={semaine} onValueChange={(v) => { if (v) setSemaine(v) }}>
        <SelectTrigger className="w-full sm:w-72 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {semaines.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {format(parseISO(`${s.value}T12:00:00`), 'd MMMM yyyy', { locale: fr })}
            </SelectItem>
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

          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="outline" size="sm" onClick={() => setFormulaireOuvert(true)} className="gap-1.5 text-xs">
              <Plus size={13} /> Ajouter un article
            </Button>
            {articles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                disabled={vidage}
                onClick={handleViderSemaine}
                className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-950/30"
              >
                <Trash2 size={13} /> {vidage ? 'Vidage…' : 'Vider les courses'}
              </Button>
            )}
          </div>

          {/* Carte enseigne sélectionnée */}
          {enseigneSelectionnee ? (
            <CarteEnseigne
              enseigne={enseigneSelectionnee}
              articles={articles.filter((a) => (a.enseigne ?? 'grande_surface') === enseigneSelectionnee.id)}
              onToggleMany={handleToggleMany}
              onDeleteMany={handleDeleteMany}
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
