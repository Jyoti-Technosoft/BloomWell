'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface IdentityVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (ssnLast4: string) => void;
}

const IdentityVerification: React.FC<IdentityVerificationProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [lastFourSSN, setLastFourSSN] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lastFourSSN.length !== 4) {
      setError('Please enter exactly 4 digits');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Simulate API call for verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onComplete(lastFourSSN);
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setLastFourSSN(value);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Identity Verification</h2>
            <p className="text-gray-600">
              Help us verify your identity so a doctor can legally prescribe you medication
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Secure & Encrypted</h3>
                <p className="text-sm text-blue-700">
                  Your information is protected with bank-level encryption and is only used for verification purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last 4 digits of Social Security Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={lastFourSSN}
                  onChange={handleInputChange}
                  placeholder="****"
                  maxLength={4}
                  className="w-full px-4 py-3 text-lg text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">***-</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Only the last 4 digits are required for verification
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 mr-3 shrink-0" />
                <div>
                  <h3 className="font-medium text-green-900 mb-1">Why we need this</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Required by law for prescription medications</li>
                    <li>• Prevents fraud and protects your identity</li>
                    <li>• Ensures safe and appropriate medical care</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || lastFourSSN.length !== 4}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting || lastFourSSN.length !== 4
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Identity'
                )}
              </button>
            </div>
          </form>

          {/* Privacy Notice */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By proceeding, you agree to our Privacy Policy and Terms of Service. 
              Your information will never be shared without your consent.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default IdentityVerification;
