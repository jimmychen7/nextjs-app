import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import PriceHistoryServer from '@/components/price-history-server';

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/auth/login')
  }

  return (
    <div className="w-full max-w-full flex flex-col items-stretch justify-center overflow-hidden h-full flex-1">
      <div className="w-full h-full flex-1">
        <PriceHistoryServer symbol="QQQ" />
      </div>
    </div>
  )
}
