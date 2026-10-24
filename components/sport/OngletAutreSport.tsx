'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ChoixSportLibre } from '@/components/sport/libre/ChoixSportLibre'
import { BarreModelesSeance } from '@/components/sport/libre/BarreModelesSeance'
import { BannerSuggestionGaia } from '@/components/sport/BannerSuggestionGaia'
import { useModeGaiaLignes } from '@/hooks/useModeGaiaLignes'
import { AssistantSeance } from '@/components/sport/aide/AssistantSeance'
import { BoutonAideSeance } from '@/components/sport/aide/BoutonAideSeance'
import { messageGaiaTousSports } from '@/lib/sport/gaia-adaptation'
import { EditeurSeanceLibre } from '@/components/sport/libre/EditeurSeanceLibre'
import { useSeanceLibre } from '@/hooks/useSeanceLibre'
import { enregistrerActiviteClient } from '@/lib/sport/activities-client'
import { formDepuisActivite } from '@/lib/sport/activite-form'
import { copierLignes, lignesRenseignees } from '@/lib/sport/seance-libre'
import { ACTIVITY_LOG_INITIAL, getSportConfig, type ConfigChamp } from '@/lib/data/sportsConfig'
import { cn } from '@/lib/utils'
import type { ActivityLog, ActivityLogFormData, LigneSeanceLibre, Phase, PourcentagesGaia } from '@/types'

const EMOJIS = ['😴', '😕', '😊', '⚡', '🚀'] as const
const LABEL = 'text-xs font-medium text-amber-900/80 dark:text-amber-200/80'
const CHAMP = 'border-amber-200 dark:border-amber-800/80'

function champ(c: ConfigChamp, f: ActivityLogFormData, set: (k: keyof ActivityLogFormData, v: string) => void) {
  return (
    <div key={c.cle} className="space-y-1">
      <p className={LABEL}>
        {c.label}
        {c.unite ? ` (${c.unite})` : ''}
        {c.optionnel ? ' — optionnel' : ''}
      </p>
      <Input
        type={c.type === 'nombre' || c.type === 'duree' ? 'number' : 'text'}
        min={c.type === 'duree' || c.type === 'nombre' ? 0 : undefined}
        value={f[c.cle] as string}
        onChange={(e) => set(c.cle, e.target.value)}
        className={CHAMP}
        placeholder={c.placeholder}
      />
    </div>
  )
}

interface OngletAutreSportProps {
  userId: string
  date: string
  /** Activité à modifier (ouverte depuis « Dernières séances »). Remonter le composant via `key` pour changer. */
  activiteExistante?: ActivityLog | null
  onEnregistre?: () => void
  phase: Phase | null
  pourcentages: PourcentagesGaia
}

