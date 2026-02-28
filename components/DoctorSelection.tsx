'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  is_verified: boolean;
  consultation_count: number;
}

interface DoctorSelectionProps {
  consultationType?: string;
  onDoctorSelected: (doctor: Doctor) => void;
  onBack: () => void;
}

export default function DoctorSelection({ consultationType, onDoctorSelected, onBack }: DoctorSelectionProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [consultationType]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (consultationType) {
        params.append('consultationType', consultationType);
      }
      
      const response = await fetch(`/api/doctors/available?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDoctors(data.doctors || []);
        setFallbackUsed(data.fallbackUsed || false);
        
        if (data.fallbackUsed) {
          console.log('🔄 Using fallback - showing all verified doctors');
        }
      } else {
        throw new Error(data.error || 'Failed to load doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError(error instanceof Error ? error.message : 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleContinue = () => {
    if (selectedDoctor) {
      onDoctorSelected(selectedDoctor);
    }
  };

  const getSpecializationColor = (specialization: string) => {
    const colors: { [key: string]: string } = {
      'General Practice': 'bg-blue-100 text-blue-800',
      'Weight Management': 'bg-green-100 text-green-800',
      'Sports Medicine': 'bg-purple-100 text-purple-800',
      'Sleep Medicine': 'bg-indigo-100 text-indigo-800',
      'Mental Health': 'bg-pink-100 text-pink-800',
      'Dermatology': 'bg-yellow-100 text-yellow-800',
      'Pediatrics': 'bg-cyan-100 text-cyan-800',
    };
    return colors[specialization] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading available doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Doctor</h2>
            <p className="text-gray-600">
              {consultationType 
                ? `Choose a doctor specializing in ${consultationType.replace('-', ' ')}`
                : 'Choose a doctor to review your evaluation'
              }
            </p>
            {fallbackUsed && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  No specialized doctors found - showing all verified doctors
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Doctor List */}
          <div className="space-y-3">
            {doctors.length === 0 ? (
              <div className="text-center py-8">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No doctors available at the moment</p>
              </div>
            ) : (
              doctors.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => handleDoctorSelect(doctor)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedDoctor?.id === doctor.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{doctor.full_name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSpecializationColor(doctor.specialization)}`}>
                            {doctor.specialization}
                          </span>
                          {doctor.is_verified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          )}
                        </div>
                        {doctor.consultation_count > 0 && (
                          <p className="text-sm text-gray-500 mt-1">
                            {doctor.consultation_count} consultations completed
                          </p>
                        )}
                      </div>
                    </div>
                    {selectedDoctor?.id === doctor.id && (
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between space-x-4">
            <button
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedDoctor}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedDoctor
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue with {selectedDoctor?.full_name || 'Selected Doctor'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
