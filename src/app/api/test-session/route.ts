import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) {
    return NextResponse.redirect('/auth/login');
  }
  
  const user = data.user;
  return NextResponse.json({ userId: user.id, email: user.email });
}

