'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  FunnelIcon,
  UserIcon,
  VideoCameraIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';

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
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

export default function DoctorSchedule() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchAppointments();
    fetchTimeSlots();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          patientName: 'Maria Garcia',
          patientEmail: 'maria@gmail.com',
          date: '2025-02-27',
          time: '09:00',
          duration: 30,
          type: 'video',
          status: 'scheduled',
          notes: 'Follow-up consultation'
        },
        {
          id: '2',
          patientName: 'Sarah Johnson',
          patientEmail: 'sarah.j@gmail.com',
          date: '2025-02-27',
          time: '10:30',
          duration: 45,
          type: 'in_person',
          status: 'scheduled',
          notes: 'Initial consultation'
        },
        {
          id: '3',
          patientName: 'Emily Rodriguez',
          patientEmail: 'emily.r@gmail.com',
          date: '2025-02-28',
          time: '14:00',
          duration: 30,
          type: 'video',
          status: 'completed'
        }
      ];
      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      // Mock time slots
      const mockTimeSlots: TimeSlot[] = [
        { date: selectedDate, time: '09:00', available: false },
        { date: selectedDate, time: '09:30', available: true },
        { date: selectedDate, time: '10:00', available: true },
        { date: selectedDate, time: '10:30', available: false },
        { date: selectedDate, time: '11:00', available: true },
        { date: selectedDate, time: '11:30', available: true },
        { date: selectedDate, time: '14:00', available: true },
        { date: selectedDate, time: '14:30', available: true },
        { date: selectedDate, time: '15:00', available: false },
        { date: selectedDate, time: '15:30', available: true },
      ];
      setTimeSlots(mockTimeSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(apt => apt.date === date);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading schedule...</span>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="mt-2 text-gray-600">Manage your appointments and availability</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Time Slot
        </button>
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
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
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
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {getAppointmentsForDate(selectedDate).map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
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
                      <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        Join Call
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {getAppointmentsForDate(selectedDate).length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No appointments scheduled for this date
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
