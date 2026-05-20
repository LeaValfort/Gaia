import { Nav } from '@/components/shared/Nav'
import { Skeleton } from '@/components/ui/skeleton'

export default function CycleLoading() {
  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav phase={null} prenom="…" />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 pb-24 sm:px-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <Skeleton className="h-[420px] w-full rounded-2xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