export function OngletAutreSport({ userId, date, activiteExistante, onEnregistre, phase, pourcentages }: OngletAutreSportProps) {
  const r = useRouter()
  const [f, setF] = useState<ActivityLogFormData>(() => formDepuisActivite(activiteExistante))
  const [lignes, setLignes] = useState<LigneSeanceLibre[]>(() => activiteExistante?.contenu ?? [])
  const [ch, setCh] = useState(false)
  const [aide, setAide] = useState(false)
  const { modeles, dernieres, enregistrerModele, supprimerModele } = useSeanceLibre(userId)
  const pct = phase ? pourcentages[phase] : 0
  const gaia = useModeGaiaLignes(lignes, setLignes, pct)
  const t = f.sport_type
  const cfg = t ? getSportConfig(t) : null
  const setV = (k: keyof ActivityLogFormData, v: string) => setF((p) => ({ ...p, [k]: v }))

  async function save() {
    if (!t) return
    setCh(true)
    try {
      await enregistrerActiviteClient({ ...f, date }, lignes, activiteExistante?.id)
      toast.success(activiteExistante ? 'Séance mise à jour ! 🎯' : 'Activité enregistrée ! 🎯')
      setF(ACTIVITY_LOG_INITIAL)
      setLignes([])
      gaia.reinitialiser()
      onEnregistre?.()
      r.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Enregistrement impossible')
    } finally {
      setCh(false)
    }
  }

  async function enregistrerCommeModele(nom: string): Promise<boolean> {
    if (!t) return false
    const ok = await enregistrerModele({ nom, sport_type: t, sport_name: f.sport_name.trim() || null, contenu: lignesRenseignees(lignes) })
    if (ok) toast.success(`Modèle « ${ok.nom} » enregistré`)
    else toast.error('Impossible d’enregistrer le modèle')
    return !!ok
  }

  return (
    <div className="space-y-4 rounded-xl border border-amber-200/90 bg-[#FFFBEB]/90 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
      <BarreModelesSeance
        modeles={modeles}
        nomSuggere={f.sport_name || cfg?.nom || ''}
        peutEnregistrer={!!t && lignesRenseignees(lignes).length > 0}
        onCharger={(m) => {
          setF({ ...ACTIVITY_LOG_INITIAL, sport_type: m.sport_type, sport_name: m.sport_name ?? '' })
          // Copie avec de nouveaux identifiants : la séance ne modifie pas le modèle.
          setLignes(copierLignes(m.contenu))
          gaia.reinitialiser()
        }}
        onEnregistrer={enregistrerCommeModele}
        onSupprimer={async (id) => {
          const ok = await supprimerModele(id)
          if (!ok) toast.error('Suppression du modèle impossible')
          return ok
        }}
      />
      <ChoixSportLibre
        sport={t}
        onChoisir={(sport) => setF((p) => ({ ...ACTIVITY_LOG_INITIAL, sport_type: sport, sport_name: p.sport_name, feeling: p.feeling, notes: p.notes }))}
      />
      {cfg ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className={LABEL}>{t === 'autre' ? 'Nom du sport' : 'Nom de la séance — optionnel'}</p>
            <Input value={f.sport_name} onChange={(e) => setV('sport_name', e.target.value)} className={CHAMP} placeholder={t === 'autre' ? 'Pilates, headstand, corde à sauter…' : 'Ex. Fractionné'} />
          </div>
          {cfg.champs.filter((c) => c.cle !== 'sport_name').map((c) => champ(c, f, setV))}
          <BoutonAideSeance libelle="Créer la séance avec Gaia" onClick={() => setAide(true)} />
          {aide && t ? (
            <AssistantSeance
              contexte={{ sport: 'libre', sport_libre: t === 'autre' ? f.sport_name.trim() || 'sport' : cfg.nom }}
              phase={phase}
              libelleValider="Utiliser cette séance"
              avecNom={false}
              onFermer={() => setAide(false)}
              onUtiliser={(s) => {
                setLignes(s.lignes)
                gaia.reinitialiser()
                if (!f.sport_name.trim()) setV('sport_name', s.nom)
                setAide(false)
              }}
            />
          ) : null}
          {phase && lignes.length ? (
            <BannerSuggestionGaia phase={phase} message={messageGaiaTousSports(phase, pct)} modeActif={gaia.mode} onChangerMode={gaia.changerMode} />
          ) : null}
          <EditeurSeanceLibre lignes={lignes} dernieresCharges={dernieres} sport={t} onChange={setLignes} />
          <div>
            <p className={`mb-1 ${LABEL}`}>Ressenti</p>
            <div className="flex flex-wrap justify-center gap-1">
              {EMOJIS.map((e) => (
                <button type="button" key={e} onClick={() => setV('feeling', f.feeling === e ? '' : e)} className={cn('rounded-full border-2 p-2 text-lg', f.feeling === e ? 'border-[#D97706] bg-amber-100 dark:bg-amber-900/50' : 'border-transparent')}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <Textarea value={f.notes} onChange={(e) => setV('notes', e.target.value)} className={`${CHAMP} text-sm`} rows={2} placeholder="Notes" />
        </div>
      ) : null}
      <Button onClick={() => void save()} disabled={ch || !t} className="w-full bg-[#D97706] text-white hover:bg-amber-700">
        {ch ? '…' : activiteExistante ? 'Mettre à jour la séance' : 'Enregistrer'}
      </Button>
    </div>
  )
}
