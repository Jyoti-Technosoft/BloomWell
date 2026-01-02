import { notFound } from "next/navigation";
import { TreatmentContent } from "./_components/treatment-content";

export async function generateMetadata({ params }: { params: Promise<{ treatment: string }> }) {
  const { treatment } = await params;

  if (!treatment) {
    return {};
  }

  return {
    title: `${treatment} Treatment`,
  };
}

export default async function TreatmentPage({ params }: { params: Promise<{ treatment: string }> }) {
  const { treatment } = await params;
  if (!treatment) {
    notFound();
  }

  const normalized = treatment.toLowerCase();
  
  return <TreatmentContent treatment={normalized} />;
}
