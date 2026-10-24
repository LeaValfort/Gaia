'use client'

import { useState } from 'react'
import { Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ApercuSeanceGeneree } from '@/components/sport/aide/ApercuSeanceGeneree'
import { CriteresSeanceForm } from '@/components/sport/aide/CriteresSeanceForm'
import { OBJECTIFS_AIDE } from '@/lib/data/aide-seance'
import { demanderSeanceGeneree } from '@/lib/ia/creation-seance-client'
import type { CriteresSeance, Phase, SeanceGeneree } from '@/types'

interface AssistantSeanceProps {
  /** Sport et contexte (type/lieu en muscu, nom du sport pour les autres). */
  contexte: Pick<CriteresSeance, 'sport' | 'type_muscu' | 'lieu' | 'sport_libre'>
  phase: Phase | null
  /** Texte du bouton final (ex. « Créer ce programme », « Utiliser cette séance »). */
  libelleValider: string
  /** Demander un nom (création de programme) ou non (remplissage d'une séance). */
  avecNom?: boolean
  onUtiliser: (seance: SeanceGeneree, nom: string) => void | Promise<void>
  onFermer: () => void
}

/** Aide à la création de séance : quelques questions → proposition de l'IA → on l'utilise ou on régénère. */
export function AssistantSeance({ contexte, phase, libelleValider, avecNom = true, onUtiliser, onFermer }: AssistantSeanceProps) {
  const [criteres, setCriteres] = useState<CriteresSeance>({
    ...contexte,
    objectif: OBJECTIFS_AIDE[contexte.sport][0],
    niveau: 'Intermédiaire',
    duree_min: 45,
    materiel:
      contexte.lieu === 'salle' ? ['Barre et machines (salle)', 'Haltères'] : contexte.lieu === 'street' ? ['Poids du corps', 'Barre de traction / parc'] : ['Poids du corps'],
    zones: [],
    envies: '',
    phase,
  })
  const [seance, setSeance] = useState<SeanceGeneree | null>(null)
  const [nom, setNom] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [enregistrement, setEnregistrement] = useState(false)

  async function generer() {
    setChargement(true)
    setErreur(null)
    try {
      const s = await demanderSeanceGeneree(criteres)
      setSeance(s)
      setNom(s.nom)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Création impossible')
    } finally {
      setChargement(false)
    }
  }

  async function utiliser() {
    if (!seance) return
    setEnregistrement(true)
    try {
      await onUtiliser(seance, nom.trim() || seance.nom)
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-lg" showCloseButton>
        <div className="p-4 pb-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" /> Créer avec Gaia
            </DialogTitle>
            <DialogDescription>
              {seance ? 'Voici ma proposition : tu pourras tout modifier ensuite.' : 'Réponds à quelques questions, je te propose une séance.'}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto border-y px-4 py-3">
          {seance ? (
            <div className="space-y-3">
              {avecNom ? <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom du programme" aria-label="Nom du programme" /> : null}
              <ApercuSeanceGeneree seance={seance} />
            </div>
          ) : (
            <CriteresSeanceForm criteres={criteres} phaseDuJour={phase} onChange={setCriteres} />
          )}
          {erreur ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{erreur}</p> : null}
        </div>
        <DialogFooter className="flex-row justify-between gap-2 p-4">
          {seance ? (
            <>
              <Button type="button" variant="outline" disabled={chargement || enregistrement} onClick={() => setSeance(null)}>
                Modifier mes réponses
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="icon" disabled={chargement || enregistrement} onClick={() => void generer()} aria-label="Autre proposition">
                  {chargement ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                </Button>
                <Button type="button" disabled={chargement || enregistrement} onClick={() => void utiliser()} className="bg-amber-600 text-white hover:bg-amber-700">
                  {enregistrement ? '…' : libelleValider}
                </Button>
              </div>
            </>
          ) : (
            <Button type="button" disabled={chargement} onClick={() => void generer()} className="w-full bg-amber-600 text-white hover:bg-amber-700">
              {chargement ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Sparkles className="mr-1.5 size-4" />}
              {chargement ? 'Gaia prépare ta séance…' : 'Proposer une séance'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
