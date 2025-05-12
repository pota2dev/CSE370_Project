import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PUT(request: Request) {
	const url = new URL(request.url);
	const reviewId = url.searchParams.get("place_id");
	if (!reviewId) {
		return NextResponse.json({ error: "Missing review id" }, { status: 400 });
	}
	const { rating, message } = await request.json();

	try {
		const { data, error } = await supabase
			.from("reviews")
			.update({ rating, message })
			.eq("review_id", reviewId);

		if (error) {
			throw error;
		}

		return NextResponse.json(data);
	} catch (err) {
		return NextResponse.json({ error: "Update failed" }, { status: 500 });
	}
}