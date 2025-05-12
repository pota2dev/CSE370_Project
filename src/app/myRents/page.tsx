import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

export default async function MyRentsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  const { data: rents, error: rentsError } = await supabase
    .from('bookings')
    .select('*')
    .eq('host_id', data.user.id)

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold mb-4">My Rents</h1>
      <p>User ID: {data.user.id}</p>
      {rentsError && (
        <p className="text-red-600">Error loading rents: {rentsError.message}</p>
      )}
      {rents && rents.length > 0 ? (
        <ul className="mt-4">
          {rents.map((rent: any) => (
            <li key={rent.id} className="border p-2 mb-2 rounded">
              {/* Display rent details as needed */}
              {JSON.stringify(rent)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4">No rents found.</p>
      )}
    </div>
  )
}
