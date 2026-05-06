import { redirect } from 'next/navigation'
import { creerClientServeur } from '@/lib/supabase-server'
import { getUserPreferences, initUserPreferences } from '@/lib/db/parametres'
import { Nav } from '@/components/shared/Nav'
import { ParametresClient } from '@/components/parametres/ParametresClient'
import { PageHeader } from '@/components/shared/PageHeader'

export const dynamic = 'force-dynamic'

interface PageParametresProps {
  searchParams: Promise<{ message?: string }>
}

export default async function PageParametres({ searchParams }: PageParametresProps) {
  const params = await searchParams
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let prefs = await getUserPreferences()
  if (!prefs) {
    await initUserPreferences()
    prefs = await getUserPreferences()
  }
  if (!prefs) redirect('/login')

  const prenom =
    user.user_metadata?.full_name?.trim().split(/\s+/)[0] ??
    (user.user_metadata?.first_name as string | undefined)?.trim() ??
    user.email?.split('@')[0] ??
    'toi'

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav
        phase={null}
        sansCycle={prefs.mode_utilisateur === 'sans_cycle'}
        prenom={prenom}
      />
      <div className="max-w-7xl mx-auto px-6 py-6 pb-24">
        <PageHeader
          title="Paramètres"
          subtitle="Tout est enregistré automatiquement à chaque modification."
          className="mb-6"
        />
        <ParametresClient
          prefsInitiales={prefs}
          userId={user.id}
          messageUrl={params.message}
        />
      </div>
    </div>
  )
}
