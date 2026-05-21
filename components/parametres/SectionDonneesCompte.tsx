'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { FileJson, FileSpreadsheet, Loader2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { exporterDonneesCSV, exporterDonneesJSON } from '@/lib/parametres'
import { supabase } from '@/lib/supabase'

interface SectionDonneesCompteProps {
  userId: string
}

function telechargerFichier(contenu: string, nomFichier: string, type: 'json' | 'csv') {
  const mime = type === 'json' ? 'application/json;charset=utf-8' : 'text/csv;charset=utf-8'
  const blob = new Blob([contenu], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomFichier
  a.rel = 'noopener'
  a.click()
  URL.revokeObjectURL(url)
}

export function SectionDonneesCompte({ userId: _userId }: SectionDonneesCompteProps) {
  const router = useRouter()
  const [jsonLoad, setJsonLoad] = useState(false)
  const [csvLoad, setCsvLoad] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [confirmDeconnexion, setConfirmDeconnexion] = useState(false)

  const suffix = format(new Date(), 'yyyy-MM-dd')

  async function exportJson() {
    setErreur(null)
    setJsonLoad(true)
    try {
      const data = await exporterDonneesJSON()
      telechargerFichier(data, `gaia-export-${suffix}.json`, 'json')
    } catch {
      setErreur('Échec de l’export JSON.')
    } finally {
      setJsonLoad(false)
    }
  }

  async function exportCsv() {
    setErreur(null)
    setCsvLoad(true)
    try {
      const data = await exporterDonneesCSV()
      telechargerFichier(data, `gaia-export-${suffix}.csv`, 'csv')
    } catch {
      setErreur('Échec de l’export CSV.')
    } finally {
      setCsvLoad(false)
    }
  }

  async function deconnecter() {
    await supabase.auth.signOut()
    setConfirmDeconnexion(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {erreur ? (
        <p role="alert" className="text-sm text-destructive">
          {erreur}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="ghost"
          className="justify-start gap-2 px-2"
          disabled={jsonLoad}
          onClick={() => void exportJson()}
        >
          {jsonLoad ? <Loader2 className="size-4 animate-spin" /> : <FileJson className="size-4" />}
          Exporter en JSON
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="justify-start gap-2 px-2"
          disabled={csvLoad}
          onClick={() => void exportCsv()}
        >
          {csvLoad ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />}
          Exporter en CSV
        </Button>
      </div>

      <Separator className="my-2" />

      <button
        type="button"
        onClick={() => setConfirmDeconnexion(true)}
        className="inline-flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <LogOut className="size-4" aria-hidden />
        Se déconnecter
      </button>

      <Dialog open={confirmDeconnexion} onOpenChange={setConfirmDeconnexion}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Déconnexion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Es-tu sûre de vouloir te déconnecter ?</p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={() => setConfirmDeconnexion(false)}>
              Annuler
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => void deconnecter()}>
              Déconnexion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
