'use client';
import { useState } from 'react';
import { CalendarIcon, UserIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { BookingModalProps, Consultation } from '../lib/types';
import { generateNextSevenDays, generateTimeSlotsForDate, formatDateForDisplay, getRelativeDateDescription } from '../lib/dateUtils';

export default function BookingModal({ isOpen, onClose, physician, onComplete }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState<Partial<Consultation>>({
    physicianId: physician.id,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { title: 'Select Date & Time', icon: CalendarIcon },
    { title: 'Consultation Type', icon: UserIcon },
    { title: 'Medical Information', icon: UserIcon },
    { title: 'Payment & Insurance', icon: CreditCardIcon },
    { title: 'Confirmation', icon: CheckCircleIcon }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      const payload = {
        ...bookingData,
        doctorName: physician.name,
        doctorSpecialty: physician.specialties?.[0] || physician.role,
        consultationFee: physician.initialConsultation
      };
      const response = await fetch('/api/consultations/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to book consultation');
      }

      const result = await response.json();
      onComplete(result);
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      // Handle error - you might want to show a toast notification
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <DateTimeSelection physician={physician} bookingData={bookingData} setBookingData={setBookingData} />;
      case 1:
        return <ConsultationTypeSelection bookingData={bookingData} setBookingData={setBookingData} />;
      case 2:
        return <MedicalInformationForm bookingData={bookingData} setBookingData={setBookingData} />;
      case 3:
        return <PaymentInsuranceForm bookingData={bookingData} setBookingData={setBookingData} physician={physician} />;
      case 4:
        return <ConfirmationStep bookingData={bookingData} physician={physician} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Book Consultation</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs ${
                    isActive 
                      ? 'border-white bg-white text-blue-600' 
                      : isCompleted 
                        ? 'border-green-400 bg-green-400 text-white'
                        : 'border-white/50 text-white/50'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`ml-2 text-xs font-medium ${
                    isActive ? 'text-white' : isCompleted ? 'text-green-200' : 'text-white/50'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-green-400' : 'bg-white/30'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Complete Booking'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function DateTimeSelection({ physician, bookingData, setBookingData }: any) {
  // Generate dynamic dates for next 7 days
  const availableDates = generateNextSevenDays();
  const availableTimeSlots = bookingData.date ? generateTimeSlotsForDate(bookingData.date) : [];

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Select Date & Time</h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Dates</h4>
          <div className="space-y-2">
            {availableDates.map((date: string) => {
              const timeSlotsForDate = generateTimeSlotsForDate(date);
              return (
              <button
                key={date}
                onClick={() => setBookingData({ ...bookingData, date, time: '' })}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  bookingData.date === date
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">{formatDateForDisplay(date)}</div>
                <div className="text-sm text-gray-600">{getRelativeDateDescription(date)} • {timeSlotsForDate.length} slots available</div>
              </button>
            )})}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Times</h4>
          {bookingData.date ? (
            <div className="grid grid-cols-3 gap-2">
              {availableTimeSlots.map((time: string) => (
                <button
                  key={time}
                  onClick={() => setBookingData({ ...bookingData, time })}
                  className={`p-3 rounded-lg border text-sm transition-colors ${
                    bookingData.time === time
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Please select a date first</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ConsultationTypeSelection({ bookingData, setBookingData }: any) {
  const consultationTypes = [
    {
      type: 'video',
      title: 'Video Consultation',
      description: 'Face-to-face video call with the physician',
      features: ['HIPAA-compliant', 'Screen sharing', 'No download required'],
      icon: '📹'
    },
    {
      type: 'phone',
      title: 'Phone Consultation',
      description: 'Voice-only consultation with the physician',
      features: ['Convenient', 'Private', 'No internet required'],
      icon: '📞'
    },
    {
      type: 'in-person',
      title: 'In-Person Visit',
      description: 'Visit the physician at their clinic',
      features: ['Physical examination', 'In-person assessment', 'Immediate care'],
      icon: '🏥'
    }
  ];

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Select Consultation Type</h3>
      
      <div className="space-y-4">
        {consultationTypes.map((type) => (
          <button
            key={type.type}
            onClick={() => setBookingData({ ...bookingData, consultationType: type.type })}
            className={`w-full text-left p-6 rounded-lg border transition-colors ${
              bookingData.consultationType === type.type
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{type.icon}</div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">{type.title}</h4>
                <p className="text-gray-600 mb-3">{type.description}</p>
                <div className="space-y-1">
                  {type.features.map((feature: string) => (
                    <div key={feature} className="flex items-center text-sm text-gray-500">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MedicalInformationForm({ bookingData, setBookingData }: any) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Medical Information</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chief Complaint (Reason for Visit)
          </label>
          <textarea
            value={bookingData.chiefComplaint || ''}
            onChange={(e) => setBookingData({ ...bookingData, chiefComplaint: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Please describe your symptoms or reason for this consultation..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relevant Medical History
          </label>
          <textarea
            value={bookingData.medicalHistory || ''}
            onChange={(e) => setBookingData({ ...bookingData, medicalHistory: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Previous diagnoses, surgeries, chronic conditions..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Medications
          </label>
          <textarea
            value={bookingData.medications || ''}
            onChange={(e) => setBookingData({ ...bookingData, medications: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="List all medications you're currently taking..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allergies
          </label>
          <textarea
            value={bookingData.allergies || ''}
            onChange={(e) => setBookingData({ ...bookingData, allergies: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Medication allergies, food allergies, etc. (Write 'None' if no allergies)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Pharmacy (Optional)
          </label>
          <input
            type="text"
            value={bookingData.preferredPharmacy || ''}
            onChange={(e) => setBookingData({ ...bookingData, preferredPharmacy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Pharmacy name and location"
          />
        </div>
      </div>
    </div>
  );
}

function PaymentInsuranceForm({ bookingData, setBookingData, physician }: any) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Payment & Insurance</h3>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">Consultation Fee</h4>
        <p className="text-2xl font-bold text-blue-900">${physician.initialConsultation}</p>
        <p className="text-blue-700 text-sm">Due at time of booking</p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information (Optional)</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Provider
              </label>
              <input
                type="text"
                value={bookingData.insuranceInfo?.provider || ''}
                onChange={(e) => setBookingData({
                  ...bookingData,
                  insuranceInfo: {
                    ...bookingData.insuranceInfo,
                    provider: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Blue Cross, Aetna"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member ID
              </label>
              <input
                type="text"
                value={bookingData.insuranceInfo?.memberId || ''}
                onChange={(e) => setBookingData({
                  ...bookingData,
                  insuranceInfo: {
                    ...bookingData.insuranceInfo,
                    memberId: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your insurance member ID"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">Payment will be processed securely after booking confirmation.</p>
            <div className="flex items-center mt-2">
              <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Credit/Debit Card, HSA/FSA accepted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationStep({ bookingData, physician }: any) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Confirmation</h3>
      
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Please review your booking details</h4>
          <p className="text-green-700">Once confirmed, you'll receive a confirmation email with all details.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Consultation Details</h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Physician:</dt>
                <dd className="font-medium">{physician.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Date:</dt>
                <dd className="font-medium">{new Date(bookingData.date || '').toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Time:</dt>
                <dd className="font-medium">{bookingData.time}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Type:</dt>
                <dd className="font-medium capitalize">{bookingData.consultationType}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Fee:</dt>
                <dd className="font-medium">${physician.initialConsultation}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Medical Information</h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Chief Complaint:</dt>
                <dd className="text-sm">{bookingData.chiefComplaint || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Medications:</dt>
                <dd className="text-sm">{bookingData.medications || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Allergies:</dt>
                <dd className="text-sm">{bookingData.allergies || 'Not provided'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-900 mb-3">What happens next?</h4>
          <ol className="space-y-2 text-sm text-gray-700">
            <li>1. Click "Complete Booking" to finalize your appointment</li>
            <li>2. Payment will be processed securely</li>
            <li>3. You'll receive a confirmation email with consultation details</li>
            <li>4. For video consultations, you'll receive a secure link 30 minutes before your appointment</li>
            <li>5. The physician will review your information before the consultation</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
