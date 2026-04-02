"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  AcademicCapIcon, 
  ArrowRightIcon,
  CheckCircleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export default function SignUpChoice() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'provider' | 'user' | null>(null);

  const handleProviderClick = () => {
    setSelectedRole('provider');
    setTimeout(() => {
      router.push('/auth/signup/doctor');
    }, 100);
  };

  const handleUserClick = () => {
    setSelectedRole('user');
    setTimeout(() => {
      router.push('/auth/signup/patient');
    }, 100);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-linear-to-r from-blue-500 to-purple-600 rounded-full shadow-lg">
                <HeartIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Join BloomWell
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Choose how you&apos;d like to join our healthcare community
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Healthcare Provider Card */}
            <div
              className={`
                relative bg-white rounded-2xl shadow-lg p-8 cursor-pointer
                transform transition-all duration-300 hover:scale-105
                ${selectedRole === 'provider' 
                  ? 'ring-4 ring-blue-500 ring-opacity-50 border-2 border-blue-500' 
                  : 'border-2 border-gray-200 hover:border-blue-300'
                }
              `}
              onClick={handleProviderClick}
            >
              {selectedRole === 'provider' && (
                <div className="absolute top-4 right-4">
                  <div className="bg-blue-500 rounded-full p-1">
                    <CheckCircleIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`
                    p-4 rounded-full transition-all duration-300
                    ${selectedRole === 'provider' 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200'
                    }
                  `}>
                    <AcademicCapIcon className={`
                      h-8 w-8 transition-all duration-300
                      ${selectedRole === 'provider' 
                        ? 'text-white' 
                        : 'text-gray-600'
                      }
                    `} />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Healthcare Provider
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Licensed medical professionals looking to provide care and connect with patients through our platform
                </p>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                    <span>Professional credential verification</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                    <span>Access to patient management tools</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                    <span>Schedule appointments and consultations</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                    <span>Professional profile and bio</span>
                  </div>
                </div>

                <button className="mt-6 w-full bg-linear-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center group">
                  {selectedRole === 'provider' ? (
                    <span>Redirecting to registration...</span>
                  ) : (
                    <>
                      <span>Register as Provider</span>
                      <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Patient/User Card */}
            <div
              className={`
                relative bg-white rounded-2xl shadow-lg p-8 cursor-pointer
                transform transition-all duration-300 hover:scale-105
                ${selectedRole === 'user' 
                  ? 'ring-4 ring-purple-500 ring-opacity-50 border-2 border-purple-500' 
                  : 'border-2 border-gray-200 hover:border-purple-300'
                }
              `}
              onClick={handleUserClick}
            >
              {selectedRole === 'user' && (
                <div className="absolute top-4 right-4">
                  <div className="bg-purple-500 rounded-full p-1">
                    <CheckCircleIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`
                    p-4 rounded-full transition-all duration-300
                    ${selectedRole === 'user' 
                      ? 'bg-purple-500' 
                      : 'bg-gray-200'
                    }
                  `}>
                    <UserIcon className={`
                      h-8 w-8 transition-all duration-300
                      ${selectedRole === 'user' 
                        ? 'text-white' 
                        : 'text-gray-600'
                      }
                    `} />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Patient
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Individuals seeking healthcare services, appointment booking, and personalized care from qualified providers
                </p>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                    <span>Book appointments with providers</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                    <span>Manage health records</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                    <span>Secure messaging with doctors</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                    <span>Personal health dashboard</span>
                  </div>
                </div>

                <button className="mt-6 w-full bg-linear-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center group">
                  {selectedRole === 'user' ? (
                    <span>Redirecting to registration...</span>
                  ) : (
                    <>
                      <span>Register as Patient</span>
                      <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-12">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link 
                href="/auth/signin" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
