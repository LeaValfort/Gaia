'use client'

import { useState, useTransition } from 'react'
import { Trash2, Copy, ShoppingCart, Plus, Check, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PHASE_STYLES, LISTE_COURSES_PHASE } from '@/lib/nutrition'
import { supprimerRecette } from '@/lib/db/recipes'
import { addShoppingItem, toggleShoppingItem, supprimerShoppingItem, genererListeCourses } from '@/lib/db/recipes'
import type { Recipe, ShoppingItem, Phase, TypeRepas } from '@/types'

const PHASES: { id: Phase; label: string }[] = [
  { id: 'menstruation', label: '🩸 Menstruation' },
  { id: 'folliculaire', label: '🌱 Folliculaire' },
  { id: 'ovulation', label: '🌸 Ovulation' },
  { id: 'luteale', label: '🍂 Lutéale' },
]
const TYPES: { id: TypeRepas; label: string }[] = [
  { id: 'petit-dej', label: '☀️ Petit-déj' }, { id: 'dejeuner', label: '🍽️ Déjeuner' },
  { id: 'collation', label: '🍎 Collation' }, { id: 'diner', label: '🌙 Dîner' },
]

interface RecettesCoursesProps {
  recettesInitiales: Recipe[]
  articlesInitiaux: ShoppingItem[]
  weekStart: string
  phase: Phase | null
}

export function RecettesCourses({ recettesInitiales, articlesInitiaux, weekStart, phase }: RecettesCoursesProps) {
  const [onglet, setOnglet] = useState<'recettes' | 'courses'>('recettes')
  const [recettes, setRecettes] = useState(recettesInitiales)
  const [articles, setArticles] = useState(articlesInitiaux)
  const [filtrePhase, setFiltrePhase] = useState<Phase | null>(null)
  const [filtreType, setFiltreType] = useState<TypeRepas | null>(null)
  const [nouvelArticle, setNouvelArticle] = useState('')
  const [isPending, startTransition] = useTransition()

  const recettesFiltrees = recettes.filter((r) => {
    if (filtrePhase && r.phase !== filtrePhase) return false
    if (filtreType && r.type_repas !== filtreType) return false
    return true
  })

  function supprimerRecetteLocale(id: string) {
    setRecettes((prev) => prev.filter((r) => r.id !== id))
    startTransition(() => supprimerRecette(id))
  }

  function toggleArticle(id: string, fait: boolean) {
    setArticles((prev) => prev.map((a) => a.id === id ? { ...a, fait: !fait } : a))
    startTransition(() => toggleShoppingItem(id, !fait))
  }

  function supprimerArticle(id: string) {
    setArticles((prev) => prev.filter((a) => a.id !== id))
    startTransition(() => supprimerShoppingItem(id))
  }

  async function ajouterArticle() {
    if (!nouvelArticle.trim()) return
    const nom = nouvelArticle.trim()
    setNouvelArticle('')
    await addShoppingItem(weekStart, nom)
    setArticles((prev) => [...prev, { id: Date.now().toString(), user_id: '', week_start: weekStart, nom, quantite: null, categorie: null, fait: false, created_at: '' }])
  }

  async function generer() {
    const phaseCourante = phase ?? 'folliculaire'
    const noms = LISTE_COURSES_PHASE[phaseCourante]
    await genererListeCourses(weekStart, noms)
    setArticles((prev) => {
      const existants = new Set(prev.map((a) => a.nom.toLowerCase()))
      const nouveaux = noms.filter((n) => !existants.has(n.toLowerCase())).map((nom, i) => ({ id: `gen-${i}`, user_id: '', week_start: weekStart, nom, quantite: null, categorie: null, fait: false, created_at: '' }))
      return [...prev, ...nouveaux]
    })
  }

  function copier() {
    const texte = articles.filter((a) => !a.fait).map((a) => `• ${a.nom}`).join('\n')
    navigator.clipboard.writeText(texte)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sous-onglets */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        {(['recettes', 'courses'] as const).map((t) => (
          <button key={t} onClick={() => setOnglet(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${onglet === t ? 'border-violet-600 text-violet-600 dark:text-violet-400 dark:border-violet-400' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
            {t === 'recettes' ? '🍳 Mes recettes' : '🛒 Liste de courses'}
          </button>
        ))}
      </div>

      {/* ── RECETTES ── */}
      {onglet === 'recettes' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {PHASES.map(({ id, label }) => (
              <button key={id} onClick={() => setFiltrePhase(filtrePhase === id ? null : id)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${filtrePhase === id ? PHASE_STYLES[id].pill + ' border-transparent' : 'border-neutral-200 dark:border-neutral-700 text-neutral-500'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(({ id, label }) => (
              <button key={id} onClick={() => setFiltreType(filtreType === id ? null : id)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${filtreType === id ? 'bg-violet-600 text-white border-violet-600' : 'border-neutral-200 dark:border-neutral-700 text-neutral-500'}`}>
                {label}
              </button>
            ))}
          </div>

          {recettesFiltrees.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">Aucune recette sauvegardée pour ces filtres.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recettesFiltrees.map((recette) => (
                <div key={recette.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-50">{recette.nom}</p>
                    <button onClick={() => supprimerRecetteLocale(recette.id)} className="text-neutral-400 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {recette.temps_min && (
                    <span className="flex items-center gap-1 text-xs text-neutral-500"><Clock size={11} />{recette.temps_min} min</span>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {recette.ingredients.map((ing) => (
                      <span key={ing} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs text-neutral-600 dark:text-neutral-300">{ing}</span>
                    ))}
                  </div>
                  {recette.raison && <p className="text-xs text-neutral-500 italic">{recette.raison}</p>}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {recette.phase && <span className={`px-2 py-0.5 rounded-full text-xs ${PHASE_STYLES[recette.phase as Phase]?.pill ?? ''}`}>{recette.phase}</span>}
                    {recette.type_repas && <span className="px-2 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-500">{recette.type_repas}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── COURSES ── */}
      {onglet === 'courses' && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={generer} disabled={isPending} className="flex items-center gap-1.5">
              <ShoppingCart size={14} /> Générer depuis le plan
            </Button>
            <Button variant="outline" size="sm" onClick={copier} className="flex items-center gap-1.5">
              <Copy size={14} /> Copier la liste
            </Button>
          </div>

          {/* Ajout manuel */}
          <div className="flex gap-2">
            <Input placeholder="Ajouter un article..." value={nouvelArticle} onChange={(e) => setNouvelArticle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ajouterArticle()} className="flex-1 text-sm" />
            <Button size="sm" onClick={ajouterArticle} className="shrink-0"><Plus size={14} /></Button>
          </div>

          {articles.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">Ta liste est vide. Génère-la depuis le plan de la semaine.</p>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-xs text-neutral-400 mb-1">
                {articles.filter((a) => a.fait).length}/{articles.length} articles cochés
              </p>
              {articles.map((article) => (
                <div key={article.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${article.fait ? 'opacity-50' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}>
                  <button onClick={() => toggleArticle(article.id, article.fait)}
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${article.fait ? 'bg-violet-600 border-violet-600' : 'border-neutral-300 dark:border-neutral-600'}`}>
                    {article.fait && <Check size={11} className="text-white" />}
                  </button>
                  <span className={`flex-1 text-sm ${article.fait ? 'line-through text-neutral-400' : 'text-neutral-700 dark:text-neutral-300'}`}>{article.nom}</span>
                  <button onClick={() => supprimerArticle(article.id)} className="text-neutral-300 hover:text-red-500 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
