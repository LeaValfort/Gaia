'use client'

// Composant générique de sélection par pills cliquables.
// multiSelect=true (défaut) → plusieurs sélections possible.
// multiSelect=false         → une seule valeur à la fois.

interface PillsSelectorProps {
  label: string
  options: readonly string[]
  selected: string[]
  onChange: (selected: string[]) => void
  multiSelect?: boolean
  /** Masque le titre au-dessus des pills (ex. titre déjà sur l’en-tête repliable) */
  masquerLabel?: boolean
}

export function PillsSelector({
  label,
  options,
  selected,
  onChange,
  multiSelect = true,
  masquerLabel = false,
}: PillsSelectorProps) {
  function toggleOption(option: string) {
    if (multiSelect) {
      onChange(
        selected.includes(option)
          ? selected.filter((s) => s !== option)
          : [...selected, option]
      )
    } else {
      // Choix unique : désélectionner si déjà sélectionné, sinon remplacer
      onChange(selected.includes(option) ? [] : [option])
    }
  }

  return (
    <div>
      {!masquerLabel ? (
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
          {label}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const estSelectionne = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                ${estSelectionne
                  ? 'bg-violet-100 border-violet-400 text-violet-800 dark:bg-violet-900/30 dark:border-violet-500 dark:text-violet-300'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 bg-white dark:bg-neutral-900'
                }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
