import { Calendar, Clock, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export function FormulaireEvenementChamps({
  titre, setTitre, journee, setJournee, dateEv, setDateEv, hDebut, setHDebut, hFin, setHFin, lieu, setLieu, desc, setDesc,
}: {
  titre: string
  setTitre: (v: string) => void
  journee: boolean
  setJournee: (v: boolean) => void
  dateEv: string
  setDateEv: (v: string) => void
  hDebut: string
  setHDebut: (v: string) => void
  hFin: string
  setHFin: (v: string) => void
  lieu: string
  setLieu: (v: string) => void
  desc: string
  setDesc: (v: string) => void
}) {
  return (
    <div className="grid gap-3 py-1">
      <div className="grid gap-2">
        <Label htmlFor="evt-titre">Titre</Label>
        <Input id="evt-titre" value={titre} onChange={(e) => setTitre(e.target.value)} />
      </div>
      <div className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-700">
        <span className="text-sm">Toute la journée</span>
        <Switch checked={journee} onCheckedChange={(c) => setJournee(Boolean(c))} />
      </div>
      {!journee ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1">
            <Label className="flex items-center gap-1 text-xs"><Clock className="size-3" /> Début</Label>
            <Input type="time" value={hDebut} onChange={(e) => setHDebut(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label className="flex items-center gap-1 text-xs"><Clock className="size-3" /> Fin</Label>
            <Input type="time" value={hFin} onChange={(e) => setHFin(e.target.value)} />
          </div>
        </div>
      ) : null}
      <div className="grid gap-1">
        <Label className="flex items-center gap-1 text-xs"><Calendar className="size-3" /> Date</Label>
        <Input type="date" value={dateEv} onChange={(e) => setDateEv(e.target.value)} />
      </div>
      <div className="grid gap-1">
        <Label className="flex items-center gap-1 text-xs"><MapPin className="size-3" /> Lieu</Label>
        <Input value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="Optionnel" />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="evt-desc">Description</Label>
        <Textarea id="evt-desc" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
      </div>
    </div>
  )
}
