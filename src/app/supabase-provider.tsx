'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { SessionContextProvider } from '@supabase/auth-helpers-react'

// Create a context for Supabase client
export const SupabaseContext = createContext<ReturnType<typeof createBrowserClient> | null>(null)

export default function SupabaseProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )

  const router = useRouter()

  useEffect(() => {
    // Setup the auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Refresh the page when auth state changes
      // This ensures the server and client state remain in sync
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={null}>
      <SupabaseContext.Provider value={supabase}>
        {children}
      </SupabaseContext.Provider>
    </SessionContextProvider>
  )
}

// Helper hook to use Supabase client
export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === null) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}