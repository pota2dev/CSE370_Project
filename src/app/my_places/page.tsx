"use client";
import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableCaption, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";

export default function MyPlacesPage() {
  const session = useSession();
  const router = useRouter();
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch(`/api/myPlaces?userId=${session?.user?.id}`);
        if (!res.ok) throw new Error("Failed to fetch places");
        const data = await res.json();
        // Change: extract places from the response object which contains "places"
        setPlaces(data.places);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, [session, router]);

  const deletePlace = async (placeId: string) => {
    try {
      const res = await fetch('/api/delete_place', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: placeId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete place");
      }
      // Update: filter using place.place_id
      setPlaces(prev => prev.filter((p) => p.place_id !== placeId));
    } catch (err: any) {
      alert(`Error deleting place: ${err.message}`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Places</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {places.map((place) => (
            // Update: use place.place_id as key and in delete call
            <TableRow key={place.place_id}>
              <TableCell>{place.title}</TableCell>
              <TableCell>{place.location}</TableCell>
              <TableCell>{place.price}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => alert("Modify action to be implemented")}>
                    Modify
                  </Button>
                  <Button variant="destructive" onClick={() => deletePlace(place.place_id)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {places.length === 0 && <TableCaption>No places found.</TableCaption>}
      </Table>
    </div>
  );
}
