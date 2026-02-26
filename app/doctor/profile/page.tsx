"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import Toast from '../../components/Toast';

interface DoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpiryDate: string;
  npiNumber?: string;
  deaNumber?: string;
  professionalBio?: string;
  consultationFee?: number;
  languages: string[];
  hospitalAffiliations: string[];
  isVerified: boolean;
  verificationStatus: string;
  verificationDate?: string;
  rejectionReason?: string;
}

export default function DoctorProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [editForm, setEditForm] = useState<Partial<DoctorProfile>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/doctor/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.doctorProfileId) {
      fetchProfile();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/doctor/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditForm(data.profile);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (error) {
      setToast({
        message: 'Failed to load profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditForm(profile || {});
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm(profile || {});
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditing(false);
        setToast({
          message: 'Profile updated successfully',
          type: 'success'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Failed to update profile',
        type: 'error'
      });
    }
  };

  const handleInputChange = (field: keyof DoctorProfile, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Profile not found</h3>
        <p className="mt-1 text-sm text-gray-500">Unable to load your profile information.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
            <p className="mt-2 text-gray-600">Manage your professional information and credentials</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Verification Status */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              profile.isVerified 
                ? 'bg-green-100 text-green-800' 
                : profile.verificationStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}>
              {profile.isVerified ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Verified
                </>
              ) : profile.verificationStatus === 'pending' ? (
                <>
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  Pending Verification
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  Verification Failed
                </>
              )}
            </div>

            {/* Edit Button */}
            {!editing && (
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verification Alert */}
      {!profile.isVerified && (
        <div className={`mb-6 rounded-lg p-4 ${
          profile.verificationStatus === 'pending' 
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <div className="shrink-0">
              <ExclamationTriangleIcon className={`h-5 w-5 ${
                profile.verificationStatus === 'pending' ? 'text-yellow-400' : 'text-red-400'
              }`} />
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                profile.verificationStatus === 'pending' ? 'text-yellow-800' : 'text-red-800'
              }`}>
                {profile.verificationStatus === 'pending' ? 'Verification Pending' : 'Verification Failed'}
              </h3>
              <div className={`mt-2 text-sm ${
                profile.verificationStatus === 'pending' ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {profile.verificationStatus === 'pending' 
                  ? 'Your professional credentials are currently under review. You will be notified once verification is complete.'
                  : `Verification failed: ${profile.rejectionReason || 'Unknown error'}`
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Professional Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.specialization}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.licenseNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License State</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.licenseState}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Expiry</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(profile.licenseExpiryDate).toLocaleDateString()}
                  </p>
                </div>
                {profile.npiNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">NPI Number</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.npiNumber}</p>
                  </div>
                )}
                {profile.deaNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">DEA Number</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.deaNumber}</p>
                  </div>
                )}
                {profile.consultationFee && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Consultation Fee</label>
                    <p className="mt-1 text-sm text-gray-900">${profile.consultationFee}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Professional Bio */}
          {profile.professionalBio && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Bio</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.professionalBio}</p>
            </div>
          )}

          {/* Languages */}
          {profile.languages && profile.languages.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Languages Spoken</h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((language, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hospital Affiliations */}
          {profile.hospitalAffiliations && profile.hospitalAffiliations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hospital Affiliations</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                {profile.hospitalAffiliations.map((hospital, index) => (
                  <li key={index} className="flex items-center">
                    <span className="h-2 w-2 bg-indigo-600 rounded-full mr-2"></span>
                    {hospital}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

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
