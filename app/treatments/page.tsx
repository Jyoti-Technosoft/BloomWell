'use client';

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

interface Treatment {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  medicines: string[];
}

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await fetch('/api/treatments');
        const data = await response.json();
        setTreatments(data);
      } catch (error) {
        console.error('Error fetching treatments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTreatments();
  }, []);

  const getTreatmentHref = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '');
  };

return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:py-24 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
            Our Treatments
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-indigo-100">
            Personalized medical treatments designed to help you achieve your
            health and wellness goals.
          </p>
        </div>
      </div>

      {/* Treatments Grid */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse h-48">
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {treatments.map((treatment) => (
              <Link
                key={treatment.id}
                href={`/${getTreatmentHref(treatment.name)}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <div className="p-6 flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {treatment.name}
                    </h2>
                    <p className="text-gray-600 mb-4">{treatment.description}</p>
                    <div className="mt-auto">
                      <span className="inline-flex items-center text-indigo-600 group-hover:text-indigo-800 font-medium">
                        Learn more
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-indigo-600">
              Contact us today for a consultation.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
