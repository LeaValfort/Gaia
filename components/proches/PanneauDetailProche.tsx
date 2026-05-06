'use client'

import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Check, Copy, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { genererLienInvitation } from '@/lib/proches'
import {
  revoquerConnexionProche,
  supprimerConnexionProche,
  updateProcheConnection,
  type PatchProcheConnection,
} from '@/lib/db/proches'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProchesInterrupteursPartage } from '@/components/proches/ProchesInterrupteursPartage'
import { cn } from '@/lib/utils'
import type { ProcheConnection } from '@/types'

function libelleCourtLien(url: string): string {
  try {
    const u = new URL(url)
    return `${u.host}${u.pathname}`
  } catch {
    return url
  }
}

export function PanneauDetailProche({
  connection,
  onRefresh,
  onRevoque,
  embed,
  prenomOwner,
}: {
  connection: ProcheConnection
  onRefresh: () => void
  onRevoque: () => void
  embed?: boolean
  /** Prénom de l’utilisatrice (objet e-mail Resend) */
  prenomOwner?: string | null
}) {
  const [revoqueOpen, setRevoqueOpen] = useState(false)
  const [copieOk, setCopieOk] = useState(false)
  const [suppr, setSuppr] = useState(false)
  const [r1, setR1] = useState(connection.notif_debut_regles)
  const [r2, setR2] = useState(connection.notif_energie_basse)
  const [r3, setR3] = useState(connection.notif_douleur_haute)
  const [vp, setVp] = useState(connection.voir_phase)
  const [ve, setVe] = useState(connection.voir_energie)
  const [vd, setVd] = useState(connection.voir_douleur)
  const [vh, setVh] = useState(connection.voir_humeur)
  const [vc, setVc] = useState(connection.voir_conseils)
  const [vl, setVl] = useState(connection.voir_libido)
  const [vs, setVs] = useState(connection.voir_symptomes)
  const [emailInvite, setEmailInvite] = useState('')
  const [envoiMail, setEnvoiMail] = useState(false)

  useEffect(() => {
    setR1(connection.notif_debut_regles)
    setR2(connection.notif_energie_basse)
    setR3(connection.notif_douleur_haute)
    setVp(connection.voir_phase)
    setVe(connection.voir_energie)
    setVd(connection.voir_douleur)
    setVh(connection.voir_humeur)
    setVc(connection.voir_conseils)
    setVl(connection.voir_libido)
    setVs(connection.voir_symptomes)
    setEmailInvite(
      connection.invite_email?.trim() ||
        connection.partner_email?.trim() ||
        ''
    )
  }, [connection])

  const lien = genererLienInvitation(connection.invite_code)
  const court = libelleCourtLien(lien)

  async function copier() {
    try {
      await navigator.clipboard.writeText(lien)
      setCopieOk(true)
      setTimeout(() => setCopieOk(false), 2000)
      toast.success('Lien copié')
    } catch {
      toast.error('Copie impossible')
    }
  }

  async function envoyerEmailInvite() {
    if (connection.status !== 'pending' || !emailInvite.trim() || !connection.invite_code) return
    setEnvoiMail(true)
    try {
      const res = await fetch('/api/proches/invite', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInvite.trim(),
          prenomProche: (connection.partner_name ?? '').trim(),
          code: connection.invite_code,
          prenomOwner: prenomOwner?.trim() || 'Moi',
        }),
      })
      const j = (await res.json()) as { success?: boolean; error?: string; detail?: string; warning?: string }
      if (!res.ok || !j.success) {
        const msg = [j.error, j.detail].filter((x): x is string => typeof x === 'string' && x.trim().length > 0).join(' — ')
        toast.error(msg || "L'envoi a échoué")
        return
      }
      if (j.warning) {
        toast.warning(j.warning)
      }
      toast.success(`E-mail envoyé à ${emailInvite.trim()}`)
      onRefresh()
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setEnvoiMail(false)
    }
  }

  function patchComplet(overrides: PatchProcheConnection): PatchProcheConnection {
    return {
      notif_debut_regles: r1,
      notif_energie_basse: r2,
      notif_douleur_haute: r3,
      voir_phase: vp,
      voir_energie: ve,
      voir_douleur: vd,
      voir_humeur: vh,
      voir_conseils: vc,
      voir_libido: vl,
      voir_symptomes: vs,
      ...overrides,
    }
  }

  async function sync(p: PatchProcheConnection) {
    const ok = await updateProcheConnection(connection.id, patchComplet(p))
    if (!ok) toast.error('Mise à jour impossible')
    else onRefresh()
  }

  async function revoquer() {
    const ok = await revoquerConnexionProche(connection.id)
    setRevoqueOpen(false)
    if (ok) {
      toast.success('Accès révoqué')
      onRevoque()
    } else toast.error('Action impossible')
  }

  async function supprimer() {
    setSuppr(true)
    const ok = await supprimerConnexionProche(connection.id)
    setSuppr(false)
    if (ok) {
      toast.success('Entrée supprimée')
      onRevoque()
    } else toast.error('Suppression impossible')
  }

  if (connection.status === 'revoked') {
    return (
      <div
        className={cn(
          'text-sm',
          !embed && 'rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4'
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
          Ce lien est révoqué. Tu peux retirer cette entrée de la liste.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200 dark:border-red-900"
          disabled={suppr}
          onClick={() => void supprimer()}
        >
          Supprimer
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'space-y-3 text-sm',
        !embed && 'rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-4'
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {!embed ? (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {connection.partner_name ?? 'Proche'}
          </h2>
          <Badge variant={connection.status === 'active' ? 'default' : 'secondary'} className="mt-1">
            {connection.status === 'pending' ? 'En attente' : 'Actif'}
          </Badge>
        </div>
      ) : null}

      {connection.status === 'pending' ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">En attente — partage le lien ci-dessous.</p>
      ) : connection.accepted_at ? (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Depuis le {format(parseISO(connection.accepted_at), 'd MMM yyyy', { locale: fr })}
        </p>
      ) : null}

      <div className="flex items-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2 py-1.5">
        <span className="min-w-0 flex-1 truncate text-[11px] text-neutral-600 dark:text-neutral-300" title={lien}>
          {court}
        </span>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => void copier()}>
          {copieOk ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {connection.status === 'pending' ? (
        <div className="space-y-2 rounded-md border border-violet-200/80 bg-violet-50/50 dark:border-violet-800/50 dark:bg-violet-950/20 px-2 py-2">
          <Label htmlFor={`email-invite-${connection.id}`} className="text-[11px] text-neutral-700 dark:text-neutral-300">
            E-mail du proche (envoi du lien)
          </Label>
          <Input
            id={`email-invite-${connection.id}`}
            type="email"
            value={emailInvite}
            onChange={(e) => setEmailInvite(e.target.value)}
            placeholder="adresse@exemple.com"
            autoComplete="email"
            className="h-8 text-xs"
          />
          <Button
            type="button"
            size="sm"
            className="w-full h-8 text-xs bg-violet-600 text-white hover:bg-violet-700"
            disabled={envoiMail || !emailInvite.trim()}
            onClick={() => void envoyerEmailInvite()}
          >
            {envoiMail ? 'Envoi…' : '📧 Envoyer le lien par e-mail'}
          </Button>
          {connection.email_sent_at ? (
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Dernier envoi :{' '}
              {format(parseISO(connection.email_sent_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
            </p>
          ) : null}
        </div>
      ) : null}

      <ProchesInterrupteursPartage
        sync={sync}
        vp={vp}
        setVp={setVp}
        ve={ve}
        setVe={setVe}
        vd={vd}
        setVd={setVd}
        vh={vh}
        setVh={setVh}
        vc={vc}
        setVc={setVc}
        vl={vl}
        setVl={setVl}
        vs={vs}
        setVs={setVs}
        r1={r1}
        setR1={setR1}
        r2={r2}
        setR2={setR2}
        r3={r3}
        setR3={setR3}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
        onClick={() => setRevoqueOpen(true)}
      >
        <UserX size={14} className="mr-1" /> Révoquer l’accès
      </Button>

      <Dialog open={revoqueOpen} onOpenChange={setRevoqueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Révoquer l’accès ?</DialogTitle>
            <DialogDescription>Le lien ne fonctionnera plus pour ce proche.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRevoqueOpen(false)}>
              Annuler
            </Button>
            <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={() => void revoquer()}>
              Révoquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
