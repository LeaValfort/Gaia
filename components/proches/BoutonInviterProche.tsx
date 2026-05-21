'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { creerInvitationProche } from '@/lib/db/proches'
import { genererLienInvitation } from '@/lib/proches'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ProcheConnection, ProcheRelationType } from '@/types'

async function partagerLien(lien: string, prenomProche: string): Promise<void> {
  const text = `${prenomProche}, rejoins-moi sur Gaia pour que je puisse partager mon cycle avec toi.`
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'Invitation Gaia', text, url: lien })
      toast.success('Invitation partagée')
      return
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
    }
  }
  await navigator.clipboard.writeText(lien)
  toast.success('Lien copié dans le presse-papier')
}

export function BoutonInviterProche({ onInvite }: { onInvite: (c: ProcheConnection) => void }) {
  const [ouvert, setOuvert] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [relationType, setRelationType] = useState<ProcheRelationType>('partenaire')
  const [envoi, setEnvoi] = useState(false)

  function fermer() {
    setOuvert(false)
    setPrenom('')
    setRelationType('partenaire')
  }

  async function inviter() {
    const nom = prenom.trim()
    if (!nom) return
    setEnvoi(true)
    try {
      const res = await creerInvitationProche(nom, null, relationType)
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      const lien = genererLienInvitation(res.connection.invite_code)
      onInvite(res.connection)
      fermer()
      await partagerLien(lien, nom)
    } catch {
      toast.error('Invitation impossible')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        className="w-full bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500"
        onClick={() => setOuvert(true)}
      >
        <UserPlus className="size-4 mr-2" aria-hidden />
        Inviter un proche
      </Button>

      <Dialog
        open={ouvert}
        onOpenChange={(next) => {
          if (!next) fermer()
          else setOuvert(true)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inviter un proche</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label htmlFor="proche-relation">Relation</Label>
              <select
                id="proche-relation"
                value={relationType}
                disabled={envoi}
                onChange={(e) => setRelationType(e.target.value as ProcheRelationType)}
                className={cn(
                  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30'
                )}
              >
                <option value="partenaire">Partenaire</option>
                <option value="ami">Ami·e</option>
                <option value="famille">Famille</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="proche-prenom">Prénom du proche</Label>
              <Input
                id="proche-prenom"
                value={prenom}
                disabled={envoi}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Ex : Alex"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" disabled={envoi} onClick={fermer}>
              Annuler
            </Button>
            <Button type="button" disabled={envoi || !prenom.trim()} onClick={() => void inviter()}>
              {envoi ? 'Envoi…' : 'Inviter et partager'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
