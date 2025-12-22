'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navItems = [
  {
    name: 'Treatments',
    href: '/treatments',
    dropdown: [
      { name: 'Semaglutide', href: '/semaglutide' },
      { name: 'Tirzepatide', href: '/tirzepatide' },
      { name: 'Oral ED Treatments', href: '/oral-ed-treatments' },
      { name: 'Testosterone Therapy', href: '/testosterone-therapy' },
      { name: 'Erectile Dysfunction', href: '/erectile-dysfunction' },
      { name: 'INJECTABLE', href: '/injectable' }
    ],
  },
  { name: 'About', href: '/about' },
  { name: 'Reviews', href: '/reviews' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDropdownToggle = (itemName: string) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

  return (
    <header className="fixed w-full bg-white z-50 shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-emerald-600 text-white text-center text-sm py-2 px-4 w-full">
        NEW YEAR, NEW YOU: NEW PATIENTS SAVE ON COMPOUNDED SEMAGLUTIDE AND ORAL ED TREATMENTS
      </div>

      {/* Main Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left side - Logo and Desktop Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  BloomWell
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-10 md:flex md:space-x-8">
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
                              className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                            >
                              <div className="py-1">
                                {item.dropdown.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    {subItem.name}
                                  </Link>
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
            </div>

            {/* Right side - Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 text-sm font-medium hidden md:block"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
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

        {/* Mobile menu */}
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
                {navItems.map((item) => (
                  <div key={item.name} className="border-b border-gray-100">
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
                                  className="block px-4 py-3 text-base text-gray-600 hover:bg-gray-100"
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
                <div className="pt-2 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-4 py-2">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                    <Link
                      href="/login"
                      className="ml-3 text-base font-medium text-gray-700 hover:text-gray-900"
                    >
                      Log in
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}