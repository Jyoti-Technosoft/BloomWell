'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { UserIcon } from '@heroicons/react/24/outline';
import Pagination from './Pagination';
import { Physician } from '../lib/types';

export default function TeamSection() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const [teamData, setTeamData] = useState<{
    members: Physician[];
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }>({
    members: [],
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhysicians = async () => {
      try {
        const response = await fetch('/api/physicians');
        const data = await response.json();
        const physicians = data.members || [];
        
        // Simple pagination logic (9 items per page)
        const itemsPerPage = 9;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedMembers = physicians.slice(startIndex, endIndex);
        
        setTeamData({
          members: paginatedMembers,
          currentPage: page,
          totalPages: Math.ceil(physicians.length / itemsPerPage),
          hasNext: endIndex < physicians.length,
          hasPrev: page > 1
        });
      } catch (error) {
        console.error('Error fetching physicians:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhysicians();
  }, [page]);

  if (loading) {
    return (
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Loading team members...
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
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
          {teamData.members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-w-1 aspect-h-1 bg-linear-to-br from-indigo-100 to-purple-100 p-8">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <UserIcon className="h-16 w-16 text-indigo-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                <p className="text-sm text-indigo-600 font-medium">{member.role}</p>
                <p className="mt-2 text-sm text-gray-500">{member.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {member.specialties.slice(0, 2).map((specialty, idx) => (
                    <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Education:</span> {member.education}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-medium">Experience:</span> {member.experience}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {teamData.totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={teamData.currentPage}
              totalPages={teamData.totalPages}
              hasNext={teamData.hasNext}
              hasPrev={teamData.hasPrev}
              basePath="/about"
            />
          </div>
        )}
      </div>
    </div>
  );
}
