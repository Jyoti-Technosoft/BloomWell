'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserIcon, AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getPhysicians } from '../data/physicians';
import Pagination from '../components/Pagination';
import { useSearchParams } from 'next/navigation';

export default function PhysiciansPage() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const physiciansData = getPhysicians(page, 9);

  return (
    <div className="pt-20 min-h-screen bg-linear-to-br from-gray-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Our Medical Team</h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Meet our exceptional team of board-certified physicians dedicated to providing personalized healthcare solutions
            </p>
          </div>
        </div>
      </div>

      {/* Physicians Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {physiciansData.members.map((doctor, index) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              {/* Card Header with Image */}
              <div className="relative h-48 bg-linear-to-br from-indigo-500 to-purple-600 overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="relative h-full flex items-center justify-center">
                  {doctor.image ? (
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      width={120}
                      height={120}
                      className="w-30 h-30 rounded-full object-cover border-4 border-white shadow-xl"
                    />
                  ) : (
                    <div className="w-30 h-30 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                      <UserIcon className="h-16 w-16 text-indigo-600" />
                    </div>
                  )}
                </div>
                {/* <div className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1">
                  <span className="text-xs font-medium text-indigo-600">Available</span>
                </div> */}
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
                <p className="text-indigo-600 font-semibold mb-3">{doctor.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{doctor.bio}</p>

                {/* Specialties */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {doctor.specialties.slice(0, 3).map((specialty, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                        {specialty}
                      </span>
                    ))}
                    {doctor.specialties.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                        +{doctor.specialties.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Education and Experience */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <AcademicCapIcon className="h-4 w-4 mr-2 text-indigo-600" />
                    {doctor.education}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2 text-indigo-600" />
                    {doctor.experience} experience
                  </div>
                </div>

                {/* View Profile Button */}
                <div className="mt-6">
                  <Link
                    href={`/physicians/${doctor.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 group-hover:shadow-lg"
                  >
                    View Full Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {physiciansData.totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={physiciansData.currentPage}
              totalPages={physiciansData.totalPages}
              hasNext={physiciansData.hasNext}
              hasPrev={physiciansData.hasPrev}
              basePath="/physicians"
            />
          </div>
        )}
      </div>
    </div>
  );
}