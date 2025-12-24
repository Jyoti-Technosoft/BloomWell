'use client';

import React, { useState } from 'react';
import { physicians, Physician } from '../data/physicians';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '../components/Toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function BookConsultation() {
  const [selectedPhysician, setSelectedPhysician] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const { user } = useUser();
  const router = useRouter();

  const handleCloseToast = () => {
    setToast(null);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/auth/signin?callbackUrl=/book-consultation');
      return;
    }
    
    try {
      const selectedDoctor = physicians.find((p: Physician) => p.name === selectedPhysician);
      
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorName: selectedPhysician,
          doctorSpecialty: selectedDoctor?.specialty,
          date: selectedDate,
          time: selectedTime,
          reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book consultation');
      }

      // Show success message and reset form
      setToast({
        message: 'Consultation booking submitted successfully! We will contact you soon.',
        type: 'success'
      });
      setSelectedPhysician('');
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

  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
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
          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Your Appointment</h2>
              
              {!user ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                  <p className="text-yellow-800">
                    Please <Link href="/auth/signin?callbackUrl=/book-consultation" className="font-medium underline">sign in</Link> to book a consultation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitBooking} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Physician *</label>
                    <select
                      required
                      value={selectedPhysician}
                      onChange={(e) => setSelectedPhysician(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Choose a physician</option>
                      {physicians.map((physician: Physician) => (
                        <option key={physician.name} value={physician.name}>
                          {physician.name} - {physician.specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                    <input
                      type="date"
                      required
                      min={today}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                    <select
                      required
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit *</label>
                    <textarea
                      required
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please describe your symptoms or reason for consultation..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium"
                    >
                      Submit Booking
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPhysician('');
                        setSelectedDate('');
                        setSelectedTime('');
                        setReason('');
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Physicians Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Our Physicians</h3>
                <div className="space-y-4">
                  {physicians.map((physician: Physician) => (
                    <div 
                      key={physician.name}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPhysician === physician.name 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPhysician(physician.name)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
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
                          <p className="text-sm text-indigo-600 font-medium">{physician.specialty}</p>
                          <p className="text-sm text-gray-600 mt-1">{physician.education}</p>
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{physician.bio}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Information Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">What to Expect</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Initial consultation typically lasts 30-45 minutes
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Please arrive 10 minutes early for paperwork
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Bring your insurance card and photo ID
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  List of current medications and allergies
                </li>
              </ul>
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
    </div>
  );
}
