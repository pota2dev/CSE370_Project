"use client";
import { useEffect, useState } from "react";
import RoomForm from "@/components/RoomForm";
import { useRouter, useSearchParams } from "next/navigation";

export default function UpdatePlacePage() {
  const searchParams = useSearchParams();
  const placeId = searchParams.get("place_id");
  const [defaultValues, setDefaultValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!placeId) {
      alert("Place ID is missing from URL");
      router.push("/rooms");
      return;
    }
    async function fetchPlace() {
      try {
        const res = await fetch(
          `/api/placeInfo?place_id=${placeId}`, // updated endpoint from /api/myPlaces to /api/placeInfo
          { headers: { Accept: "application/json" } }
        );
        const json = await res.json();
        if (json.place) {
          setDefaultValues(json.place);
        } else {
          alert("Place not found");
          router.push("/rooms");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlace();
  }, [placeId, router]);

  if (loading) return <div>Loading...</div>;
  if (!defaultValues) return null;

  return (
    <div>
      <h1>Update Place</h1>
      {/* Passing isUpdate as a prop so RoomForm can use the update endpoint if modified */}
      <RoomForm defaultValues={defaultValues} isUpdate={true} />
    </div>
  );
}
