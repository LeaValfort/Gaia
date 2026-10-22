'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { deverrouillerSon, signalFinEtape, type EtapeMinuteur } from '@/lib/sport/minuteur'

/**
 * Compte à rebours sur une suite d'étapes. Basé sur l'heure de fin (et non
 * sur un compteur décrémenté) pour rester juste si l'onglet passe en arrière-plan.
 */
export function useMinuteur(etapes: EtapeMinuteur[]) {
  const [index, setIndex] = useState(0)
  const [restant, setRestant] = useState(etapes[0]?.sec ?? 0)
  const [actif, setActif] = useState(false)
  const [fini, setFini] = useState(false)
  const finRef = useRef<number | null>(null)

  // Index courant aussi en ref : l'intervalle le lit sans effet de bord dans un updater.
  const indexRef = useRef(0)
  const allerA = (i: number) => {
    indexRef.current = i
    setIndex(i)
  }

  useEffect(() => {
    if (!actif) return
    const id = window.setInterval(() => {
      const fin = finRef.current
      if (fin == null) return
      const r = Math.max(0, Math.ceil((fin - Date.now()) / 1000))
      setRestant(r)
      if (r > 0) return
      // Étape terminée : on passe à la suivante, ou on s'arrête après la dernière.
      const suivant = indexRef.current + 1
      if (suivant >= etapes.length) {
        signalFinEtape(true)
        finRef.current = null
        setActif(false)
        setFini(true)
        return
      }
      signalFinEtape()
      finRef.current = Date.now() + etapes[suivant].sec * 1000
      allerA(suivant)
      setRestant(etapes[suivant].sec)
    }, 250)
    return () => window.clearInterval(id)
  }, [actif, etapes])

  const demarrer = useCallback(() => {
    if (!etapes.length) return
    deverrouillerSon()
    if (fini) {
      allerA(0)
      setFini(false)
      finRef.current = Date.now() + etapes[0].sec * 1000
      setRestant(etapes[0].sec)
    } else {
      finRef.current = Date.now() + restant * 1000
    }
    setActif(true)
  }, [etapes, fini, restant])

  const pause = useCallback(() => {
    finRef.current = null
    setActif(false)
  }, [])

  const reinitialiser = useCallback(() => {
    finRef.current = null
    setActif(false)
    setFini(false)
    allerA(0)
    setRestant(etapes[0]?.sec ?? 0)
  }, [etapes])

  return { etape: etapes[index] ?? null, index, total: etapes.length, restant, actif, fini, demarrer, pause, reinitialiser }
}
