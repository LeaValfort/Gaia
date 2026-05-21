'use client'

import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  const { setTheme } = useTheme()

  async function appliquerTheme(t: Theme) {
    setTheme(t)
    await onUpdate({ theme: t })
  }

  return (
    <>
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

      <div className="flex items-center justify-between gap-4 py-1">
        <Label htmlFor="notif">Rappels quotidiens</Label>
        <Switch
          id="notif"
          checked={prefs.notifications}
          onCheckedChange={(checked) => void onUpdate({ notifications: checked })}
        />
      </div>
    </>
  )
}
