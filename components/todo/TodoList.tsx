'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { creerTodo, toggleTodo, supprimerTodo } from '@/lib/db/todo'
import type { Todo } from '@/types'

interface TodoListProps {
  todosInitiaux: Todo[]
  date: string
  /** Par défaut : « To-do du jour » */
  titre?: string
  messageVide?: string
}

export function TodoList({ todosInitiaux, date, titre = 'To-do du jour', messageVide }: TodoListProps) {
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>(todosInitiaux)
  const [nouveauTexte, setNouveauTexte] = useState('')
  const [chargement, setChargement] = useState(false)

  async function ajouterTodo() {
    const texte = nouveauTexte.trim()
    if (!texte) return
    setChargement(true)
    const todo = await creerTodo(date, texte)
    if (todo) {
      setTodos((prev) => [...prev, todo])
      setNouveauTexte('')
    }
    setChargement(false)
    router.refresh()
  }

  async function basculerTodo(id: string, etatActuel: boolean) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !etatActuel } : t))
    )
    await toggleTodo(id, !etatActuel)
  }

  async function effacerTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
    await supprimerTodo(id)
  }

  function soumettreFormulaire(e: React.FormEvent) {
    e.preventDefault()
    ajouterTodo()
  }

  const todosFaits = todos.filter((t) => t.done)
  const todosEnAttente = todos.filter((t) => !t.done)

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-4">
      <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
        To-do du jour
        {todosFaits.length > 0 && (
          <span className="ml-2 text-xs font-normal text-neutral-400">
            {todosFaits.length}/{todos.length} fait{todosFaits.length > 1 ? 's' : ''}
          </span>
        )}
      </h2>

      {/* Liste des todos en attente */}
      {todosEnAttente.length === 0 && todosFaits.length === 0 && (
        <p className="text-sm text-neutral-400 dark:text-neutral-500 py-2">
          {messageVide ?? "Aucune tâche pour aujourd'hui. Ajoutes-en une !"}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {todosEnAttente.map((todo) => (
          <div key={todo.id} className="flex items-center gap-3 group">
            <Checkbox
              id={todo.id}
              checked={false}
              onCheckedChange={() => basculerTodo(todo.id, false)}
            />
            <label
              htmlFor={todo.id}
              className="flex-1 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
            >
              {todo.text}
            </label>
            <button
              onClick={() => effacerTodo(todo.id)}
              className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all"
              aria-label="Supprimer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {/* Todos faits (grisés et barrés) */}
        {todosFaits.map((todo) => (
          <div key={todo.id} className="flex items-center gap-3 group opacity-50">
            <Checkbox
              id={todo.id}
              checked={true}
              onCheckedChange={() => basculerTodo(todo.id, true)}
            />
            <label
              htmlFor={todo.id}
              className="flex-1 text-sm line-through text-neutral-500 dark:text-neutral-500 cursor-pointer"
            >
              {todo.text}
            </label>
            <button
              onClick={() => effacerTodo(todo.id)}
              className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all"
              aria-label="Supprimer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Ajouter une tâche */}
      <form onSubmit={soumettreFormulaire} className="flex gap-2 pt-1">
        <input
          type="text"
          value={nouveauTexte}
          onChange={(e) => setNouveauTexte(e.target.value)}
          placeholder="Nouvelle tâche..."
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        />
        <Button type="submit" size="icon" disabled={chargement || !nouveauTexte.trim()} className="h-9 w-9">
          <Plus size={16} />
        </Button>
      </form>
    </div>
  )
}
