'use client';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { UserIcon, AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline';
import Pagination from '../components/Pagination';

function PhysiciansContent() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const [physiciansData, setPhysiciansData] = useState<any>({ members: [], currentPage: 1, totalPages: 1, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [expandedBios, setExpandedBios] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  // Get all unique specialties for filter dropdown
  const allSpecialties: string[] = physiciansData.members ? 
    [...new Set(physiciansData.members.flatMap((doctor: any) => doctor.specialties || []))] as string[] : [];

  // Filter physicians based on search criteria
  const filteredPhysicians = physiciansData.members ? physiciansData.members.filter((doctor: any) => {
    const matchesSearch = !searchTerm || 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialties?.some((spec: string) => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doctor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.role?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !selectedSpecialty || 
      doctor.specialties?.some((spec: string) => spec === selectedSpecialty);
    
    const matchesRating = !selectedRating || 
      doctor.rating >= parseFloat(selectedRating);
    
    return matchesSearch && matchesSpecialty && matchesRating;
  }) : [];

  useEffect(() => {
    const fetchPhysicians = async () => {
      try {
        const response = await fetch(`/api/physicians?page=${page}&limit=9`);
        const data = await response.json();
        setPhysiciansData(data);
      } catch (error) {
        console.error('Error fetching physicians:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhysicians();
  }, [page]);

  const toggleBio = (doctorId: string) => {
    setExpandedBios(prev => {
      const newSet = new Set(prev);
      if (newSet.has(doctorId)) {
        newSet.delete(doctorId);
      } else {
        newSet.add(doctorId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <UserIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6 tracking-tight">Our Medical Team</h1>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Meet our exceptional team of board-certified physicians dedicated to providing personalized healthcare solutions with compassion and expertise
            </p>
            <div className="mt-8 flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">15+</div>
                <div className="text-sm text-blue-200">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">5000+</div>
                <div className="text-sm text-blue-200">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-sm text-blue-200">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Physicians Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Specialists</h2>
          <div className="w-24 h-1 bg-linear-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Physicians</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, specialty, or bio..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">All Specialties</option>
                {allSpecialties.map((specialty: string) => (
                  <option value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('');
                  setSelectedRating('');
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredPhysicians.map((doctor: any, index: number) => (
              <div
                key={doctor.id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-300 flex flex-col"
              >
                {/* Profile Photo Above Card */}
                <div className="relative pt-8 pb-4">
                  <div className="relative flex justify-center">
                    {doctor.image ? (
                      <div className="relative">
                        <div className="absolute -inset-1 bg-linear-to-br from-blue-400 to-indigo-500 rounded-full blur-md opacity-50"></div>
                        <Image
                          src={doctor.image}
                          alt={doctor.name}
                          width={120}
                          height={120}
                          className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-xl border-4 border-white">
                        <UserIcon className="h-10 w-10 text-white" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                      Available
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 pt-2 flex flex-col flex-1">
                  {/* Name and Role */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
                    <div className="inline-flex items-center px-3 py-1 bg-linear-to-r from-blue-100 to-indigo-100 rounded-full">
                      <span className="text-blue-700 font-semibold text-sm">{doctor.role}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-4">
                    <p className={`text-gray-600 leading-relaxed text-sm text-center ${expandedBios.has(doctor.id) ? '' : 'line-clamp-5'}`}>
                      {doctor.bio}
                    </p>
                    {doctor.bio.split(/\s+/).length > 20 && (
                      <div className="text-center">
                      <button
                        onClick={() => toggleBio(doctor.id)}
                        type='button'
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 focus:outline-none transition-colors duration-200"
                      >
                        {expandedBios.has(doctor.id) ? 'Show Less' : 'Show More'}
                      </button>
                      </div>
                    )}
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {doctor.specialties.map((specialty: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 text-blue-600 text-xs rounded-full font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center text-blue-600 mb-1">
                        <AcademicCapIcon className="h-4 w-4 mr-1" />
                        <span className="font-semibold text-xs">Education</span>
                      </div>
                      <div className="text-gray-700 text-xs font-medium">{doctor.education}</div>
                    </div>
                    <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                      <div className="flex items-center text-green-600 mb-1">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span className="font-semibold text-xs">Experience</span>
                      </div>
                      <div className="text-gray-700 text-xs font-medium">{doctor.experience}</div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex justify-around mb-4 py-2 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{doctor.consultationCount || 0}</div>
                      <div className="text-xs text-gray-500">Consultations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{doctor.rating || 0}</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-indigo-600">${doctor.initialConsultation || 150}</div>
                      <div className="text-xs text-gray-500">Initial Fee</div>
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <Link
                    href={`/physicians/${doctor.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}`}
                    className="w-full flex items-center justify-center px-2 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-70 hover:to-purple-700 mt-auto"
                  >
                    <span>View Full Profile</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {physiciansData.totalPages > 1 && (
          <div className="mt-16">
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

export default function PhysiciansPage() {
  return (
    <Suspense fallback={
      <div className="pt-20 min-h-screen bg-linear-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading physicians...</p>
        </div>
      </div>
    }>
      <PhysiciansContent />
    </Suspense>
  );
}