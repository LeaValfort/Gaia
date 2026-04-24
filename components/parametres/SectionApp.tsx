'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { LogOut, Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabase'
import type { Theme, UserPreferences } from '@/types'
interface SectionAppProps {
  prefs: UserPreferences
  onUpdate: (updates: Partial<Omit<UserPreferences, 'id' | 'user_id'>>) => Promise<boolean>
}

const THEMES: { id: Theme; label: string; icone: typeof Sun }[] = [
  { id: 'light', label: 'Clair', icone: Sun },
  { id: 'dark', label: 'Sombre', icone: Moon },
  { id: 'system', label: 'Système', icone: Monitor },
]

export function SectionApp({ prefs, onUpdate }: SectionAppProps) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [confirmDeconnexion, setConfirmDeconnexion] = useState(false)

  async function appliquerTheme(t: Theme) {
    setTheme(t)
    await onUpdate({ theme: t })
  }

  async function deconnecter() {
    await supabase.auth.signOut()
    setConfirmDeconnexion(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Application</CardTitle>
          <CardDescription>Thème, rappels et session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Thème</Label>
            <div className="flex flex-wrap gap-2">
              {THEMES.map(({ id, label, icone: Ic }) => (
                <Button
                  key={id}
                  type="button"
                  variant={prefs.theme === id ? 'default' : 'outline'}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => void appliquerTheme(id)}
                >
                  <Ic className="size-3.5" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Label htmlFor="notif" className="text-sm font-medium">
                Rappels quotidiens
              </Label>
              <p className="text-xs text-neutral-500 mt-0.5">Rappel pour remplir ton journal chaque soir</p>
            </div>
            <Switch
              id="notif"
              checked={prefs.notifications}
              onCheckedChange={(checked) => {
                void onUpdate({ notifications: checked })
              }}
            />
          </div>

          <Button type="button" variant="destructive" size="sm" className="w-full sm:w-auto gap-2" onClick={() => setConfirmDeconnexion(true)}>
            <LogOut className="size-4" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmDeconnexion} onOpenChange={setConfirmDeconnexion}>
        <DialogContent showCloseButton className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Déconnexion</DialogTitle>
            <DialogDescription>Es-tu sûre de vouloir te déconnecter ?</DialogDescription>
          </DialogHeader>
          <div className="flex flex-row justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setConfirmDeconnexion(false)}>
              Annuler
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => void deconnecter()}>
              Déconnexion
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
