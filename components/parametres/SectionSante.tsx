'use client'

import { FormulaireContraception } from '@/components/parametres/sante/FormulaireContraception'
import { FormulaireRdv } from '@/components/parametres/sante/FormulaireRdv'
import { SelecteurConditions } from '@/components/parametres/sante/SelecteurConditions'
import { ListeRdvSante } from '@/components/parametres/sante/ListeRdvSante'
import { useSante } from '@/hooks/useSante'
import { tousLesRdv } from '@/lib/sante/rdv'

/** Paramètres > Santé : contraception et rendez-vous santé (rappels). */
export function SectionSante({ userId }: { userId: string }) {
  const s = useSante(userId)
  if (s.chargement) return <p className="text-sm text-muted-foreground">Chargement…</p>

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Mon profil santé</h3>
        <SelecteurConditions conditions={s.profil.conditions} onChange={(conditions) => s.majProfil({ conditions })} />
      </section>
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Contraception</h3>
        <FormulaireContraception userId={userId} profil={s.profil} onMaj={s.majProfil} />
      </section>
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Rendez-vous santé</h3>
        <ListeRdvSante
          rdvs={tousLesRdv(s.profil, s.rdvs, new Date())}
          onControleFait={s.controleFait}
          onRdvFait={s.rdvFait}
          onSupprimer={s.supprimerRdv}
        />
        <FormulaireRdv onAjouter={s.ajouterRdv} />
        <p className="text-xs text-muted-foreground">
          Les rendez-vous des 30 prochains jours s’affichent aussi sur l’accueil.
        </p>
      </section>
    </div>
  )
}
