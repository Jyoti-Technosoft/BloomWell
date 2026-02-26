'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon,
  UserIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Toast from '../app/components/Toast';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  experienceYears?: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

interface AppointmentBookingProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationId?: string;
  medicineName?: string;
  onSuccess?: (appointment: any) => void;
}

export default function AppointmentBooking({ 
  isOpen, 
  onClose, 
  evaluationId, 
  medicineName,
  onSuccess 
}: AppointmentBookingProps) {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (isOpen && step === 1) {
      fetchDoctors();
    }
  }, [isOpen, step]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // Fallback doctors for now
      setDoctors([
        { id: 'doctor-1', name: 'Dr. Sarah Johnson', email: 'sarah@bloomwell.com', specialization: 'General Practice' },
        { id: 'doctor-2', name: 'Dr. Michael Chen', email: 'michael@bloomwell.com', specialization: 'Internal Medicine' },
      ]);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;

    try {
      setLoading(true);
      // Generate time slots from 9 AM to 5 PM
      const slots: TimeSlot[] = [];
      const startHour = 9;
      const endHour = 17;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push({
            time,
            available: Math.random() > 0.3 // 70% availability for demo
          });
        }
      }
      
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDateSelect = (date: Date) => {
    // Don't allow selecting past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date.getTime() < today.getTime()) return;
    
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (step === 1 && selectedDoctor) {
      setStep(2);
    } else if (step === 2 && selectedDate) {
      setStep(3);
    } else if (step === 3 && selectedTime) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    try {
      setBookingLoading(true);
      
      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes));

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          evaluationId,
          appointmentType,
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: 30,
          notes
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setToast({
          message: 'Appointment booked successfully!',
          type: 'success'
        });
        
        if (onSuccess) {
          onSuccess(data.appointment);
        }
        
        // Reset form
        setStep(1);
        setSelectedDoctor(null);
        setSelectedDate(null);
        setSelectedTime('');
        setNotes('');
        setAppointmentType('consultation');
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to book appointment',
        type: 'error'
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCloseToast = () => {
    if (toast) {
      setToast(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Book Appointment</h2>
                {medicineName && (
                  <p className="text-sm text-gray-600 mt-1">For {medicineName} evaluation</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-2 text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      step >= stepNumber 
                        ? 'border-indigo-600 bg-indigo-600 text-white' 
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}>
                      {stepNumber}
                    </div>
                    {stepNumber < 4 && (
                      <div className={`w-full h-0.5 mx-2 ${
                        step > stepNumber ? 'bg-indigo-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Select Doctor</span>
                <span>Choose Date</span>
                <span>Select Time</span>
                <span>Confirm Details</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Step 1: Select Doctor */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium text-gray-900">Select a Doctor</h3>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {doctors.map((doctor) => (
                        <div
                          key={doctor.id}
                          onClick={() => setSelectedDoctor(doctor)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedDoctor?.id === doctor.id
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{doctor.name}</h4>
                              <p className="text-sm text-gray-600">{doctor.specialization}</p>
                              {doctor.experienceYears && (
                                <p className="text-xs text-gray-500">{doctor.experienceYears} years experience</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Choose Date */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium text-gray-900">Choose a Date</h3>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate || new Date());
                        newDate.setMonth(newDate.getMonth() - 1);
                        setSelectedDate(newDate);
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <h4 className="text-lg font-medium">
                      {selectedDate?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) || 
                       new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate || new Date());
                        newDate.setMonth(newDate.getMonth() + 1);
                        setSelectedDate(newDate);
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
                        {day}
                      </div>
                    ))}
                    {getDaysInMonth(selectedDate || new Date()).map((date, index) => (
                      <div key={index} className="aspect-square">
                        {date && (
                          <button
                            onClick={() => handleDateSelect(date)}
                            disabled={date.getTime() < new Date().setHours(0, 0, 0, 0)}
                            className={`w-full h-full rounded-lg border transition-colors ${
                              selectedDate?.toDateString() === date.toDateString()
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : date.getTime() < new Date().setHours(0, 0, 0, 0)
                                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Select Time */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium text-gray-900">Select a Time</h3>
                  <p className="text-sm text-gray-600">
                    Available times for {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && handleTimeSelect(slot.time)}
                          disabled={!slot.available}
                          className={`p-3 rounded-lg border text-sm transition-colors ${
                            selectedTime === slot.time
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : slot.available
                              ? 'border-gray-300 hover:border-gray-400'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {slot.time}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 4: Confirm Details */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-medium text-gray-900">Confirm Appointment Details</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Doctor:</span>
                        <p className="font-medium">{selectedDoctor?.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Date:</span>
                        <p className="font-medium">{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Time:</span>
                        <p className="font-medium">{selectedTime}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Duration:</span>
                        <p className="font-medium">30 minutes</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Type
                      </label>
                      <select
                        value={appointmentType}
                        onChange={(e) => setAppointmentType(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="consultation">Consultation</option>
                        <option value="followup">Follow-up</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Any specific concerns or requirements..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={step === 1 ? onClose : handleBack}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {step === 1 ? 'Cancel' : 'Back'}
                </button>
                
                {step < 4 ? (
                  <button
                    onClick={handleNext}
                    disabled={
                      (step === 1 && !selectedDoctor) ||
                      (step === 2 && !selectedDate) ||
                      (step === 3 && !selectedTime)
                    }
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleBookAppointment}
                    disabled={bookingLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {bookingLoading ? 'Booking...' : 'Book Appointment'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}
    </AnimatePresence>
  );
}
