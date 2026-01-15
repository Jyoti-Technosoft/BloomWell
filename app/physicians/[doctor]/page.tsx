'use client';
import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Toast from '../../components/Toast';
import BookingModal from '../../components/BookingModal';
import StarRating from '../../components/StarRating';
import { useUser } from '../../context/UserContext';
import { Physician, DoctorProfileProps } from '../../lib/types';

export default function DoctorProfile({ params }: DoctorProfileProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [doctorData, setDoctorData] = useState<Physician | null>(null);
  const [physicians, setPhysicians] = useState<Physician[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  const handleCloseToast = () => {
    setToast(null);
  };

  // For static generation compatibility
  const resolvedParams = React.use(params);
  const { doctor: slug } = resolvedParams;
  
  const formatSlugToTitle = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const fetchPhysicians = async () => {
      try {
        const response = await fetch('/api/physicians?limit=100'); // Fetch all physicians
        const data = await response.json();
        const physiciansList = data.members || [];
        setPhysicians(physiciansList);
        
        // Find the specific doctor
        const doctor = physiciansList.find((d: Physician) =>
          d.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/\./g, '') === slug  
        );
        
        setDoctorData(doctor || null);
      } catch (error) {
        console.error('Error fetching physicians:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhysicians();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white">
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto px-12 py-12">
            <h1 className="text-4xl font-bold mb-2">
              {formatSlugToTitle(slug)}
            </h1>
            <div className="mt-6 h-8 max-w-3xl bg-linear-to-r from-indigo-500 to-purple-500"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!doctorData) {
    notFound();
  }

  const handleBookConsultation = () => {
    if (!user) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/physicians/${slug}`)}`);
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingComplete = (bookingData: any) => {
    setToast({
      message: 'Consultation booked successfully! You will receive a confirmation email shortly.',
      type: 'success'
    });
    setShowBookingModal(false);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={doctorData.image}
                  alt={doctorData.name}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{doctorData.name}</h1>
              <p className="text-xl text-indigo-100 mb-1">{doctorData.specialties?.join(', ') || ''}</p>
              <p className="text-indigo-200">{doctorData.education}</p>
              <div className="flex items-center justify-center md:justify-start mt-2 space-x-4">
                <StarRating 
                  rating={doctorData.rating || 0} 
                  reviewCount={doctorData.reviewCount || 0}
                  size="sm"
                  className="text-white"
                />
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full mr-2"></div>
                  <span className="text-indigo-200">{doctorData.experience} experience</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-2"></div>
                  <span className="text-indigo-200">{doctorData.consultationCount || 0} consultations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* About Section */}
          <div className="p-8 border-b">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About Dr. {doctorData.name.split(' ').slice(1).join(' ')}</h2>
            <p className="text-gray-600 leading-relaxed">{doctorData.bio}</p>
          </div>

          {/* Additional Information */}
          <div className="p-8 border-b">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Specialties</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• {doctorData.specialties?.join(', ') || ''}</li>
                  <li>• Hormone Therapy</li>
                  <li>• Weight Management</li>
                  <li>• Preventive Care</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Education & Training</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• {doctorData.education}</li>
                  <li>• Residency: Internal Medicine</li>
                  <li>• Fellowship: Endocrinology</li>
                  <li>• Board Certified: Internal Medicine</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Consultation Info */}
          <div className="p-8 border-b">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Consultation Information</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-3xl font-bold text-indigo-600 mb-2">${doctorData.initialConsultation || 150}</p>
                <p className="text-gray-600">Initial Consultation</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-3xl font-bold text-green-600 mb-2">30 min</p>
                <p className="text-gray-600">Consultation Duration</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-3xl font-bold text-purple-600 mb-2">12-24 hrs</p>
                <p className="text-gray-600">Response Time</p>
              </div>
            </div>
          </div>

          {/* Healthcare Standards Notice */}
          <div className="p-8 border-b bg-blue-50">
            <div className="flex items-start space-x-3">
              <div className="shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Healthcare Standards</h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                  All consultations follow proper medical protocols. Video consultations are scheduled in advance 
                  and conducted through secure, HIPAA-compliant platforms. Direct instant video calls are not 
                  available to ensure quality of care and proper medical documentation.
                </p>
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="p-8">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Schedule Your Consultation</h3>
              <p className="text-gray-600 mb-6">Book a consultation with Dr. {doctorData.name.split(' ').slice(1).join(' ')} through our secure healthcare platform.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleBookConsultation}
                  className="cursor-pointer inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Book Consultation
                </button>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-6 justify-center text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                  <span>Scheduled appointments only</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Secure video consultations</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span>HIPAA-compliant platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Doctors */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Other Physicians</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {physicians
              .filter(d => d.name !== doctorData.name)
              .slice(0, 3)
              .map(doctor => (
                <Link
                  key={doctor.name}
                  href={`/physicians/${doctor.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="h-32 w-32 rounded-full overflow-hidden mx-auto mt-4">
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                    <p className="text-sm text-indigo-600">{doctor.specialties?.join(', ') || ''}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}

      {/* Booking Modal */}
      {showBookingModal && doctorData && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={handleCloseBookingModal}
          physician={doctorData}
          onComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}

