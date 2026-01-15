'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useUser } from '../context/UserContext';
import Toast from '../components/Toast';
import BookingModal from '../components/BookingModal';
import { Physician } from '../lib/types';

export default function BookConsultation() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPhysician, setSelectedPhysician] = useState<Physician | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [physicians, setPhysicians] = useState<Physician[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchPhysicians = async () => {
      try {
        const response = await fetch('/api/physicians');
        const data = await response.json();
        setPhysicians(data.members || []);
      } catch (error) {
        console.error('Error fetching physicians:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhysicians();
  }, []);

  const handleCloseToast = () => {
    setToast(null);
  };

  const handleBookingComplete = (bookingData: any) => {
    setToast({
      message: 'Consultation booked successfully! You will receive a confirmation email shortly.',
      type: 'success'
    });
    setShowBookingModal(false);
    setSelectedPhysician(null);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
  };

  const openBookingModal = (physician: Physician) => {
    if (!user) {
      router.push('/auth/signin?callbackUrl=/book-consultation');
      return;
    }
    setSelectedPhysician(physician);
    setShowBookingModal(true);
  };
  console.log("Selected Physician:", selectedPhysician);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link 
            href="/physicians" 
            className="inline-flex items-center text-indigo-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Physicians
          </Link>
          <h1 className="text-4xl font-bold mb-4">Book Consultation</h1>
          <p className="text-xl text-indigo-100">Schedule an appointment with our expert physicians</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Physicians List */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Our Physicians</h3>
                  <span className="text-sm text-gray-500">{physicians.length} physicians available</span>
                </div>
                <div className={`space-y-4 ${physicians.length > 5 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
                  {physicians.map((physician: Physician) => (
                    <div 
                      key={physician.name}
                      className="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md border-gray-200 hover:border-gray-300"
                      onClick={() => openBookingModal(physician)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                            <img
                              src={physician.image}
                              alt={physician.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{physician.name}</h4>
                          <p className="text-sm text-indigo-600 font-medium">{physician.specialties.join(', ')}</p>
                          <p className="text-sm text-gray-600 mt-1">{physician.education}</p>
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{physician.bio}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-600">
                              ${physician.initialConsultation || 150}
                            </span>
                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                              Book Now →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {physicians.length > 5 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      Scroll to see all {physicians.length} physicians
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="space-y-6">
            {/* Healthcare Standards */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">Healthcare Standards</h4>
              <p className="text-blue-700 text-sm leading-relaxed mb-4">
                All consultations follow proper medical protocols. Video consultations are scheduled in advance 
                and conducted through secure, HIPAA-compliant platforms to ensure quality of care and proper medical documentation.
              </p>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  <span>Scheduled appointments only</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                  <span>Secure video consultations</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                  <span>HIPAA-compliant platform</span>
                </div>
              </div>
            </div>

            {/* What to Expect */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">What to Expect</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  Initial consultation typically lasts 30-45 minutes
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  Please arrive 10 minutes early for paperwork
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  Bring your insurance card and photo ID
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  List of current medications and allergies
                </li>
              </ul>
            </div>

            {/* Consultation Types */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Consultation Types</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📹</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Video Consultation</p>
                    <p className="text-sm text-gray-600">HIPAA-compliant video calls</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">📞</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Phone Consultation</p>
                    <p className="text-sm text-gray-600">Voice-only appointments</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm">🏥</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">In-Person Visit</p>
                    <p className="text-sm text-gray-600">Face-to-face appointments</p>
                  </div>
                </div>
              </div>
            </div>
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
      {showBookingModal && selectedPhysician && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={handleCloseBookingModal}
          physician={selectedPhysician}
          onComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}
