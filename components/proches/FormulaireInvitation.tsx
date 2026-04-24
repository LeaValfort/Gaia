'use client'

import { useState } from 'react'
import { Copy, Link as LinkIcon, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { creerInvitationProche } from '@/lib/db/proches'
import { genererLienInvitation } from '@/lib/proches'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProcheConnection } from '@/types'

interface FormulaireInvitationProps {
  onInvite: (c: ProcheConnection) => void
  /** Mode contrôlé (ex. ouverture depuis la sidebar) */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function FormulaireInvitation({ onInvite, open: openCtrl, onOpenChange }: FormulaireInvitationProps) {
  const [interne, setInterne] = useState(false)
  const ouvert = openCtrl !== undefined ? openCtrl : interne
  const setOuvert = onOpenChange ?? setInterne
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [lien, setLien] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [envoi, setEnvoi] = useState(false)

  async function generer() {
    setEnvoi(true)
    setLien(null)
    setCode(null)
    const res = await creerInvitationProche(prenom, email.trim() || null)
    setEnvoi(false)
    if (!res.ok) {
      toast.error(res.message)
      return
    }
    const c = res.connection
    setCode(c.invite_code)
    setLien(genererLienInvitation(c.invite_code))
    onInvite(c)
    toast.success('Lien généré — partage-le avec ton proche.')
  }

  async function copier(texte: string) {
    try {
      await navigator.clipboard.writeText(texte)
      toast.success('Copié')
    } catch {
      toast.error('Copie impossible')
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      {openCtrl === undefined ? (
        <DialogTrigger
          type="button"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-violet-600 px-4 text-sm font-medium text-white hover:bg-violet-700"
        >
          <UserPlus className="h-4 w-4" />
          Inviter quelqu’un
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitation Proches</DialogTitle>
          <DialogDescription>
            Prénom du proche obligatoire. L’e-mail est optionnel (envoi automatique : plus tard).
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="space-y-1">
            <Label htmlFor="proche-prenom">Prénom du proche</Label>
            <Input
              id="proche-prenom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Ex : Alex"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="proche-mail">E-mail (optionnel)</Label>
            <Input
              id="proche-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@exemple.com"
            />
            {email.trim() ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Un e-mail pourra être envoyé plus tard.</p>
            ) : null}
          </div>
          {lien ? (
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 p-3 space-y-2 text-sm">
              <p className="font-medium text-neutral-800 dark:text-neutral-100 flex items-center gap-1">
                <LinkIcon size={14} /> Lien à partager
              </p>
              <p className="break-all text-xs text-violet-700 dark:text-violet-300">{lien}</p>
              <p className="text-xs text-neutral-500">Code : {code}</p>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => void copier(lien)}>
                  <Copy size={14} className="mr-1" /> Copier le lien
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => code && void copier(code)}>
                  <Copy size={14} className="mr-1" /> Copier le code
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setOuvert(false)}>
            Fermer
          </Button>
          {!lien ? (
            <Button type="button" disabled={envoi || !prenom.trim()} onClick={() => void generer()}>
              {envoi ? 'Génération…' : 'Générer le lien'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
