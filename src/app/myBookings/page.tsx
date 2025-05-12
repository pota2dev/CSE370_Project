import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

export default async function MyBookingsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .eq('guest_id', data.user.id)

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      <p>Email: {data.user.email}</p>
      <p>User ID: {data.user.id}</p>
      {bookingsError && (
        <p className="text-red-600">Error loading bookings: {bookingsError.message}</p>
      )}
      {bookings && bookings.length > 0 ? (
        <ul className="mt-4">
          {bookings.map((booking: any) => (
            <li key={booking.id} className="border p-2 mb-2 rounded">
              {/* Display booking details as needed */}
              {JSON.stringify(booking)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4">No bookings found.</p>
      )}
    </div>
  )
}
