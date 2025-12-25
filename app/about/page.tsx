import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover transform scale-105"
            src="/medical-team.jpg"
            alt="Medical Team"
          />
            {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40" />
            <div className="absolute inset-0 bg-black/10" /> */}
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          {/* <div className="backdrop-blur-md bg-white/20 rounded-2xl p-8 md:p-12 max-w-4xl border border-white/30 shadow-2xl"> */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-xl">
              About Our Clinic
            </h1>
            <p className="mt-6 text-xl text-white max-w-3xl drop-shadow-lg">
              Personalized healthcare solutions for a better quality of life.
            </p>
          {/* </div> */}
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-start">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Our Story
              </h2>
              <div className="mt-4 text-lg leading-relaxed text-gray-600 space-y-6">
                <p>
                  Founded in 2023, our clinic was created with a single mission: to make modern,
                  evidence-based healthcare more accessible, personalized, and human. We believe
                  that every individual deserves care that goes beyond one-size-fits-all solutions.
                </p>
                <p>
                  Our team of board-certified physicians and healthcare professionals brings together
                  years of clinical expertise and a deep understanding of whole-body wellness. By
                  combining advanced medical treatments with personalized care plans, we help you
                  move confidently toward your health and wellness goals.
                </p>
                <p>
                  From your first consultation to ongoing care, we’re committed to supporting you
                  with compassion, transparency, and medical excellence—every step of the way.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/treatments"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Explore Treatments
                </Link>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <img
                className="rounded-lg shadow-xl"
                src="/clinic-interior.jpg"
                alt="Clinic Interior"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Our Mission */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Mission
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-500">
              To provide exceptional, personalized healthcare that improves
              quality of life through innovative treatments and compassionate
              care.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                name: 'Expert Care',
                description:
                  'Our team of specialists is dedicated to your health and well-being.',
              },
              {
                name: 'Personalized Treatment',
                description:
                  'Customized treatment plans tailored to your unique needs.',
              },
              {
                name: 'Cutting-Edge Solutions',
                description:
                  'Access to the latest medical advancements and treatments.',
              },
            ].map((feature) => (
              <div
                key={feature.name}
                className="pt-6 bg-white rounded-lg shadow-md p-6"
              >
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <CheckCircleIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      {feature.name}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Experienced professionals dedicated to your health.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                name: 'Dr. Sarah Johnson',
                role: 'Medical Director',
                bio: 'Board-certified physician with over 15 years of experience in hormone therapy and weight management.',
                image: '/images/dr-sarah.jpg',
              },
              {
                name: 'Dr. Michael Chen',
                role: 'Endocrinologist',
                bio: 'Specializes in hormonal imbalances and metabolic health with a focus on personalized treatment plans.',
                image: '/images/dr-chen.jpg',
              },
              {
                name: 'Natalie Williams, NP',
                role: 'Nurse Practitioner',
                bio: 'Dedicated to patient education and providing compassionate care for all our patients.',
                image: '/images/nurse-natalie.jpg',
              },
            ].map((person) => (
              <div
                key={person.name}
                className="pt-6 bg-white rounded-lg shadow-md"
              >
                <div className="relative pb-5/6">
                  <img
                    className="absolute h-full w-full object-cover shadow-lg rounded-t-lg"
                    src={person.image}
                    alt={person.name}
                  />
                </div>
                <div className="relative px-4 -mt-16">
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0"></div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {person.name}
                        </h3>
                        <p className="text-sm text-indigo-600">{person.role}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">{person.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}