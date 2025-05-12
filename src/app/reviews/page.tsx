"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Review {
	review_id: string;
	place_id: string;
	rating: number;
	message: string;
	created_at: string;
}

interface PlaceInfo {
	place_id: string;
	place_type: string;
	guest_capacity: number;
	bedroom_count: number;
	bed_count: number;
	bathroom_count: number;
	size_sqm: number;
	check_in_time: string;
	check_out_time: string;
	location: string;
	policy: string | null;
	price: number;
	currency: string;
	description: string;
}

export default function ReviewsPage() {
	const searchParams = useSearchParams();
	const placeId = searchParams.get("place_id");
	const [reviews, setReviews] = useState<Review[]>([]);
	const [error, setError] = useState("");
	const [placeInfo, setPlaceInfo] = useState<PlaceInfo | null>(null);

	useEffect(() => {
		if (placeId) {
			fetch(`/api/fetch_reviews?place_id=${placeId}`)
				.then((res) => res.json())
				.then((data) => {
					setReviews(data);
				})
				.catch(() => setError("Failed to load reviews"));

			fetch(`/api/placeInfo?place_id=${placeId}`)
				.then((res) => res.json())
				.then((data) => {
					// If API returns a nested "place" property, extract it.
					const place = data && data.place ? data.place : data;
					console.log("Fetched placeInfo:", place);
					setPlaceInfo(place);
				})
				.catch((err) => {
					console.error("Failed to load place info", err);
				});
		}
	}, [placeId]);

	const getReviewerName = (reviewId: string) => {
		return "User " + reviewId.substring(0, 4);
	};

	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-bold">Reviews</h1>
			<div className="mb-6 p-4 border rounded-lg shadow">
				<h2 className="text-xl font-semibold">
					{placeInfo ? placeInfo.location : "Loading place info..."}
				</h2>
				<p>
					{placeInfo ? placeInfo.description : ""}
				</p>
			</div>
			{error && <p className="text-red-500">{error}</p>}
			{reviews.map((review) => (
				<Card key={review.review_id} className="mb-4">
					<CardHeader>
						<CardTitle className="flex justify-between">
							<span>{getReviewerName(review.review_id)}</span>
							<span className="font-medium">Rating: {review.rating}</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p>{review.message}</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}