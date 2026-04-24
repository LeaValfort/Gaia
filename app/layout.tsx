import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { BannerInstallPWA } from "@/components/shared/BannerInstallPWA"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Gaia — Mon Plan de Vie",
  description: "Suivi cycle, sport et alimentation personnalisé",
  applicationName: "Gaia",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gaia",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7C3AED" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
        {/*
          ThemeProvider de next-themes gère le dark/light mode.
          attribute="class" ajoute la classe "dark" sur <html> quand le mode sombre est actif.
          defaultTheme="system" respecte le réglage du système de l'utilisatrice.
        */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster richColors position="top-center" />
          <BannerInstallPWA />
        </ThemeProvider>
      </body>
    </html>
  )
}
