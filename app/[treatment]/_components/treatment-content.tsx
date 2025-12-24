"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

import { treatmentsData, medicineOptions, MedicineOption } from "../../data/treatments";
import { useUser } from "../../context/UserContext";

function MedicineCard({ medicine }: { medicine: MedicineOption }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { user } = useUser();

  const handleViewDetails = () => {
    router.push(`/medicines/${medicine.id}`);
  };

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="p-6 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {medicine.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{medicine.description}</p>
            <p className="mt-2 text-sm text-gray-600">{medicine.dosage}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              ${medicine.price}
            </p>
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
        </div>

        <ul className="mt-4 space-y-2">
          {medicine.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="ml-2 text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <button
          onClick={handleViewDetails}
          disabled={!medicine.inStock}
          className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            medicine.inStock
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-gray-400 cursor-not-allowed"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {!medicine.inStock ? "Out of Stock" : "View Details"}
        </button>
      </div>
    </div>
  );
}

export function TreatmentContent({ treatment }: { treatment: string }) {
  const treatmentData = treatmentsData[treatment];
  const medicines = medicineOptions[treatment] || [];

  return (
    <div className="bg-white">
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
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
              <p className="text-lg text-gray-600">{treatmentData.overview}</p>
            </div>

            <div className="prose prose-indigo lg:max-w-none mb-12">
              <h3>How It Works</h3>
              <p className="text-gray-600">{treatmentData.howItWorks}</p>
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Benefits
              </h3>
              <ul className="space-y-4">
                {treatmentData.benefits.map(
                  (benefit: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h3>
              <div className="space-y-8">
                {treatmentData.faqs.map((faq: any, index: number) => (
                  <div key={index} className="border-b border-gray-200 pb-6">
                    <h4 className="text-lg font-medium text-gray-900">
                      {faq.question}
                    </h4>
                    <p className="mt-2 text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
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
            medicines.map((medicine) => (
              <MedicineCard key={medicine.id} medicine={medicine} />
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
