"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LogoutButton } from '@/components/logout-button'; 
import { Button } from '@/components/ui/button';

export default function Navigation() {
  const pathname = usePathname();
  const supabase = useSupabaseClient();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/test-session', {
          headers: { 'Accept': 'application/json' }
        });
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          // Ignore any error: treat as not logged in
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch (error) {
        // Ignore error silently
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  return (
    <nav className="bg-white dark:bg-black shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Room Booking
            </Link>
            <div className="hidden md:flex space-x-4">
              <Button asChild variant="link">
                <Link href="/">Home</Link>
              </Button>
              <Button asChild variant="link">
                <Link href="/rooms">Rooms</Link>
              </Button>
              {user && (
                <Button asChild variant="link">
                  <Link href="/createRoom">Create Room</Link>
                </Button>
              )}
              <Button asChild variant="link">
                <Link href="/protected">Protected</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Button asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}