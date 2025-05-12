import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData?.user) {
    return NextResponse.redirect('/auth/login');
  }
  
  const userId = userData.user.id;
  const { data: places, error: placesError } = await supabase
    .from('places')
    .select('*')
    .eq('owner_id', userId);
    
  if (placesError) {
    return NextResponse.json({ error: placesError.message }, { status: 500 });
  }
  
  return NextResponse.json({ places });
}