'use client';
import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Toast from '../../components/Toast';
import VideoConsultation from '../../../components/VideoConsultation';
import StarRating from '../../components/StarRating';
import { useUser } from '../../context/UserContext';

interface DoctorProfileProps {
  params: Promise<{ doctor: string }>;
}

interface Physician {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  education: string;
  experience: string;
  specialties: string[];
  rating?: number;
  reviewCount?: number;
  consultationCount?: number;
  initialConsultation?: number;
}

export default function DoctorProfile({ params }: DoctorProfileProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showVideoConsultation, setShowVideoConsultation] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
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
        <div className="animate-pulse">
        <div className="bg-indigo-700">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
              {formatSlugToTitle(slug)}
            </h1>
          </div>
        </div>
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
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

  const handleStartVideoCall = () => {
    if (!user) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/physicians/${slug}`)}`);
      return;
    }
    setShowVideoConsultation(true);
  };

  const handleBackToProfile = () => {
    setShowVideoConsultation(false);
  };

  // Show video consultation if active
  if (showVideoConsultation && doctorData) {
    return (
      <VideoConsultation
        physician={doctorData}
        onBack={handleBackToProfile}
      />
    );
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          doctorName: doctorData.name,
          doctorSpecialty: doctorData.specialties?.join(', ') || '',
          date: selectedDate,
          time: selectedTime,
          reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book consultation');
      }

      // Show success message and close modal
      setToast({
        message: 'Consultation booking submitted successfully! We will contact you soon.',
        type: 'success'
      });
      setShowBookingModal(false);
      setSelectedDate('');
      setSelectedTime('');
      setReason('');
    } catch (error) {
      console.error('Error booking consultation:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to book consultation. Please try again.',
        type: 'error'
      });
    }
  };

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

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
                <p className="text-gray-60  0">Response Time</p>
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="p-8">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Consult?</h3>
              <p className="text-gray-600 mb-6">Choose how you'd like to connect with Dr. {doctorData.name.split(' ').slice(1).join(' ')} and take the first step towards better health.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleBookConsultation}
                  className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Book Consultation
                </button>
                
                <button
                  onClick={handleStartVideoCall}
                  className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Start Video Call
                </button>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-6 justify-center text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                  <span>In-person consultation available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Instant video consultation</span>
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

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Book Consultation</h3>
            
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                <div className="flex items-center space-x-3">
                  <div className="shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-indigo-600">
                      {(() => {
                        const nameParts = doctorData.name.split(' ');
                        const firstName = nameParts[nameParts.length - 2]; // Second to last (first name)
                        const lastName = nameParts[nameParts.length - 1]; // Last name
                        return `${firstName[0]}${lastName[0]}`;
                      })()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-indigo-900">{doctorData.name}</p>
                    <p className="text-sm text-indigo-700">{doctorData.specialties?.join(', ') || ''}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <select
                  required
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please describe your symptoms or reason for consultation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="cursor-pointer flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Submit Booking
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="cursor-pointer flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}
    </div>
  );
}

