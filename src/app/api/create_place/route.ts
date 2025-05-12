import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData?.user) {
    console.error("Auth error:", authError);
    return NextResponse.redirect('/auth/login');
  }
  const ownerId = userData.user.id;

  let payload;
  try {
    payload = await request.json();
  } catch (err) {
    console.error("Invalid JSON:", err);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('places')
    .insert([{ ...payload, owner_id: ownerId }])
    .select();

  console.log("Insert payload:", payload);
  console.log("Owner ID:", ownerId);
  console.log("Insert response:", { data, error });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ room: data });
}