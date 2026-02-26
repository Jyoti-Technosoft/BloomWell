'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DoctorLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  // { name: 'Dashboard', href: '/doctor', icon: HomeIcon, current: true },
  { name: 'Evaluations', href: '/doctor/evaluations', icon: DocumentTextIcon, current: false },
  { name: 'Appointments', href: '/doctor/appointments', icon: CalendarIcon, current: false },
  { name: 'Patients', href: '/doctor/patients', icon: UserGroupIcon, current: false },
  { name: 'Schedule', href: '/doctor/schedule', icon: ClockIcon, current: false },
  // { name: 'Settings', href: '/doctor/settings', icon: CogIcon, current: false },
];

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-gray-600/75"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl"
            >
              <div className="flex h-full flex-col">
                {/* Mobile header */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-indigo-600" />
                    <h2 className="ml-3 text-xl font-bold text-gray-900">BloomWell</h2>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md p-2 text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Mobile navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                        pathname === item.href
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {/* Mobile user section */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {session?.user?.name?.charAt(0) || 'D'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{session?.user?.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="mt-3 flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                    Sign out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and mobile menu button */}
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden -m-2.5 p-2.5 text-gray-700 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              
              {/* <div className="flex items-center ml-4 md:ml-0">
                <ClipboardDocumentListIcon className="h-8 w-8 text-indigo-600" />
                <h1 className="ml-3 text-xl font-bold text-gray-900">BloomWell</h1>
              </div> */}
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {/* <div className="hidden sm:flex items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {session?.user?.name?.charAt(0) || 'D'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{session?.user?.role}</p>
                </div>
              </div> */}
              
              {/* <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Sign out</span>
              </button> */}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
