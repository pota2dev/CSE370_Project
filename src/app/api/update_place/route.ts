import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function PUT(request: Request) {
	// Create supabase client and check authentication
	const supabase = await createClient();
	const { data: userData, error: userError } = await supabase.auth.getUser();
	if (userError || !userData?.user) {
		return NextResponse.redirect('/auth/login');
	}
	// Parse the incoming JSON data
	const body = await request.json();
	const { place_id, ...updateData } = body;
	if (!place_id) {
		return NextResponse.json({ error: 'Missing place_id' }, { status: 400 });
	}
	// Update the given place
	const { data, error } = await supabase
		.from('places')
		.update(updateData)
		.eq('place_id', place_id)
		.single();
	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
	return NextResponse.json({ place: data });
}