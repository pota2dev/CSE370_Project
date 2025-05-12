'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@supabase/auth-helpers-react'
import RoomForm from '@/components/RoomForm'
import { useSupabase } from '../supabase-provider'

export default function CreateRoomPage() {
  const session = useSession()
  const supabase = useSupabase()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error checking authentication:', error)
          // router.push('/auth/login')
          // return
        }
        
        // if (!data.session) {
        //   console.log('No active session found, redirecting to login')
        //   router.push('/auth/login')
        //   return
        // }
        
        console.log('User authenticated:', data.session ? data.session.user.email : 'Guest')
        setAuthChecked(true)
      } catch (error) {
        console.error('Authentication check failed:', error)
        // router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-2">Loading...</p>
          <p className="text-sm text-gray-500">Please wait while we check your authentication status</p>
        </div>
      </div>
    )
  }

  if (!authChecked) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Room</h1>
      <div className="max-w-2xl mx-auto p-6 rounded-lg shadow">
        <RoomForm />
      </div>
    </div>
  )
}