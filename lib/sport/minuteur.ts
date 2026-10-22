import type { LigneSeanceLibre } from '@/types'

/** Une étape du minuteur : un libellé et une durée. */
export interface EtapeMinuteur {
  label: string
  sec: number
}

/**
 * Transforme une ligne en suite d'étapes à décompter (vide si rien à minuter).
 * Ex. intervalles 3 × (30 s + 15 s) → [Effort 1/3, Récup 1/3, Effort 2/3, …].
 */
export function etapesMinuteur(l: LigneSeanceLibre): EtapeMinuteur[] {
  const nom = l.nom.trim()
  switch (l.type) {
    case 'mouvement': {
      if (!l.duree_sec) return []
      const series = Math.max(1, l.series ?? 1)
      return Array.from({ length: series }, (_, i) => ({ label: series > 1 ? `${nom} ${i + 1}/${series}` : nom, sec: l.duree_sec ?? 0 }))
    }
    case 'exercice': {
      if (l.unite !== 'secondes' || !l.reps) return []
      const series = Math.max(1, l.series ?? 1)
      return Array.from({ length: series }, (_, i) => ({ label: `${nom} ${i + 1}/${series}`, sec: l.reps ?? 0 }))
    }
    case 'intervalles': {
      const tours = Math.max(1, l.tours ?? 1)
      return Array.from({ length: tours }).flatMap((_, i) => [
        ...(l.effort_sec ? [{ label: `Effort ${i + 1}/${tours}`, sec: l.effort_sec }] : []),
        ...(l.recup_sec && i < tours - 1 ? [{ label: `Récup ${i + 1}/${tours}`, sec: l.recup_sec }] : []),
      ])
    }
    case 'circuit': {
      const tours = Math.max(1, l.tours ?? 1)
      return Array.from({ length: tours }).flatMap((_, i) => [
        ...l.mouvements.filter((m) => m.duree_sec).map((m) => ({ label: `${m.nom || 'Mouvement'} · tour ${i + 1}/${tours}`, sec: m.duree_sec ?? 0 })),
        ...(l.repos_sec && i < tours - 1 ? [{ label: `Repos ${i + 1}/${tours}`, sec: l.repos_sec }] : []),
      ])
    }
    case 'bloc': {
      if (!l.duree_min) return []
      const series = Math.max(1, l.series ?? 1)
      const sec = Math.round(l.duree_min * 60)
      return Array.from({ length: series }, (_, i) => ({ label: series > 1 ? `${nom} ${i + 1}/${series}` : nom, sec }))
    }
    default:
      return []
  }
}

export function formatSecondes(s: number): string {
  const m = Math.floor(s / 60)
  const r = s % 60
  return m ? `${m}:${String(r).padStart(2, '0')}` : `${r} s`
}

// Contexte audio partagé : sur iPhone, il doit être créé/réveillé pendant un
// geste de l'utilisatrice (appui sur ▶), sinon les bips suivants restent muets.
let audioCtx: AudioContext | null = null

export function deverrouillerSon(): void {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    audioCtx ??= new Ctx()
    if (audioCtx.state === 'suspended') void audioCtx.resume()
  } catch {
    audioCtx = null
  }
}

/** Bip court + vibration si le téléphone le permet (vibration absente sur iPhone). */
export function signalFinEtape(long = false): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(long ? [200, 100, 200] : 150)
    if (!audioCtx) return
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.frequency.value = long ? 660 : 880
    gain.gain.value = 0.15
    osc.connect(gain).connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + (long ? 0.5 : 0.18))
  } catch {
    // Son/vibration indisponibles : le minuteur continue sans signal.
  }
}
