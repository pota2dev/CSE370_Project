import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function DELETE(request: Request) {
  const supabase = await createClient();
  
  let payload;
  try {
    payload = await request.json();
  } catch (err) {
    console.error("Invalid JSON:", err);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  
  const { id } = payload;
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid id' }, { status: 400 });
  }
  
  const { error } = await supabase
    .from("places") // updated table name to match actual table
    .delete()
    .eq('place_id', id);
  
  if (error) {
    console.error("Delete error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ message: 'Page deleted successfully' });
}
