'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import LogoutButton from '../auth/LogoutButton';

interface NavItem {
  name: string;
  href: string;
  dropdown?: Array<{
    name: string;
    href: string;
    specialty?: string;
    image?: string;
  }>;
}

const navItems: NavItem[] = [
  {
    name: 'Women\'s Health',
    href: '/treatments',
    dropdown: [
      { name: 'Semaglutide', href: '/semaglutide' },
      { name: 'Tirzepatide', href: '/tirzepatide' },
      { name: 'Oral ED Treatments', href: '/oral-ed-treatments' },
      { name: 'Testosterone Therapy', href: '/testosterone-therapy' },
      { name: 'Erectile Dysfunction', href: '/erectile-dysfunction' },
      { name: 'Injectable Treatments', href: '/injectable-treatments' }
    ],
  },
  { 
    name: 'Women\'s Health Experts',
    href: '/physicians'
  },
  { name: 'About', href: '/about' },
  { name: 'Reviews', href: '/reviews' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { data: session, status } = useSession();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleDropdownToggle = (itemName: string) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.profile-dropdown')) {
          setProfileDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  return (
    <header className="fixed w-full bg-white z-50 shadow-sm">
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="shrink-0">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  <img
                    src="/bloomwell-logo.png"
                    alt="BloomWell - Women's Health"
                    height="200px"
                    width="200px"
                  />
                </Link>
              </div>
            </div>

            <div className="hidden md:ml-10 md:flex md:space-x-8 items-center">
              {navItems.map((item) => (
                <div key={item.name} className="relative">
                  {item.dropdown ? (
                    <div
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      onMouseLeave={() => setOpenDropdown(null)}
                      className="relative"
                    >
                      <button className="flex items-center text-gray-700 hover:text-gray-900 px-1 py-2 text-sm font-medium">
                        {item.name}
                        <ChevronDownIcon
                          className={`ml-1 h-4 w-4 transition-transform ${
                            openDropdown === item.name ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {openDropdown === item.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className={`absolute left-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${
                              item.name === 'Physicians' ? 'w-80 p-2' : 'w-56'
                            }`}
                          >
                            <div className="py-1">
                              {item.dropdown?.map((subItem) => (
                                <div key={subItem.name}>
                                  {item.name === 'Physicians' ? (
                                    <Link
                                      href={subItem.href}
                                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md group"
                                    >
                                      <div className="shrink-0 h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                                        {'image' in subItem && subItem.image ? (
                                          <img
                                            src={subItem.image}
                                            alt={subItem.name}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                                            <UserIcon className="h-5 w-5 text-gray-500" />
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900 group-hover:text-indigo-600">
                                          {subItem.name}
                                        </p>
                                        {'specialty' in subItem && subItem.specialty && (
                                          <p className="text-xs text-gray-500">{subItem.specialty}</p>
                                        )}
                                      </div>
                                    </Link>
                                  ) : (
                                    <Link
                                      href={subItem.href}
                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      {subItem.name}
                                    </Link>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-gray-900 px-1 py-2 text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
            {status === 'authenticated' ? (
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {session.user?.name}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user?.name || 'User'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-5 w-5 text-indigo-600" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    >
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/bookings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Booking Info
                        </Link>
                        <div className="border-t border-gray-100"></div>
                        <div 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <LogoutButton />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
              <Link
                href="/auth/signin"
                className="text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
              </>
            )}
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden"
            >
              <div className="pt-2 pb-3 space-y-1 bg-white">
                {/* User section for mobile */}
                {status === 'authenticated' && (
                  <div className="border-b border-gray-200 pb-3 mb-3">
                    <div className="px-4 py-3">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-base font-medium text-gray-900">
                            Welcome, {session.user.name}
                          </p>
                          <p className="text-sm text-gray-500">{session.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <LogoutButton />
                      </div>
                    </div>
                  </div>
                )}

                {navItems.map((item) => (
                  <div key={item.name}>
                    {item.dropdown ? (
                      <div>
                        <button
                          onClick={() => handleDropdownToggle(item.name)}
                          className="w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 flex justify-between items-center"
                        >
                          {item.name}
                          <ChevronDownIcon
                            className={`h-5 w-5 transition-transform ${
                              openDropdown === item.name ? 'transform rotate-180' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {openDropdown === item.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="pl-6 bg-gray-50"
                            >
                              {item.dropdown.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  onClick={closeMobileMenu}
                                  className="block px-4 py-3 text-base text-gray-600 hover:bg-gray-100"
                                >
                                  {item.name === 'Physicians' ? (
                                    <div className="flex items-center">
                                      <div className="shrink-0 h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                                        {subItem.image ? (
                                          <img
                                            src={subItem.image}
                                            alt={subItem.name}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                                            <UserIcon className="h-5 w-5 text-gray-500" />
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{subItem.name}</p>
                                        <p className="text-xs text-gray-500">{subItem.specialty}</p>
                                      </div>
                                    </div>
                                  ) : (
                                    subItem.name
                                  )}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}

                {/* Auth links for mobile when not logged in */}
                {status === 'authenticated' && (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <Link
                      href="/auth/signin"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={closeMobileMenu}
                      className="block mx-4 mt-3 text-center bg-indigo-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}