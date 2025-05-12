import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData?.user) {
    console.error("Auth error:", authError);
    return NextResponse.redirect('/auth/login');
  }
  const userId = userData.user.id;
  
  let payload;
  try {
    payload = await request.json();
  } catch (err) {
    console.error("Invalid JSON:", err);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  
  console.log("Received update profile payload:", payload);
  console.log("User ID:", userId);
  
  const { type, data } = payload;
  if (!type || typeof type !== 'string' || !data || typeof data !== 'object') {
    return NextResponse.json({ error: 'Missing or invalid type/data' }, { status: 400 });
  }
  
  let dbResponse;
  switch (type) {
    case 'main': {
      const mainData = { user_id: userId, ...data };
      dbResponse = await supabase
        .from('users') 
        .upsert(mainData, { onConflict: 'user_id'})
        .select();
      break;
    }    
    case 'guest': {
      const guestData = { guest_id: userId, ...data };
      dbResponse = await supabase
        .from('guest_profiles')
        .upsert(guestData, { onConflict: 'guest_id' })
        .select();
      break;
    }
    case 'host': {
      const hostData = { host_id: userId, ...data };
      dbResponse = await supabase
        .from('host_profiles')
        .upsert(hostData, { onConflict: 'host_id' })
        .select();
      break;
    }
    default:
      return NextResponse.json({ error: 'Invalid profile type specified.' }, { status: 400 });
  }
  
  console.log("DB response:", dbResponse);
  
  if (dbResponse.error) {
    console.error("DB error:", dbResponse.error.message);
    return NextResponse.json({ error: dbResponse.error.message }, { status: 500 });
  }
  
  return NextResponse.json({ message: `${type} profile updated successfully!`, data: dbResponse.data });
}
