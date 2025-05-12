import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
	const url = new URL(request.url);
	const placeId = url.searchParams.get("place_id");
	if (!placeId) {
		return NextResponse.json({ error: "Missing place id" }, { status: 400 });
	}

	try {
		const { data, error } = await supabase
			.from("reviews")
			.select("*")
			.eq("place_id", placeId);

		if (error) {
			throw error;
		}

		return NextResponse.json(data);
	} catch (err) {
		return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
	}
}
