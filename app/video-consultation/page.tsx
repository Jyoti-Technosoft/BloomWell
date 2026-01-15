'use client';
import { useState, useEffect } from 'react';
import VideoConsultation from '@/components/VideoConsultation';
import { Physician } from '../lib/types';

export default function VideoConsultationPage() {
  const [selectedPhysician, setSelectedPhysician] = useState<Physician | null>(null);
  const [showVideoConsultation, setShowVideoConsultation] = useState(false);
  const [physiciansData, setPhysiciansData] = useState<{ members: Physician[] }>({ members: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhysicians = async () => {
      try {
        const response = await fetch('/api/physicians');
        const data = await response.json();
        setPhysiciansData({ members: data.members || [] });
      } catch (error) {
        console.error('Error fetching physicians:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhysicians();
  }, []);

  const handleStartVideoCall = (physician: any) => {
    setSelectedPhysician(physician);
    setShowVideoConsultation(true);
  };

  const handleBackToPhysicians = () => {
    setShowVideoConsultation(false);
    setSelectedPhysician(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Loading available physicians...</h1>
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="h-32 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showVideoConsultation && selectedPhysician) {
    return (
      <VideoConsultation
        physician={selectedPhysician}
        onBack={handleBackToPhysicians}
      />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Meet with a Healthcare Provider</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Connect with our medical team through secure video consultations for personalized weight management guidance
            </p>
          </div>
        </div>
      </div>

      {/* Available Physicians */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Available for Video Consultation</h2>
          <div className="w-24 h-1 bg-linear-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {physiciansData.members.map((doctor, index) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Profile Photo */}
              <div className="relative pt-8 pb-4">
                <div className="relative flex justify-center">
                  {doctor.image ? (
                    <div className="relative">
                      <div className="absolute -inset-1 bg-linear-to-br from-blue-400 to-indigo-500 rounded-full blur-md opacity-50"></div>
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-xl border-4 border-white">
                      <span className="text-white text-2xl font-bold">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                    Available
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 pt-2">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
                  <div className="inline-flex items-center px-3 py-1 bg-linear-to-r from-blue-100 to-indigo-100 rounded-full">
                    <span className="text-blue-700 font-semibold text-sm">{doctor.role}</span>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed mb-4 text-sm text-center">{doctor.bio}</p>

                {/* Specialties */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {doctor.specialties.slice(0, 2).map((specialty, idx) => (
                      <span key={idx} className="px-3 py-1 text-blue-600 text-xs rounded-full font-medium border border-blue-200">
                        {specialty}
                      </span>
                    ))}
                    {doctor.specialties.length > 2 && (
                      <span className="px-3 py-1 text-gray-600 text-xs rounded-full font-medium">
                        +{doctor.specialties.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Video Call Button */}
                <button
                  onClick={() => handleStartVideoCall(doctor)}
                  className="cursor-pointer w-full flex items-center justify-center px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Start Video Call
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
