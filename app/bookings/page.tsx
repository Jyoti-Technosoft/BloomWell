'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  VideoCameraIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

interface Booking {
  id: string;
  type: 'consultation' | 'evaluation' | 'follow-up';
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  date: string;
  time: string;
  duration: string;
  physician: {
    name: string;
    specialty: string;
    image?: string;
  };
  location: {
    type: 'in-person' | 'video';
    address?: string;
    meetingLink?: string;
  };
  notes?: string;
  createdAt: string;
}

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (session?.user) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/user/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/user/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBookings(); // Refresh bookings
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const handleRescheduleBooking = async (bookingId: string) => {
    // Reschedule functionality removed
    console.log('Reschedule not available for booking:', bookingId);
  };

  // Count bookings by status
  const bookingCounts = {
    all: bookings.length,
    upcoming: bookings.filter(b => b.status === 'scheduled' || b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  const filteredBookings = bookings.filter(booking => {
    switch (filter) {
      case 'upcoming':
        return booking.status === 'scheduled' || booking.status === 'pending';
      case 'completed':
        return booking.status === 'completed';
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'scheduled':
        return <CalendarIcon className="h-5 w-5" />;
      case 'pending':
        return <CalendarIcon className="h-5 w-5" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <CalendarIcon className="h-5 w-5" />;
    }
  };

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Appointment Scheduled';
      case 'pending':
        return 'Pending Confirmation';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getStatusDescription = (status: Booking['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Your appointment is confirmed and scheduled.';
      case 'pending':
        return 'Your booking is pending confirmation. We will contact you soon.';
      case 'completed':
        return 'Your appointment has been completed successfully.';
      case 'cancelled':
        return 'This appointment has been cancelled.';
      default:
        return 'Status unknown.';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-8">You need to be signed in to view your bookings.</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Booking Information</h1>
          <p className="mt-2 text-gray-600">Manage your women's health appointments and consultations</p>
        </motion.div>

        {/* Booking Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-indigo-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{bookingCounts.all}</p>
                  <p className="text-sm text-gray-600">Total Appointments</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{bookingCounts.upcoming}</p>
                  <p className="text-sm text-gray-600">Upcoming</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{bookingCounts.completed}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <div className="flex items-center">
                <XCircleIcon className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{bookingCounts.cancelled}</p>
                  <p className="text-sm text-gray-600">Cancelled</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize flex items-center space-x-2 ${
                    filter === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    filter === tab
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {bookingCounts[tab]}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12"
          >
            <div className="bg-white rounded-lg shadow p-8">
              {filter === 'all' && (
                <>
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't booked any appointments yet. Schedule your first consultation to get started with your women's health journey.
                  </p>
                </>
              )}
              {filter === 'upcoming' && (
                <>
                  <CalendarIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Appointments</h3>
                  <p className="text-gray-600 mb-6">
                    You don't have any scheduled appointments. Book a new appointment to continue your care.
                  </p>
                </>
              )}
              {filter === 'completed' && (
                <>
                  <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Appointments</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't completed any appointments yet. Your scheduled appointments will appear here once completed.
                  </p>
                </>
              )}
              {filter === 'cancelled' && (
                <>
                  <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Cancelled Appointments</h3>
                  <p className="text-gray-600 mb-6">
                    You don't have any cancelled appointments. That's great! Keep up with your scheduled appointments.
                  </p>
                </>
              )}
              <Link
                href="/book-consultation"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Book Appointment
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Status Badge */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-2">{getStatusText(booking.status)}</span>
                        </div>
                        <span className="text-sm text-gray-500 capitalize">{booking.type}</span>
                      </div>

                      {/* Status Description */}
                      <div className={`mb-4 p-3 rounded-lg ${
                        booking.status === 'scheduled' ? 'bg-blue-50 border border-blue-200' :
                        booking.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                        booking.status === 'completed' ? 'bg-green-50 border border-green-200' :
                        booking.status === 'cancelled' ? 'bg-red-50 border border-red-200' :
                        'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <p className="text-sm text-gray-700">{getStatusDescription(booking.status)}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {new Date(booking.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {booking.time} ({booking.duration})
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                            Dr. {booking.physician.name} - {booking.physician.specialty}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            {booking.location.type === 'video' ? (
                              <VideoCameraIcon className="h-4 w-4 mr-2 text-gray-400" />
                            ) : (
                              <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-400" />
                            )}
                            {booking.location.type === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                          </div>
                          {booking.location.type === 'in-person' && booking.location.address && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                              {booking.location.address}
                            </div>
                          )}
                          {booking.location.type === 'video' && booking.location.meetingLink && (
                            <div className="text-sm text-gray-600">
                              <a 
                                href={booking.location.meetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-700 underline font-medium"
                              >
                                Join Video Call
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {booking.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="ml-4 flex flex-col space-y-2">
                      {(booking.status === 'scheduled' || booking.status === 'pending') && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                      )}
                      {booking.status === 'completed' && (
                        <button
                          className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 transition-colors"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Book Follow-up
                        </button>
                      )}
                      {booking.status === 'cancelled' && (
                        <Link
                          href="/book-consultation"
                          className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 transition-colors"
                        >
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Book New
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Book New Appointment CTA */}
        {filter === 'upcoming' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <Link
              href="/book-consultation"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Book New Appointment
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
