'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Toast from '../../components/Toast';

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  appointmentType: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  scheduledAt: string;
  durationMinutes: number;
  notes?: string;
  doctorName: string;
  doctorSpecialty: string;
  consultationType: string;
  medicalHistory?: string;
  medications?: string;
  allergies?: string;
  preferredPharmacy?: string;
  insuranceProvider?: string;
  consultationFee?: number;
  prescription?: string;
  doctorNotes?: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
}

interface AppointmentUpdate {
  status?: string;
  prescription?: string;
  doctorNotes?: string;
  meetingLink?: string;
  cancellationReason?: string;
}

export default function DoctorAppointments() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('upcoming');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [updateForm, setUpdateForm] = useState<AppointmentUpdate>({
    status: '',
    prescription: '',
    doctorNotes: '',
    meetingLink: '',
    cancellationReason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Enhanced fetch with auth handling
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    // Check if user is authenticated before making request
    if (status === 'unauthenticated') {
      const currentPath = window.location.pathname;
      const callbackUrl = encodeURIComponent(currentPath);
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
      throw new Error('User not authenticated');
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Ensure cookies are sent
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to login page with callback
      const currentPath = window.location.pathname;
      const callbackUrl = encodeURIComponent(currentPath);
      window.location.href = `/auth/signin?callbackUrl=${callbackUrl}`;
      
      throw new Error('Session expired - redirecting to login');
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Access denied');
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') return; // Will be handled by authentication guard
    
    fetchAppointments();
  }, [filterStatus, filterDate, status]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch from doctor appointments API (includes consultation bookings)
      const response = await authenticatedFetch('/api/doctor/appointments');
      const data = await response.json();
      
      // Transform consultation bookings to match Appointment interface
      const transformedAppointments = data.consultations.map((consultation: any) => {
        
        // Properly format the scheduledAt date
        let scheduledAt: string;
        
        try {
          // Handle different date formats from the database
          const consultationDate = consultation.consultation_date;
          const consultationTime = consultation.consultation_time;
          
          // If we have both date and time, combine them properly
          if (consultationDate && consultationTime) {
            // Extract date part (in case it has time component)
            const datePart = consultationDate.split('T')[0];
            // Extract time part and ensure it has proper format
            let timePart = consultationTime.split('T')[1] || consultationTime;
            
            // Ensure time has seconds
            if (timePart.split(':').length === 2) {
              timePart = timePart + ':00';
            }
            
            // Create proper ISO datetime string with Z for UTC
            scheduledAt = `${datePart}T${timePart}Z`;
          } else if (consultationDate) {
            // Use only date if time is missing - add noon time to avoid timezone issues
            scheduledAt = `${consultationDate}T12:00:00Z`;
          } else {
            // Fallback to created_at if consultation_date is missing
            scheduledAt = consultation.created_at;
          }
          
          // Validate the date
          const testDate = new Date(scheduledAt);
          if (isNaN(testDate.getTime())) {
            console.warn('Invalid date detected, using fallback:', scheduledAt);
            scheduledAt = consultation.created_at;
          }
          
        } catch (error) {
          console.warn('Error formatting date, using fallback:', error);
          scheduledAt = consultation.created_at;
        }

        return {
          id: consultation.id,
          patientName: consultation.patient_name || 'Unknown',
          patientEmail: consultation.patient_email || '',
          patientPhone: '',
          appointmentType: 'Consultation',
          status: consultation.status === 'scheduled' ? 'pending' : consultation.status,
          scheduledAt: scheduledAt,
          durationMinutes: 30,
          notes: consultation.reason,
          doctorName: consultation.doctor_name,
          doctorSpecialty: consultation.doctor_specialty,
          consultationType: 'in-person',
          medicalHistory: '',
          medications: '',
          allergies: '',
          preferredPharmacy: '',
          insuranceProvider: '',
          consultationFee: 150,
          prescription: '',
          doctorNotes: '',
          meetingLink: '',
          createdAt: consultation.created_at,
          updatedAt: consultation.created_at,
          cancellationReason: ''
        };
      });
      
      setAppointments(transformedAppointments);
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (error instanceof Error && !error.message.includes('redirecting')) {
        setError(error.message);
        setToast({
          message: error.message || 'Failed to fetch appointments',
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'no_show': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-5 w-5" />;
      case 'cancelled': return <XMarkIcon className="h-5 w-5" />;
      case 'confirmed': return <CheckCircleIcon className="h-5 w-5" />;
      case 'pending': return <ClockIcon className="h-5 w-5" />;
      case 'no_show': return <ExclamationTriangleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleUpdateAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setUpdateForm({
      status: appointment.status,
      prescription: appointment.prescription || '',
      doctorNotes: appointment.doctorNotes || '',
      meetingLink: appointment.meetingLink || '',
      cancellationReason: ''
    });
    setShowUpdateModal(true);
  };

  const handleSubmitUpdate = async () => {
    if (!selectedAppointment) return;

    try {
      setSubmitting(true);
      const response = await authenticatedFetch(`/api/user/bookings`, {
        method: 'PUT',
        body: JSON.stringify({
          bookingId: selectedAppointment.id,
          ...updateForm
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setToast({
          message: data.message || 'Appointment updated successfully',
          type: 'success'
        });
        setShowUpdateModal(false);
        setSelectedAppointment(null);
        
        // Refresh appointments list to show updated status
        await fetchAppointments();
      } else {
        throw new Error('Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to update appointment',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      // Handle date string to avoid timezone issues
      let date: Date;
      
      if (dateTimeString.includes('T')) {
        // It's an ISO string, create date properly
        if (dateTimeString.endsWith('Z')) {
          date = new Date(dateTimeString);
        } else {
          // Add Z to treat as UTC to avoid local timezone conversion
          date = new Date(dateTimeString + 'Z');
        }
      } else {
        // It's a date string, create date at noon UTC to avoid timezone issues
        date = new Date(dateTimeString + 'T12:00:00Z');
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in formatDateTime:', dateTimeString);
        return {
          date: 'Invalid Date',
          time: 'Invalid Time',
          day: 'Invalid Day'
        };
      }
      
      const result = {
        date: date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'numeric', 
          day: 'numeric',
          timeZone: 'UTC' // Use UTC to avoid timezone shifts
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'UTC'
        }),
        day: date.toLocaleDateString('en-US', { 
          weekday: 'long',
          timeZone: 'UTC'
        })
      };
      
      return result;
    } catch (error) {
      console.error('Error in formatDateTime:', error);
      return {
        date: 'Invalid Date',
        time: 'Invalid Time',
        day: 'Invalid Day'
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading appointments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Appointments</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage your patient appointments and consultations</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="upcoming">Upcoming</option>
              <option value="today">Today</option>
              <option value="all">All</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {appointments.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {appointments.map((appointment) => {
              const { date, time, day } = formatDateTime(appointment.scheduledAt);
              return (
                <motion.li
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {appointment.patientName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.appointmentType} • {day}, {date} at {time}
                            </p>
                            {appointment.consultationType && (
                              <p className="text-xs text-gray-400">
                                Type: {appointment.consultationType}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {appointment.durationMinutes} min
                          </span>
                          {appointment.patientPhone && (
                            <span>{appointment.patientPhone}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {appointment.meetingLink && (
                          <button
                            onClick={() => window.open(appointment.meetingLink, '_blank')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-green-600 hover:bg-green-700"
                          >
                            <VideoCameraIcon className="h-4 w-4 mr-1" />
                            Join Call
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateAppointment(appointment)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleViewDetails(appointment)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterDate === 'upcoming' ? 'No upcoming appointments scheduled.' : 
               filterDate === 'today' ? 'No appointments scheduled for today.' :
               'No appointments found for the selected filters.'}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetailsModal(false)} />
            
            <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="rounded-md p-2 text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="text-gray-900 ml-2">{selectedAppointment.patientName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="text-gray-900 ml-2">{selectedAppointment.patientEmail}</span>
                      </div>
                      {selectedAppointment.patientPhone && (
                        <div>
                          <span className="font-medium text-gray-700">Phone:</span>
                          <span className="text-gray-900 ml-2">{selectedAppointment.patientPhone}</span>
                        </div>
                      )}
                      {selectedAppointment.consultationType && (
                        <div>
                          <span className="font-medium text-gray-700">Type:</span>
                          <span className="text-gray-900 ml-2">{selectedAppointment.consultationType}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Appointment Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Appointment Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="text-gray-900 ml-2">{selectedAppointment.appointmentType}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${getStatusColor(selectedAppointment.status)}`}>
                          {getStatusIcon(selectedAppointment.status)}
                          <span className="ml-1">{selectedAppointment.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Date:</span>
                        <span className="text-gray-900 ml-2">{formatDateTime(selectedAppointment.scheduledAt).date}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Time:</span>
                        <span className="text-gray-900 ml-2">{formatDateTime(selectedAppointment.scheduledAt).time}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Duration:</span>
                        <span className="text-gray-900 ml-2">{selectedAppointment.durationMinutes} minutes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h3>
                  
                  {selectedAppointment.notes && (
                    <div>
                      <span className="font-medium text-gray-700">Patient Notes:</span>
                      <p className="text-gray-900 mt-1">{selectedAppointment.notes}</p>
                    </div>
                  )}
                  
                  {selectedAppointment.doctorNotes && (
                    <div>
                      <span className="font-medium text-gray-700">Doctor Notes:</span>
                      <p className="text-gray-900 mt-1">{selectedAppointment.doctorNotes}</p>
                    </div>
                  )}
                  
                  {selectedAppointment.prescription && (
                    <div>
                      <span className="font-medium text-gray-700">Prescription:</span>
                      <p className="text-gray-900 mt-1">{selectedAppointment.prescription}</p>
                    </div>
                  )}
                  
                  {selectedAppointment.meetingLink && (
                    <div>
                      <span className="font-medium text-gray-700">Video Call Link:</span>
                      <a 
                        href={selectedAppointment.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 mt-1 block"
                      >
                        {selectedAppointment.meetingLink}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleUpdateAppointment(selectedAppointment);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Update Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowUpdateModal(false)} />
            
            <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900">Update Appointment</h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="rounded-md p-2 text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                    </select>
                  </div>

                  {updateForm.status === 'cancelled' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cancellation Reason
                      </label>
                      <textarea
                        value={updateForm.cancellationReason}
                        onChange={(e) => setUpdateForm({ ...updateForm, cancellationReason: e.target.value })}
                        rows={3}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Reason for cancellation..."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doctor Notes
                    </label>
                    <textarea
                      value={updateForm.doctorNotes}
                      onChange={(e) => setUpdateForm({ ...updateForm, doctorNotes: e.target.value })}
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Add notes about the appointment..."
                    />
                  </div>

                  {updateForm.status === 'completed' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prescription
                      </label>
                      <textarea
                        value={updateForm.prescription}
                        onChange={(e) => setUpdateForm({ ...updateForm, prescription: e.target.value })}
                        rows={3}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter prescription details..."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video Call Link (optional)
                    </label>
                    <input
                      type="url"
                      value={updateForm.meetingLink}
                      onChange={(e) => setUpdateForm({ ...updateForm, meetingLink: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="https://meet.jit.si/room-name"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitUpdate}
                    disabled={submitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? 'Updating...' : 'Update Appointment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}
    </motion.div>
  );
}
