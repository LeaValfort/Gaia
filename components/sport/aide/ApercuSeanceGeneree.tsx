import { libelleNage, totauxDepuisBlocs } from '@/lib/data/swimming'
import { dureeBlocsMin } from '@/lib/sport/seance-libre'
import type { LigneSeanceLibre, SeanceGeneree } from '@/types'

/** Texte court d'une ligne de séance libre (aperçu). */
function resumeLigne(l: LigneSeanceLibre): string {
  switch (l.type) {
    case 'exercice':
      return `${l.series ?? 1} × ${l.reps ?? '?'} ${l.unite === 'secondes' ? 's' : 'reps'}${l.charge_kg ? ` · ${l.charge_kg} kg` : ''}`
    case 'bloc':
      return [l.series && l.series > 1 ? `${l.series} ×` : null, l.duree_min ? `${l.duree_min} min` : null, l.distance_m ? `${l.distance_m} m` : null].filter(Boolean).join(' ')
    case 'mouvement':
      return `${l.series ?? 1} × ${l.duree_sec ?? '?'} s`
    case 'intervalles':
      return `${l.tours ?? '?'} × (${l.effort_sec ?? '?'} s effort / ${l.recup_sec ?? '?'} s récup)`
    case 'circuit':
      return `${l.tours ?? '?'} tours : ${l.mouvements.map((m) => m.nom).join(', ')}`
    default:
      return ''
  }
}

/** Aperçu lisible de la séance proposée, avant d'en faire un programme. */
export function ApercuSeanceGeneree({ seance: s }: { seance: SeanceGeneree }) {
  const lignes: { nom: string; detail: string }[] = [
    ...s.exercices.map((e) => ({ nom: e.nom, detail: `${e.seriesDefaut} × ${e.repsDefaut} ${e.unite === 'secondes' ? 's' : 'reps'} · repos ${e.reposSecondes} s` })),
    ...s.blocs.map((b) => ({ nom: libelleNage(b.nage), detail: `${b.distanceM} m` })),
    ...s.postures.map((p) => ({ nom: p.nom, detail: `${p.dureeSec} s${p.benefice ? ` · ${p.benefice}` : ''}` })),
    ...s.lignes.map((l) => ({ nom: l.nom, detail: resumeLigne(l) })),
  ]
  const total = s.blocs.length
    ? `${totauxDepuisBlocs(s.blocs).distanceTotale} m au total`
    : s.postures.length
      ? `≈ ${Math.round(s.postures.reduce((t, p) => t + p.dureeSec, 0) / 60)} min de postures`
      : s.lignes.length && dureeBlocsMin(s.lignes)
        ? `≈ ${dureeBlocsMin(s.lignes)} min`
        : null

  return (
    <div className="space-y-2">
      {s.conseil ? <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">💡 {s.conseil}</p> : null}
      <ol className="space-y-1.5">
        {lignes.map((l, i) => (
          <li key={i} className="flex gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800">
            <span className="w-5 shrink-0 text-xs text-muted-foreground">{i + 1}.</span>
            <span className="min-w-0">
              <span className="font-medium text-neutral-900 dark:text-neutral-50">{l.nom}</span>
              <span className="block text-xs text-muted-foreground">{l.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      {total ? <p className="text-xs text-muted-foreground">{total}</p> : null}
    </div>
  )
}
