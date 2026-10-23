'use client'

import { useCallback, useEffect, useState } from 'react'
import { CLE_PUBLIQUE_VAPID } from '@/lib/push/cle-publique'

export type EtatPush = 'chargement' | 'non_supporte' | 'ios_ecran_accueil' | 'refuse' | 'inactif' | 'actif'

function versUint8(base64: string): Uint8Array<ArrayBuffer> {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4)
  const brut = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'))
  const out = new Uint8Array(new ArrayBuffer(brut.length))
  for (let i = 0; i < brut.length; i++) out[i] = brut.charCodeAt(i)
  return out
}

function estIosHorsEcranAccueil(): boolean {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
  return ios && !standalone
}

/** Abonnement de cet appareil aux notifications push (activer / désactiver). */
export function useNotificationsPush() {
  const [etat, setEtat] = useState<EtatPush>('chargement')

  useEffect(() => {
    let annule = false
    const fixer = (e: EtatPush) => !annule && setEtat(e)
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      Promise.resolve().then(() => fixer(estIosHorsEcranAccueil() ? 'ios_ecran_accueil' : 'non_supporte'))
    } else if (Notification.permission === 'denied') {
      Promise.resolve().then(() => fixer('refuse'))
    } else {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((s) => fixer(s ? 'actif' : 'inactif'))
        .catch(() => fixer('non_supporte'))
    }
    return () => {
      annule = true
    }
  }, [])

  /** Lève une erreur lisible en cas d'échec. */
  const activer = useCallback(async () => {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setEtat(permission === 'denied' ? 'refuse' : 'inactif')
      throw new Error('Notifications non autorisées sur cet appareil.')
    }
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: versUint8(CLE_PUBLIQUE_VAPID) })
    const rep = await fetch('/api/notifications/abonnement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON()),
    })
    if (!rep.ok) throw new Error('Abonnement non enregistré, réessaie.')
    setEtat('actif')
  }, [])

  const desactiver = useCallback(async () => {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await fetch('/api/notifications/abonnement', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) })
      await sub.unsubscribe()
    }
    setEtat('inactif')
  }, [])

  return { etat, activer, desactiver }
}
