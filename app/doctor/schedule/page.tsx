'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon,
  ClockIcon,
  FunnelIcon,
  UserIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  date: string;
  time: string;
  duration: number;
  type: 'video' | 'in_person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  consultationType?: string;
  doctorName?: string;
  doctorSpecialty?: string;
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

export default function DoctorSchedule() {
  const { status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Enhanced fetch with auth handling
  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      throw new Error('User not authenticated');
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      router.push('/auth/signin');
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }, [status, router]);

  const fetchTimeSlots = useCallback(async () => {
    try {
      // Generate time slots based on selected date and existing appointments
      const baseTimeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
      ];

      const timeSlotsWithAvailability: TimeSlot[] = baseTimeSlots.map(time => {
        // Check if this time slot is booked by any appointment on the selected date
        const isBooked = appointments.some(apt => 
          apt.date === selectedDate && apt.time === time
        );
        
        return {
          date: selectedDate,
          time,
          available: !isBooked
        };
      });

      setTimeSlots(timeSlotsWithAvailability);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  }, [appointments, selectedDate]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated before fetching
      if (status === 'unauthenticated') {
        setLoading(false);
        return;
      }
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 6000)
      );
      
      // Fetch real consultation bookings from doctor appointments API
      const response = await Promise.race([
        authenticatedFetch('/api/doctor/appointments'),
        timeoutPromise
      ]) as Response;
      const data = await response.json();
      
      // Transform consultation bookings to schedule format
      const transformedAppointments = data.consultations.map((consultation: {
        id: string;
        consultation_date: string;
        consultation_time: string;
        patient_name: string;
        patient_email: string;
        status: string;
        reason?: string;
        doctor_name?: string;
        doctor_specialty?: string;
      }) => {
        // Extract date and time from consultation data
        const consultationDate = consultation.consultation_date?.split('T')[0] || new Date().toISOString().split('T')[0];
        const consultationTime = consultation.consultation_time || '10:00';
        
        return {
          id: consultation.id,
          patientName: consultation.patient_name || 'Unknown',
          patientEmail: consultation.patient_email || '',
          date: consultationDate,
          time: consultationTime.split(':')[0] + ':' + (consultationTime.split(':')[1] || '00'),
          duration: 30,
          type: 'in_person' as const, // Default to in-person
          status: consultation.status === 'scheduled' ? 'scheduled' : consultation.status,
          notes: consultation.reason || '',
          consultationType: 'in-person',
          doctorName: consultation.doctor_name,
          doctorSpecialty: consultation.doctor_specialty
        };
      });
      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Only fallback to empty array if it's not an auth error
      if (error instanceof Error && !error.message.includes('redirecting') && !error.message.includes('not authenticated')) {
        setAppointments([]);
      }
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, status]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      setLoading(false);
      return;
    }
    
    fetchAppointments();
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 8000);
    
    return () => clearTimeout(safetyTimeout);
  }, [status, fetchAppointments]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') return;
    
    fetchTimeSlots();
  }, [selectedDate, status, fetchTimeSlots]);

  useEffect(() => {
    // Apply status filter
    if (statusFilter === 'all') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter(apt => apt.status === statusFilter));
    }
  }, [appointments, statusFilter]);

  const getAppointmentsForDate = (date: string) => {
    return filteredAppointments.filter(apt => apt.date === date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleJoinCall = async (appointment: Appointment) => {
    try {
      const response = await authenticatedFetch('/api/consultations/' + appointment.id + '/join-call', {
        method: 'POST',
        body: JSON.stringify({ consultationId: appointment.id })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Navigate to video consultation page with room URL
        router.push(`/video-consultation?room=${encodeURIComponent(data.roomUrl)}&consultationId=${appointment.id}`);
      } else {
        console.error('Failed to join call:', data.error);
        alert('Failed to join call: ' + data.error);
      }
    } catch (error) {
      console.error('Error joining call:', error);
      alert('Error joining call. Please try again.');
    }
  };

  const handleRescheduleClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNewDate(appointment.date);
    setNewTime(appointment.time);
    setShowRescheduleModal(true);
  };

  const handleReschedule = async (appointmentId: string, newDate: string, newTime: string) => {
    try {
      setRescheduleLoading(true);
      
      const response = await authenticatedFetch('/api/consultations/' + appointmentId + '/reschedule', {
        method: 'PUT',
        body: JSON.stringify({ newDate, newTime })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update the appointment in the local state
        setAppointments(prev => prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, date: newDate, time: newTime }
            : apt
        ));
        
        setShowRescheduleModal(false);
        alert('Consultation rescheduled successfully!');
      } else {
        console.error('Failed to reschedule:', data.error);
        alert('Failed to reschedule: ' + data.error);
      }
    } catch (error) {
      console.error('Error rescheduling:', error);
      alert('Error rescheduling. Please try again.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading schedule...</span>
      </div>
    );
  }

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="mt-2 text-gray-600">Manage your appointments and availability</p>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="flex bg-gray-100 rounded-md p-1">
              {(['day', 'week', 'month'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    viewMode === mode
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Appointments</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Slots */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Time Slots
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="p-6 space-y-2 max-h-96 overflow-y-auto">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    slot.available 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center">
                    <ClockIcon className={`h-4 w-4 mr-2 ${
                      slot.available ? 'text-green-600' : 'text-red-600'
                    }`} />
                    <span className="text-sm font-medium">{slot.time}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    slot.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {slot.available ? 'Available' : 'Booked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Appointments
                {statusFilter !== 'all' && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({filteredAppointments.length} filtered)
                  </span>
                )}
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {getAppointmentsForDate(selectedDate).map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900">
                            {appointment.patientName}
                          </h3>
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{appointment.patientEmail}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {appointment.time} ({appointment.duration} min)
                          </div>
                          <div className="flex items-center">
                            {appointment.type === 'video' ? (
                              <VideoCameraIcon className="h-4 w-4 mr-1" />
                            ) : (
                              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                            )}
                            {appointment.type === 'video' ? 'Video Call' : 'In Person'}
                          </div>
                        </div>
                        {appointment.notes && (
                          <p className="mt-2 text-sm text-gray-600">{appointment.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {(appointment.type === 'video') && appointment.status === 'scheduled' && (
                        <button 
                          onClick={() => handleJoinCall(appointment)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Join Call
                        </button>
                      )}
                      {appointment.status === 'scheduled' && (
                        <button 
                          onClick={() => handleRescheduleClick(appointment)}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                          Reschedule
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {getAppointmentsForDate(selectedDate).length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {statusFilter !== 'all' 
                      ? `No ${statusFilter} appointments for this date` 
                      : 'No appointments scheduled for this date'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>

    {/* Reschedule Modal */}
    {showRescheduleModal && (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Reschedule Consultation</h3>
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Patient:</strong> {selectedAppointment.patientName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Current:</strong> {selectedAppointment.date} at {selectedAppointment.time}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Time
                </label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a time</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="09:30">09:30 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="14:30">02:30 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="15:30">03:30 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="16:30">04:30 PM</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={rescheduleLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReschedule(selectedAppointment.id, newDate, newTime)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  disabled={rescheduleLoading || !newDate || !newTime}
                >
                  {rescheduleLoading ? 'Rescheduling...' : 'Reschedule'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}
