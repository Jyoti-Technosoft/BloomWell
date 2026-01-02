import { notFound } from "next/navigation";

import { treatmentsData } from "../data/treatments";
import { TreatmentContent } from "./_components/treatment-content";

export async function generateStaticParams() {
  const treatments = Object.keys(treatmentsData);
  return treatments.map((treatment) => ({
    treatment: treatment.toLowerCase(),
  }));
}

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
  const treatmentData = treatmentsData[normalized];
  if (!treatmentData) {
    notFound();
  }

  return <TreatmentContent treatment={normalized} />;
}
