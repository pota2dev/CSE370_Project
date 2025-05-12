import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser?.user) {
    return NextResponse.redirect('/auth/login');
  }
  const userId = authUser.user.id;

  const { data: userData, error: userTableError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: hostProfile, error: hostProfileError } = await supabase
    .from('host_profiles')
    .select('*')
    .eq('host_id', userId)
    .maybeSingle();

  const { data: guestProfile, error: guestProfileError } = await supabase
    .from('guest_profiles')
    .select('*')
    .eq('guest_id', userId)
    .maybeSingle();

  if (userTableError || hostProfileError || guestProfileError) {
    return NextResponse.json({
      error: 'Error loading profile data',
      details: {
        users: userTableError?.message,
        host_profiles: hostProfileError?.message,
        guest_profiles: guestProfileError?.message
      }
    }, { status: 500 });
  }

  return NextResponse.json({
    user: userData,
    host_profiles: hostProfile,
    guest_profiles: guestProfile
  });
}
