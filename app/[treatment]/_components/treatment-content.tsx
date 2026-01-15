"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Medicine, Treatment } from '../../lib/types';

export function TreatmentContent({ treatment }: { treatment: string }) {
  const [treatmentData, setTreatmentData] = useState<Treatment | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const formatSlugToTitle = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch treatment data
        const treatmentResponse = await fetch('/api/treatments');
        const treatments = await treatmentResponse.json();
        const foundTreatment = treatments.find((t: Treatment) => 
          t.name.toLowerCase().replace(/\s+/g, '-') === treatment
        );
        
        if (foundTreatment) {
          setTreatmentData(foundTreatment);
          
          // Fetch medicines for this treatment category, with fallback to all medicines
          const category = foundTreatment.category || 'weight-loss'; // Default fallback
          const medicinesResponse = await fetch(`/api/medicines?category=${category}`);
          const medicinesData = await medicinesResponse.json();
          setMedicines(medicinesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [treatment]);

  if (loading) {
    return (
      <div className="bg-white">
        <div className="bg-indigo-700">
          <div className="max-w-7xl mx-auto py-16 px-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
              {formatSlugToTitle(treatment)}
            </h1>
            <div className="mt-6 h-8 max-w-3xl bg-indigo-600"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!treatmentData) {
    return (
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Treatment Not Found</h1>
          <p className="mt-4 text-gray-600">The treatment you're looking for doesn't exist.</p>
          <Link href="/treatments" className="mt-6 inline-flex items-center text-indigo-600 hover:text-indigo-500">
            ← Back to Treatments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-16 px-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
            {treatmentData.name}
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-indigo-100">
            {treatmentData.description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="prose prose-indigo lg:max-w-none mb-12">
              <h2>About {treatmentData.name}</h2>
              <p className="text-lg text-gray-600">{treatmentData.overview || treatmentData.description}</p>
            </div>

            {treatmentData.howItWorks && (
              <div className="prose prose-indigo lg:max-w-none mb-12">
                <h3>How It Works</h3>
                <p className="text-gray-600">{treatmentData.howItWorks}</p>
              </div>
            )}

            {treatmentData.benefits && treatmentData.benefits.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Benefits
                </h3>
                <ul className="space-y-4">
                  {treatmentData.benefits.map(
                    (benefit: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-0.5 shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {treatmentData.faqs && treatmentData.faqs.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-8">
                  {treatmentData.faqs.map((faq: { question: string; answer: string }, index: number) => (
                    <div key={index} className="border-b border-gray-200 pb-6">
                      <h4 className="text-lg font-medium text-gray-900">
                        {faq.question}
                      </h4>
                      <p className="mt-2 text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* <div className="mt-12 lg:mt-0">
            <div className="bg-indigo-50 rounded-lg p-6 sticky top-6">
              <h3 className="text-xl font-medium text-gray-900">
                Ready to get started?
              </h3>
              <p className="mt-2 text-gray-600">
                Schedule a consultation with one of our specialists today to
                learn more about {treatmentData.name}.
              </p>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Book a Consultation
                </Link>
              </div>
              <div className="mt-4 text-center">
                <a
                  href="tel:+15551234567"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Or call us at (555) 123-4567
                </a>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Available Medications
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Select your preferred medication and dosage
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {medicines.length > 0 ? (
            medicines.map((medicine: Medicine) => (
              <div key={medicine.id} className="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-100 flex items-center justify-center p-4">
                  {medicine.image ? (
                    <img
                      src={medicine.image}
                      alt={medicine.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <svg
                        className="h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{medicine.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{medicine.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ${medicine.price}
                    </span>
                    {medicine.inStock ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/medicines/${medicine.id}`}
                      className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        medicine.inStock
                          ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                          : 'bg-gray-400 cursor-not-allowed'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    >
                      {!medicine.inStock ? "Out of Stock" : "View Details"}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">
                No medications currently available for this treatment.
              </p>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="text-base font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Contact us for availability
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
