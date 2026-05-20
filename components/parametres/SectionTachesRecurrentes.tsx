'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  createRecurringTodo,
  deleteRecurringTodo,
  updateRecurringTodo,
} from '@/lib/db/recurring-todos'
import type { FrequenceRecurrence, RecurringTodo } from '@/types'

const JOURS_SEMAINE: { iso: number; label: string }[] = [
  { iso: 1, label: 'Lun' },
  { iso: 2, label: 'Mar' },
  { iso: 3, label: 'Mer' },
  { iso: 4, label: 'Jeu' },
  { iso: 5, label: 'Ven' },
  { iso: 6, label: 'Sam' },
  { iso: 7, label: 'Dim' },
]

const LIBELLE_FREQUENCE: Record<FrequenceRecurrence, string> = {
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
}

interface SectionTachesRecurrentesProps {
  userId: string
  todosInitiales: RecurringTodo[]
}

export function SectionTachesRecurrentes({ userId, todosInitiales }: SectionTachesRecurrentesProps) {
  const router = useRouter()
  const [taches, setTaches] = useState<RecurringTodo[]>(todosInitiales)
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [texte, setTexte] = useState('')
  const [frequence, setFrequence] = useState<FrequenceRecurrence>('daily')
  const [joursSemaine, setJoursSemaine] = useState<number[]>([])
  const [jourMois, setJourMois] = useState('1')
  const [chargement, setChargement] = useState(false)

  useEffect(() => {
    setTaches(todosInitiales)
  }, [todosInitiales])

  function reinitialiserFormulaire() {
    setTexte('')
    setFrequence('daily')
    setJoursSemaine([])
    setJourMois('1')
    setFormulaireOuvert(false)
  }

  function basculerJour(iso: number) {
    setJoursSemaine((prev) =>
      prev.includes(iso) ? prev.filter((j) => j !== iso) : [...prev, iso].sort((a, b) => a - b)
    )
  }

  async function enregistrer() {
    const libelle = texte.trim()
    if (!libelle) {
      toast.error('Indique un nom pour la tâche.')
      return
    }
    if (frequence === 'weekly' && joursSemaine.length === 0) {
      toast.error('Choisis au moins un jour de la semaine.')
      return
    }
    const mois = parseInt(jourMois, 10)
    if (frequence === 'monthly' && (Number.isNaN(mois) || mois < 1 || mois > 31)) {
      toast.error('Le jour du mois doit être entre 1 et 31.')
      return
    }

    setChargement(true)
    try {
      const cree = await createRecurringTodo(userId, {
        text: libelle,
        frequency: frequence,
        week_days: frequence === 'weekly' ? joursSemaine : null,
        month_day: frequence === 'monthly' ? mois : null,
        active: true,
      })
      setTaches((prev) => [...prev, cree])
      reinitialiserFormulaire()
      toast.success('Tâche récurrente ajoutée')
      router.refresh()
    } catch {
      toast.error('Impossible d’ajouter la tâche.')
    } finally {
      setChargement(false)
    }
  }

  async function basculerActif(tache: RecurringTodo, actif: boolean) {
    const prev = taches
    setTaches((liste) => liste.map((t) => (t.id === tache.id ? { ...t, active: actif } : t)))
    try {
      await updateRecurringTodo(tache.id, { active: actif })
      router.refresh()
    } catch {
      setTaches(prev)
      toast.error('Impossible de modifier la tâche.')
    }
  }

  async function supprimer(id: string) {
    const prev = taches
    setTaches((liste) => liste.filter((t) => t.id !== id))
    try {
      await deleteRecurringTodo(id)
      toast.success('Tâche supprimée')
      router.refresh()
    } catch {
      setTaches(prev)
      toast.error('Impossible de supprimer la tâche.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tâches récurrentes</CardTitle>
        <CardDescription>
          Tâches générées automatiquement sur ta page Aujourd&apos;hui selon leur fréquence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {taches.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Aucune tâche récurrente.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {taches.map((tache) => (
              <li
                key={tache.id}
                className="flex items-center gap-3 px-3 py-3 first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      tache.active
                        ? 'text-neutral-900 dark:text-neutral-50'
                        : 'text-neutral-400 line-through dark:text-neutral-500'
                    }`}
                  >
                    {tache.text}
                  </p>
                  <Badge variant="outline" className="mt-1 text-[10px] font-normal">
                    {LIBELLE_FREQUENCE[tache.frequency]}
                  </Badge>
                </div>
                <Switch
                  checked={tache.active}
                  onCheckedChange={(checked) => void basculerActif(tache, checked)}
                  aria-label={tache.active ? 'Désactiver la tâche' : 'Activer la tâche'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-neutral-500 hover:text-destructive dark:text-neutral-400 dark:hover:text-destructive"
                  onClick={() => void supprimer(tache.id)}
                  aria-label="Supprimer la tâche"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {!formulaireOuvert ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setFormulaireOuvert(true)}>
            Ajouter une tâche
          </Button>
        ) : (
          <div className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
            <div className="space-y-2">
              <Label htmlFor="recurring-text">Nom de la tâche</Label>
              <Input
                id="recurring-text"
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                placeholder="Ex. Prendre mes compléments"
                className="bg-white dark:bg-neutral-950"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurring-freq">Fréquence</Label>
              <Select
                value={frequence}
                onValueChange={(v) => setFrequence(v as FrequenceRecurrence)}
              >
                <SelectTrigger id="recurring-freq" className="bg-white dark:bg-neutral-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequence === 'weekly' ? (
              <div className="space-y-2">
                <Label>Jours de la semaine</Label>
                <div className="flex flex-wrap gap-1.5">
                  {JOURS_SEMAINE.map(({ iso, label }) => (
                    <Button
                      key={iso}
                      type="button"
                      size="sm"
                      variant={joursSemaine.includes(iso) ? 'default' : 'outline'}
                      className="min-w-11 px-2"
                      onClick={() => basculerJour(iso)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            {frequence === 'monthly' ? (
              <div className="space-y-2">
                <Label htmlFor="recurring-month-day">Jour du mois (1–31)</Label>
                <Input
                  id="recurring-month-day"
                  type="number"
                  min={1}
                  max={31}
                  value={jourMois}
                  onChange={(e) => setJourMois(e.target.value)}
                  className="w-24 bg-white dark:bg-neutral-950"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={chargement}
                className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
                onClick={() => void enregistrer()}
              >
                Enregistrer
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={chargement}
                onClick={reinitialiserFormulaire}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
