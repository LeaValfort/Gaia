'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { EtiquetteAliment } from '@/components/alimentation/aliment/EtiquetteAliment'
import { PortionAliment } from '@/components/alimentation/aliment/PortionAliment'
import { alimentsParCodes, useRechercheAliments } from '@/hooks/useRechercheAliments'
import { ALIMENTS_RAPIDES } from '@/lib/nutrition/portion'
import { cn } from '@/lib/utils'
import type { AlimentAjoute, AlimentRecherche } from '@/types'

type Source = 'recherche' | 'etiquette'

/**
 * Ajout d'un aliment hors recette : raccourcis (pomme, œuf…), recherche CIQUAL,
 * ou étiquette du paquet (valeurs pour 100 g). Les macros s'ajoutent au repas.
 */
export function AjoutAliment({ onAjouter }: { onAjouter: (a: AlimentAjoute) => void }) {
  const [source, setSource] = useState<Source>('recherche')
  const [q, setQ] = useState('')
  const [choisi, setChoisi] = useState<{ aliment: AlimentRecherche; grammes: number } | null>(null)
  const { resultats, chargement, erreur } = useRechercheAliments(q)

  async function raccourci(code: string, grammes: number, label: string) {
    const [a] = await alimentsParCodes([code])
    if (a) setChoisi({ aliment: { ...a, nom: label }, grammes })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5">
        {(['recherche', 'etiquette'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSource(s)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs',
              source === s ? 'border-amber-500 bg-amber-50 font-medium dark:bg-amber-950/40' : 'border-neutral-200 text-muted-foreground dark:border-neutral-700'
            )}
          >
            {s === 'recherche' ? '🔎 Aliment' : '🏷️ Étiquette du paquet'}
          </button>
        ))}
      </div>

      {source === 'etiquette' ? (
        <EtiquetteAliment onAjouter={onAjouter} />
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {ALIMENTS_RAPIDES.map((a) => (
              <button
                key={a.code}
                type="button"
                onClick={() => void raccourci(a.code, a.grammes, a.label)}
                className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                {a.emoji} {a.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher un aliment (ex. riz, saumon)…" className="h-10 pl-9" />
          </div>
          {erreur ? <p className="text-sm text-red-600 dark:text-red-400">Recherche impossible pour le moment.</p> : null}
          {q.trim().length >= 2 && !chargement && !resultats.length && !erreur ? (
            <p className="text-sm text-muted-foreground">Aucun aliment trouvé : essaie l’onglet Étiquette du paquet.</p>
          ) : null}
          {resultats.length > 0 && !choisi ? (
            <ul className="max-h-48 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
              {resultats.map((r) => (
                <li key={r.code} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                  <button type="button" onClick={() => setChoisi({ aliment: r, grammes: 100 })} className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800/60">
                    {r.nom}
                    <span className="block text-xs text-muted-foreground">{Math.round(r.kcal)} kcal / 100 g</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {choisi ? (
            <PortionAliment
              key={`${choisi.aliment.code}-${choisi.grammes}`}
              nom={choisi.aliment.nom}
              pour100g={choisi.aliment}
              grammesInitial={choisi.grammes}
              onAjouter={(a) => {
                onAjouter(a)
                setChoisi(null)
                setQ('')
              }}
            />
          ) : null}
          <p className="text-[11px] text-muted-foreground">Valeurs : table CIQUAL (ANSES).</p>
        </>
      )}
    </div>
  )
}
