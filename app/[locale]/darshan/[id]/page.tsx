import { notFound } from "next/navigation";
import { MOCK_TEMPLES } from "@/types/darshan";
import { DarshanClient } from "./DarshanClient";

export default async function DarshanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const temple = MOCK_TEMPLES.find((t) => t.id === id);
  
  if (!temple) {
    notFound();
  }

  return <DarshanClient temple={temple} />;
}
