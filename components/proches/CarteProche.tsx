'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { PanneauDetailProche } from '@/components/proches/PanneauDetailProche'
import type { ProcheConnection, ProcheRelationType } from '@/types'

const RELATION_LABEL: Record<ProcheRelationType, string> = {
  partenaire: 'Partenaire',
  ami: 'Ami·e',
  famille: 'Famille',
}

const RELATION_EMOJI: Record<ProcheRelationType, string> = {
  partenaire: '💑',
  ami: '🤝',
  famille: '🏠',
}

function relationAffichage(connection: ProcheConnection): { emoji: string; label: string } {
  const r = connection.relation_type
  if (r === 'partenaire' || r === 'ami' || r === 'famille') {
    return { emoji: RELATION_EMOJI[r], label: RELATION_LABEL[r] }
  }
  return { emoji: '💑', label: 'Partenaire' }
}

export interface CarteProcheProps {
  connection: ProcheConnection
  estActif: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<ProcheConnection>) => void
  onRevoquer: () => void
  onRefresh: () => void
  prenomOwner?: string | null
}

const statutLabel: Record<ProcheConnection['status'], string> = {
  pending: 'En attente',
  active: 'Actif',
  revoked: 'Révoqué',
}

export function CarteProche({
  connection,
  estActif,
  onSelect,
  onUpdate: _onUpdate,
  onRevoquer,
  onRefresh,
  prenomOwner,
}: CarteProcheProps) {
  void _onUpdate
  const { emoji, label } = relationAffichage(connection)
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-lg border text-left transition-colors',
        estActif
          ? 'border-violet-500 bg-[#F5F3FF] dark:border-violet-500 dark:bg-violet-950/35'
          : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950'
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-start justify-between gap-1.5 p-2 text-left"
      >
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            <span aria-hidden>{emoji}</span>{' '}
            {connection.partner_name ?? 'Proche'}
          </p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{label}</p>
        </div>
        <Badge
          variant={connection.status === 'active' ? 'default' : 'secondary'}
          className="shrink-0 text-[10px] capitalize"
        >
          {statutLabel[connection.status]}
        </Badge>
      </button>

      {estActif ? (
        <div
          className="border-t border-violet-200/80 px-2 pb-2 pt-0 dark:border-violet-800/50"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <PanneauDetailProche
            connection={connection}
            onRefresh={onRefresh}
            onRevoque={onRevoquer}
            embed
            prenomOwner={prenomOwner}
          />
        </div>
      ) : null}
    </div>
  )
}
