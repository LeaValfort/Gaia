import { Nav } from '@/components/shared/Nav'
import { Skeleton } from '@/components/ui/skeleton'

export default function ParametresLoading() {
  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav phase={null} prenom="…" />
      <div className="mx-auto max-w-lg px-4 py-6 pb-24 sm:px-6">
        <Skeleton className="mb-6 h-8 w-40" />
        <div className="space-y-0 rounded-xl border border-neutral-200 dark:border-neutral-800">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-none border-b border-neutral-200 last:border-b-0 dark:border-neutral-800" />
          ))}
        </div>
      </div>
    </div>
  )
}
