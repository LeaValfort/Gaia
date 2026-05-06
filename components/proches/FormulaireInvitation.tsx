'use client'

import { useEffect, useState } from 'react'
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
import { cn } from '@/lib/utils'
import type { ProcheConnection, ProcheRelationType } from '@/types'

const LABEL_RELATION: Record<ProcheRelationType, string> = {
  partenaire: 'Partenaire',
  ami: 'Ami·e',
  famille: 'Famille',
}

interface FormulaireInvitationProps {
  onInvite: (c: ProcheConnection) => void
  /** Mode contrôlé (ex. ouverture depuis la sidebar) */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function FormulaireInvitation({
  onInvite,
  open: openCtrl,
  onOpenChange,
}: FormulaireInvitationProps) {
  const [interne, setInterne] = useState(false)
  const ouvert = openCtrl !== undefined ? openCtrl : interne
  const setOuvert = onOpenChange ?? setInterne
  const [prenom, setPrenom] = useState('')
  const [relationType, setRelationType] = useState<ProcheRelationType>('partenaire')
  const [lien, setLien] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [envoi, setEnvoi] = useState(false)

  useEffect(() => {
    if (ouvert) return
    setPrenom('')
    setRelationType('partenaire')
    setLien(null)
    setCode(null)
  }, [ouvert])

  async function generer() {
    setEnvoi(true)
    setLien(null)
    setCode(null)
    const res = await creerInvitationProche(prenom, null, relationType)
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invitation Proches</DialogTitle>
          <DialogDescription>
            Prénom du proche obligatoire. Choisis son statut (partenaire, ami·e, famille), puis génère un lien à
            partager toi-même par WhatsApp, SMS ou autre.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="space-y-1">
            <Label htmlFor="proche-relation">Statut (relation)</Label>
            <select
              id="proche-relation"
              value={relationType}
              disabled={!!lien}
              onChange={(e) => setRelationType(e.target.value as ProcheRelationType)}
              className={cn(
                'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
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
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Ex : Alex"
            />
          </div>
          {lien ? (
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 p-3 space-y-3 text-sm">
              <p className="font-medium text-neutral-800 dark:text-neutral-100 flex items-center gap-1">
                <LinkIcon size={14} /> Lien à partager
              </p>
              <p className="break-all text-xs text-violet-700 dark:text-violet-300">{lien}</p>
              <p className="text-xs text-neutral-500">Code : {code}</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <strong className="text-neutral-800 dark:text-neutral-200">C’est enregistré.</strong> Ce proche est
                déjà dans ta liste (invitation en attente), avec le statut « {LABEL_RELATION[relationType]} ». Tu peux
                fermer avec <strong>Terminer</strong> : il ne te reste qu’à partager ce lien.
              </p>
              <div className="flex flex-wrap gap-2">
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
          {!lien ? (
            <>
              <Button type="button" variant="outline" onClick={() => setOuvert(false)}>
                Annuler
              </Button>
              <Button type="button" disabled={envoi || !prenom.trim()} onClick={() => void generer()}>
                {envoi ? 'Génération…' : 'Générer le lien'}
              </Button>
            </>
          ) : (
            <Button type="button" className="w-full sm:w-auto" onClick={() => setOuvert(false)}>
              Terminer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
