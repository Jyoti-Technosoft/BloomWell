import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const treatments = [
  {
    name: "Semaglutide",
    href: "/semaglutide",
    description:
      "Advanced GLP-1 medication for sustainable weight management and blood sugar control.",
    features: [
      "Weekly injections",
      "Appetite suppression",
      "Blood sugar regulation",
      "FDA-approved",
    ],
  },
  {
    name: "Tirzepatide",
    href: "/tirzepatide",
    description:
      "Dual GIP and GLP-1 receptor agonist for significant weight loss and glycemic control.",
    features: [
      "Weekly injections",
      "Dual-action formula",
      "Clinically proven results",
      "Professional monitoring",
    ],
  },
  {
    name: "Testosterone Therapy",
    href: "/testosterone-therapy",
    description:
      "Personalized hormone therapy to optimize energy, strength, and overall well-being.",
    features: [
      "Hormone level testing",
      "Custom treatment plans",
      "Ongoing monitoring",
      "Expert medical supervision",
    ],
  },
  {
    name: "Erectile Dysfunction",
    href: "/erectile-dysfunction",
    description:
      "Comprehensive solutions for improved sexual health and performance.",
    features: [
      "Discrete consultations",
      "Personalized treatment",
      "Oral medications",
      "Lifestyle guidance",
    ],
  },
  {
    name: "Oral ED Treatments",
    href: "/oral-ed-treatments",
    description:
      "Effective oral medications for erectile dysfunction management.",
    features: [
      "Proven medications",
      "Flexible dosing",
      "Quick results",
      "Private consultations",
    ],
  },
  {
    name: "Injectable Treatments",
    href: "/injectable",
    description:
      "Advanced injectable therapies for various health and wellness needs.",
    features: [
      "Professional administration",
      "Precise dosing",
      "Effective results",
      "Medical supervision",
    ],
  },
];

export default function TreatmentsPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
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
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {treatments.map((treatment) => (
            <Link
              key={treatment.href}
              href={`${treatment.href}`}
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
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-indigo-600">
              Contact us today for a consultation.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
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
