"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function UpdateReviewPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const reviewId = searchParams.get("place_id");
	const [rating, setRating] = useState(0);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (reviewId) {
			// Load existing review details
			fetch(`/api/fetch_reviews?place_id=${reviewId}`)
				.then((res) => res.json())
				.then((data) => {
					if (data.length > 0) {
						setRating(data[0].rating);
						setMessage(data[0].message);
					} else {
						setError("Review not found");
					}
				})
				.catch(() => setError("Failed to load review"));
		}
	}, [reviewId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const res = await fetch(`/api/update_review?place_id=${reviewId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ rating, message }),
		});
		if (res.ok) {
			router.push("/my_places");
		} else {
			setError("Failed to update review");
		}
	};

	return (
		<div className="p-6">
			<h1>Update Review</h1>
			{error && <p>{error}</p>}
			<form onSubmit={handleSubmit}>
				<label>
					Rating:
					<input
						type="number"
						value={rating}
						onChange={(e) => setRating(Number(e.target.value))}
					/>
				</label>
				<br />
				<label>
					Message:
					<textarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
				</label>
				<br />
				<button type="submit">Update</button>
			</form>
		</div>
	);
}