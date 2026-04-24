import { Suspense } from 'react'
import { ProchesPageInner } from '@/components/proches/ProchesPageInner'

export const dynamic = 'force-dynamic'

export default function PageProches() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950 flex items-center justify-center text-sm text-neutral-500">
          Chargement…
        </div>
      }
    >
      <ProchesPageInner />
    </Suspense>
  )
}
