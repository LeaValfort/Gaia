'use client'

import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { LogIn } from 'lucide-react'
import { useState } from 'react'

/**
 * Bouton "Se connecter avec Google".
 * Doit être un Client Component car il déclenche une action au clic.
 * Après connexion, Google redirige vers /auth/callback.
 */
export default function BoutonConnexionGoogle() {
  const [chargement, setChargement] = useState(false)

  async function seConnecterAvecGoogle() {
    setChargement(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    // Pas besoin de setChargement(false) : la page va se rediriger
  }

  return (
    <Button
      onClick={seConnecterAvecGoogle}
      disabled={chargement}
      className="w-full flex items-center gap-3"
      size="lg"
    >
      <LogIn size={18} />
      {chargement ? 'Redirection...' : 'Continuer avec Google'}
    </Button>
  )
}
