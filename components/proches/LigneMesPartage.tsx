'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { ProchesInterrupteursPartage } from '@/components/proches/ProchesInterrupteursPartage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  revoquerConnexionProche,
  supprimerConnexionProche,
  updateProcheConnection,
  type PatchProcheConnection,
} from '@/lib/db/proches'
import type { ProcheConnection } from '@/types'
import { cn } from '@/lib/utils'

const statutLabel: Record<ProcheConnection['status'], string> = {
  pending: 'En attente',
  active: 'Actif',
  revoked: 'Révoqué',
}

export function LigneMesPartage({
  connection,
  onRefresh,
  onRevoque,
}: {
  connection: ProcheConnection
  onRefresh: () => void
  onRevoque: () => void
}) {
  const [permissionsOuvert, setPermissionsOuvert] = useState(false)
  const [revoqueOpen, setRevoqueOpen] = useState(false)
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
  const [decisionLoading, setDecisionLoading] = useState<null | 'accept' | 'refuse'>(null)

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
  }, [connection])

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

  async function traiterDemande(decision: 'accept' | 'refuse') {
    setDecisionLoading(decision)
    try {
      const res = await fetch('/api/proches/decision', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId: connection.id, decision }),
      })
      const j = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok || !j.success) {
        toast.error(j.error || 'Action impossible')
        return
      }
      toast.success(decision === 'accept' ? 'Demande acceptée' : 'Demande refusée')
      onRefresh()
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setDecisionLoading(null)
    }
  }

  if (connection.status === 'revoked') {
    return (
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-3 text-sm">
        <p className="text-xs text-muted-foreground mb-2">Accès révoqué.</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200 dark:border-red-900"
          disabled={suppr}
          onClick={() => void supprimer()}
        >
          Retirer de la liste
        </Button>
      </div>
    )
  }

  const prenom = connection.partner_name?.trim() || 'Proche'

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="flex items-center justify-between gap-2 p-3">
        <p className="font-medium text-neutral-900 dark:text-neutral-50 truncate">{prenom}</p>
        <Badge variant={connection.status === 'active' ? 'default' : 'secondary'} className="shrink-0">
          {statutLabel[connection.status]}
        </Badge>
      </div>

      {connection.status === 'pending' && connection.partner_id ? (
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          <Button
            type="button"
            size="sm"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={decisionLoading !== null}
            onClick={() => void traiterDemande('accept')}
          >
            {decisionLoading === 'accept' ? 'Validation…' : 'Accepter'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
            disabled={decisionLoading !== null}
            onClick={() => void traiterDemande('refuse')}
          >
            {decisionLoading === 'refuse' ? 'Refus…' : 'Refuser'}
          </Button>
        </div>
      ) : null}

      <Collapsible open={permissionsOuvert} onOpenChange={setPermissionsOuvert}>
        <CollapsibleTrigger
          className={cn(
            'w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm',
            'border-t border-neutral-200 dark:border-neutral-800',
            'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors'
          )}
        >
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Permissions</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-neutral-500 transition-transform',
              permissionsOuvert && 'rotate-180'
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-neutral-200 dark:border-neutral-800 px-3 py-3">
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
        </CollapsibleContent>
      </Collapsible>

      <div className="border-t border-neutral-200 dark:border-neutral-800 px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
          onClick={() => setRevoqueOpen(true)}
        >
          Révoquer
        </Button>
      </div>

      <Dialog open={revoqueOpen} onOpenChange={setRevoqueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Révoquer l&apos;accès ?</DialogTitle>
            <DialogDescription>Ce proche ne pourra plus voir tes données partagées.</DialogDescription>
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
