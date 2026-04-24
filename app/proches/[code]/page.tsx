import { redirect } from 'next/navigation'
import { creerClientServeur } from '@/lib/supabase-server'
import { getConnectionByCode } from '@/lib/db/proches-lien-public'
import { interpreterReponseRpcProche } from '@/lib/proches'
import { PublicProcheContenu } from '@/components/proches/PublicProcheContenu'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Vue proche · Gaia',
  description: 'Aperçu bienveillant du cycle partagé (Proches).',
}

interface PageProchePublicProps {
  params: Promise<{ code: string }>
}

export default async function PageProchePublic({ params }: PageProchePublicProps) {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { code: brut } = await params
  const code = decodeURIComponent(brut)

  if (user) {
    redirect(`/proches?code=${encodeURIComponent(code)}`)
  }

  const { data: brutRpc, rpcError } = await getConnectionByCode(code)
  let { partage, meta, erreur } = interpreterReponseRpcProche(brutRpc)
  if (rpcError) {
    const fnManquante =
      rpcError.code === 'PGRST202' ||
      rpcError.code === '42883' ||
      /function.*not exist|could not find.*function/i.test(rpcError.message)
    if (process.env.NODE_ENV === 'development') {
      erreur =
        erreur ??
        `Supabase (${rpcError.code ?? 'RPC'}) : ${rpcError.message}${rpcError.details ? ` — ${rpcError.details}` : ''}`
    } else if (fnManquante) {
      erreur =
        erreur ??
        'Ce lien ne peut pas être affiché : la base Supabase doit être mise à jour (exécute la section « fn_proches_public_view » de supabase/schema.sql).'
    }
  }

  return (
    <PublicProcheContenu
      erreur={erreur ?? null}
      partage={partage}
      meta={meta}
      inviteCode={code}
    />
  )
}
