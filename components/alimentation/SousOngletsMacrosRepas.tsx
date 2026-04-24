'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type CleMacro = 'calories' | 'proteines' | 'glucides' | 'lipides'

const CLES: CleMacro[] = ['calories', 'proteines', 'glucides', 'lipides']
const LIB: Record<CleMacro, string> = {
  calories: 'Calories',
  proteines: 'Protéines',
  glucides: 'Glucides',
  lipides: 'Lipides / mat. grasses',
}

function parseN(v: string, max: number): number {
  const n = Number.parseInt(v.replace(/\D/g, ''), 10)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(max, n))
}

interface SousOngletsMacrosRepasProps {
  macro: CleMacro
  onMacro: (m: CleMacro) => void
  act: Record<CleMacro, string>
  setAct: Dispatch<SetStateAction<Record<CleMacro, string>>>
  obj: Record<CleMacro, string>
  setObj: Dispatch<SetStateAction<Record<CleMacro, string>>>
  def: Record<CleMacro, number>
}

export function SousOngletsMacrosRepas({ macro, onMacro, act, setAct, obj, setObj, def }: SousOngletsMacrosRepasProps) {
  return (
    <Tabs value={macro} onValueChange={(v) => onMacro(v as CleMacro)}>
      <TabsList className="w-full grid grid-cols-4 h-auto min-h-9 gap-0.5 p-1 text-[10px]">
        {CLES.map((c) => (
          <TabsTrigger key={c} value={c} className="px-1">{LIB[c]}</TabsTrigger>
        ))}
      </TabsList>
      {CLES.map((c) => {
        const maxM = c === 'calories' ? 20000 : 1000
        const aC = parseN(act[c], maxM)
        const oC = parseN(obj[c], maxM)
        const pctC = oC > 0 ? Math.min(100, Math.round((aC / oC) * 100)) : 0
        return (
          <TabsContent key={c} value={c} className="mt-3 space-y-3">
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Auto ce repas : {def[c]} {c === 'calories' ? 'kcal' : 'g'} (modifiable à droite).
            </p>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-200">Actuel</Label>
                <Input
                  className="h-11 text-lg font-semibold tabular-nums"
                  inputMode="numeric"
                  value={act[c]}
                  onChange={(e) => setAct((s) => ({ ...s, [c]: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-200">Objectif</Label>
                <Input
                  className="h-11 text-lg font-semibold tabular-nums"
                  inputMode="numeric"
                  value={obj[c]}
                  onChange={(e) => setObj((s) => ({ ...s, [c]: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500 w-10 shrink-0">Avancée</span>
              <div className="flex-1 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${pctC}%` }} />
              </div>
              <span className="text-xs tabular-nums text-neutral-600 dark:text-neutral-300 w-12 text-right">{pctC}%</span>
            </div>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
