import Link from 'next/link'
import { Heart } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SectionProches() {
  return (
    <Card className="border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Heart size={18} className="text-violet-500 shrink-0" />
          Proches
        </CardTitle>
        <CardDescription>
          Partage un lien pour qu’un proche voie ce que tu autorises (phase, énergie, humeur, conseils…).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/proches" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'inline-flex')}>
          Gérer
        </Link>
      </CardContent>
    </Card>
  )
}
