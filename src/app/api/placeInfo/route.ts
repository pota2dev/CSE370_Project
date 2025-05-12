import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(request: Request) {
	const supabase = await createClient();
	const { data: userData, error: userError } = await supabase.auth.getUser();

	if (userError || !userData?.user) {
		return NextResponse.redirect('/auth/login');
	}

	const { searchParams } = new URL(request.url);
	const placeId = searchParams.get('place_id');
	if (!placeId) {
		return NextResponse.json({ error: 'Missing place_id query parameter' }, { status: 400 });
	}

	const { data: place, error: placeError } = await supabase
		.from('places')
		.select('*')
		.eq('place_id', placeId)
		.maybeSingle();

	if (placeError) {
		return NextResponse.json({ error: placeError.message }, { status: 500 });
	}
	if (!place) {
		return NextResponse.json({ error: 'Place not found' }, { status: 404 });
	}

	return NextResponse.json({ place });
}