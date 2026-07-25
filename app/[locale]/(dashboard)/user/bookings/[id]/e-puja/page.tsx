import { EPujaRoom } from "@/components/booking/e-puja-room";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserEPujaPage({ params }: PageProps) {
  const { id } = await params;
  return <EPujaRoom bookingId={id} />;
}
