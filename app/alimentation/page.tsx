import { redirect } from 'next/navigation'
import { creerClientServeur } from '@/lib/supabase-server'
import { getLundiSemaine } from '@/lib/nutrition'
import { Header } from '@/components/shared/Header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChecklistHebdo } from '@/components/alimentation/ChecklistHebdo'

export default async function PageAlimentation() {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weekStart = getLundiSemaine(new Date())

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">

        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Alimentation</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Semaine du {weekStart}
          </p>
        </div>

        <Tabs defaultValue="checklist">
          <TabsList className="w-full grid grid-cols-4 text-xs">
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="semaine">Plan semaine</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions IA</TabsTrigger>
            <TabsTrigger value="recettes">Recettes</TabsTrigger>
          </TabsList>

          <div className="mt-6">

            <TabsContent value="checklist">
              <ChecklistHebdo userId={user.id} weekStart={weekStart} />
            </TabsContent>

            <TabsContent value="semaine">
              <div className="text-center text-muted-foreground py-12">
                Bientôt disponible ✨
              </div>
            </TabsContent>

            <TabsContent value="suggestions">
              <div className="text-center text-muted-foreground py-12">
                Bientôt disponible ✨
              </div>
            </TabsContent>

            <TabsContent value="recettes">
              <div className="text-center text-muted-foreground py-12">
                Bientôt disponible ✨
              </div>
            </TabsContent>

          </div>
        </Tabs>

      </main>
    </>
  )
}
