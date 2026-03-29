'use client'

interface RessentiBoutonsProps {
  valeur: number
  onChange: (val: number) => void
}

export function RessentiBoutons({ valeur, onChange }: RessentiBoutonsProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Ressenti</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all
              ${valeur === val
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 scale-110'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  )
}
