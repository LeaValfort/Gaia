"use client"

import { useCallback, useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "gaia-pwa-install-dismissed"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function estInstallee(): boolean {
  if (typeof window === "undefined") return true
  const mq = window.matchMedia("(display-mode: standalone)").matches
  const ios = (window.navigator as unknown as { standalone?: boolean }).standalone === true
  return mq || ios
}

export function BannerInstallPWA() {
  const [visible, setVisible] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [estIos, setEstIos] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (estInstallee()) return
    if (localStorage.getItem(STORAGE_KEY) === "1") return

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
    setEstIos(iOS)

    function onBip(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", onBip)

    if (iOS) {
      setVisible(true)
    }

    return () => window.removeEventListener("beforeinstallprompt", onBip)
  }, [])

  useEffect(() => {
    if (deferred) setVisible(true)
  }, [deferred])

  const installer = useCallback(async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setVisible(false)
  }, [deferred])

  const plusTard = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1")
    setVisible(false)
  }, [])

  if (!visible) return null

  return (
    <div
      className={cn(
        "fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4",
        "border-t border-violet-200/80 dark:border-violet-900/50",
        "bg-[#F8F7FF]/95 dark:bg-neutral-950/95 backdrop-blur supports-[backdrop-filter]:bg-[#F8F7FF]/80",
        "shadow-[0_-4px_24px_rgba(124,58,237,0.12)]"
      )}
      role="status"
    >
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <p className="text-sm text-neutral-800 dark:text-neutral-200 flex-1 pr-2">
          {estIos
            ? "Sur iPhone : touche Partager, puis « Sur l’écran d’accueil » pour ajouter Gaia."
            : "📱 Installer Gaia sur ton téléphone pour un accès rapide, comme une appli."}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {deferred ? (
            <Button type="button" size="sm" className="bg-violet-600 hover:bg-violet-700 text-white" onClick={installer}>
              Installer
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="ghost" onClick={plusTard} className="text-neutral-600 dark:text-neutral-400">
            Plus tard
          </Button>
          <button
            type="button"
            onClick={plusTard}
            className="p-1 rounded-md text-neutral-500 hover:bg-neutral-200/80 dark:hover:bg-neutral-800"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
