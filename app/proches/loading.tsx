import { Nav } from '@/components/shared/Nav'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProchesLoading() {
  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav phase={null} prenom="…" />
      <div className="mx-auto max-w-lg px-4 py-6 pb-24 sm:px-6">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-8 h-24 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}
