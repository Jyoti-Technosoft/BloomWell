'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome back, {session.user?.name || 'User'}!</h1>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {[
                  {
                    title: 'Schedule Appointment',
                    description: 'Book your next consultation with a healthcare provider',
                    icon: '📅',
                    href: '/appointments/new',
                    buttonText: 'Schedule Now'
                  },
                  {
                    title: 'View Treatment Plan',
                    description: 'Review your personalized weight management plan',
                    icon: '📋',
                    href: '/treatment-plan',
                    buttonText: 'View Plan'
                  },
                  {
                    title: 'Track Progress',
                    description: 'Monitor your weight loss journey and health metrics',
                    icon: '📊',
                    href: '/progress',
                    buttonText: 'View Progress'
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                          <span className="text-2xl">{item.icon}</span>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <a
                          href={item.href}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {item.buttonText}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Your recent interactions and updates</p>
                </div>
                <div className="bg-white px-4 py-5 sm:px-6">
                  <div className="border-b border-gray-200">
                    <ul className="divide-y divide-gray-200">
                      {[
                        { id: 1, title: 'Appointment scheduled', description: 'Your consultation is scheduled for tomorrow at 2:00 PM', date: '2 hours ago' },
                        { id: 2, title: 'Prescription refilled', description: 'Your medication has been refilled and will arrive in 3-5 business days', date: '1 day ago' },
                        { id: 3, title: 'Wellness check-in', description: 'Complete your weekly check-in to track your progress', date: '3 days ago' },
                      ].map((activity) => (
                        <li key={activity.id} className="py-4">
                          <div className="flex space-x-3">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">{activity.title}</h3>
                                <p className="text-sm text-gray-500">{activity.date}</p>
                              </div>
                              <p className="text-sm text-gray-500">{activity.description}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 text-right sm:px-6">
                    <a
                      href="/activity"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      View all activity<span aria-hidden="true"> &rarr;</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Your Progress</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Track your weight loss journey</p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Weight tracking chart will be displayed here</p>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {[
                      { name: 'Starting Weight', value: '185 lbs' },
                      { name: 'Current Weight', value: '175 lbs' },
                      { name: 'Goal Weight', value: '150 lbs' },
                    ].map((stat, statIdx) => (
                      <div key={statIdx} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
