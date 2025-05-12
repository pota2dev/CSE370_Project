import RoomForm from '@/components/RoomForm';

export default function CreateRoomPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			{/* Render the form with no defaultValues for create */}
			<RoomForm />
		</div>
	);
}