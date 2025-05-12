'use client'

import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    // router.refresh();
    router.push('/auth/login')
    //router.refresh();
  }

  return <Button onClick={logout}>Logout</Button>
}
