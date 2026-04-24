'use client'

import type { CSSProperties } from 'react'
import { TodoList } from '@/components/todo/TodoList'
import { designPhaseAffichage } from '@/lib/cycle'
import type { Phase, Todo } from '@/types'
import { cn } from '@/lib/utils'

const CARD =
  'rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900'

export interface TodoDuJourProps {
  userId: string
  date: string
  phase: Phase | null
  sansCycle?: boolean
  todosInitiaux: Todo[]
}

export function TodoDuJour({ userId: _userId, date, phase, sansCycle, todosInitiaux }: TodoDuJourProps) {
  const d = designPhaseAffichage(phase, { sansCycle })
  const vars: CSSProperties = { ['--phase-accent' as string]: d.accent }

  return (
    <div className={cn(CARD, 'todo-du-jour')} style={{ ...vars, borderColor: `${d.accent}44` }}>
      <TodoList todosInitiaux={todosInitiaux} date={date} titre="To-do du jour" />
    </div>
  )
}
