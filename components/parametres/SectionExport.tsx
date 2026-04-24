'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { CheckCircle2, Download, FileJson, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { exporterDonneesCSV, exporterDonneesJSON } from '@/lib/parametres'

interface SectionExportProps {
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

export function SectionExport({ userId: _userId }: SectionExportProps) {
  const [jsonLoad, setJsonLoad] = useState(false)
  const [csvLoad, setCsvLoad] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const suffix = format(new Date(), 'yyyy-MM-dd')

  async function exportJson() {
    setMsg(null)
    setJsonLoad(true)
    try {
      const data = await exporterDonneesJSON()
      telechargerFichier(data, `gaia-export-${suffix}.json`, 'json')
      setMsg('Export JSON téléchargé.')
    } catch {
      setMsg('Échec de l’export JSON.')
    } finally {
      setJsonLoad(false)
    }
  }

  async function exportCsv() {
    setMsg(null)
    setCsvLoad(true)
    try {
      const data = await exporterDonneesCSV()
      telechargerFichier(data, `gaia-export-${suffix}.csv`, 'csv')
      setMsg('Export CSV téléchargé.')
    } catch {
      setMsg('Échec de l’export CSV.')
    } finally {
      setCsvLoad(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="size-4" aria-hidden />
          Export des données
        </CardTitle>
        <CardDescription>Télécharge toutes tes données Gaia (préférences, journaux, sport, todos, mensurations si disponible).</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="gap-2" disabled={jsonLoad} onClick={() => void exportJson()}>
            <FileJson className="size-4" />
            {jsonLoad ? 'Export…' : 'Exporter en JSON'}
          </Button>
          <Button type="button" variant="outline" className="gap-2" disabled={csvLoad} onClick={() => void exportCsv()}>
            <FileSpreadsheet className="size-4" />
            {csvLoad ? 'Export…' : 'Exporter en CSV'}
          </Button>
        </div>
        {msg ? (
          <p className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            {msg}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
