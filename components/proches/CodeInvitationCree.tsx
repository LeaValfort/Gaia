'use client'

import { Check, Copy, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ProcheConnection } from '@/types'

/** Contenu de la boîte de dialogue une fois l'invitation créée : affiche le code d'invitation
 *  à donner au proche (extrait de BoutonInviterProche.tsx pour respecter la règle des 150
 *  lignes/fichier). Avant le correctif du 23/09, la boîte se fermait immédiatement après
 *  création et le code n'était jamais visible — impossible à transmettre au proche. */
export function CodeInvitationCree({
  connexion,
  prenom,
  codeCopie,
  onCopierCode,
  onPartager,
  onFermer,
}: {
  connexion: ProcheConnection
  prenom: string
  codeCopie: boolean
  onCopierCode: () => void
  onPartager: () => void
  onFermer: () => void
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Invitation créée</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 py-1">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Donne ce code à {prenom || 'ton proche'} : il doit l&apos;entrer dans « Proches » →
          « Ajouter un code » depuis son propre compte.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-md border border-input bg-neutral-50 px-3 py-2 text-center text-lg font-semibold tracking-wide dark:bg-neutral-900">
            {connexion.invite_code}
          </div>
          <Button type="button" variant="outline" size="icon" onClick={onCopierCode}>
            {codeCopie ? (
              <Check className="size-4 text-emerald-600" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
            <span className="sr-only">Copier le code</span>
          </Button>
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={onPartager}>
          <Share2 className="size-4 mr-2" aria-hidden />
          Partager le lien
        </Button>
      </div>
      <DialogFooter>
        <Button type="button" className="w-full" onClick={onFermer}>
          Fermer
        </Button>
      </DialogFooter>
    </>
  )
}
