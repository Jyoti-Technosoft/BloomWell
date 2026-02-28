'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalEvaluations: number;
  pendingEvaluations: number;
  todayAppointments: number;
  totalPatients: number;
}

export default function DoctorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvaluations: 0,
    pendingEvaluations: 0,
    todayAppointments: 0,
    totalPatients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced fetch with auth handling
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    // Check if user is authenticated before making request
    if (status === 'unauthenticated') {
      console.log('🔐 User not authenticated, redirecting to login...');
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
      console.log('🔐 Session expired, redirecting to login...');
      
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
    if (status === 'unauthenticated') return; // Will be handled by useAuthenticatedApi
    
    fetchDashboardData();
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard stats with automatic error handling
      const statsResponse = await authenticatedFetch('/api/doctor/dashboard/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error instanceof Error && !error.message.includes('redirecting')) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
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
      className="space-y-8"
    >
      {/* Welcome Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, Dr. {session?.user?.name}
        </h1>
        {/* <p className="text-lg text-gray-600">Here's your practice overview</p> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500">Total Evaluations</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.totalEvaluations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500">Pending Reviews</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.pendingEvaluations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500">Today's Appointments</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500">Total Patients</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.totalPatients}</dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
