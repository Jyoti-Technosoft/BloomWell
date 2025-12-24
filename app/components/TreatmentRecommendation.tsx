'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  StarIcon, 
  TruckIcon, 
  ShieldCheckIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface FormData {
  birthday: string;
  pregnant: string;
  currentlyUsingMedicines: string;
  hasDiabetes: string;
  seenDoctorLastTwoYears: string;
  medicalConditions: string[];
  height: string;
  weight: string;
  targetWeight: string;
  goals: string[];
  allergies: string;
  currentMedications: string;
  additionalInfo: string;
  lastFourSSN: string;
}

interface TreatmentRecommendationProps {
  medicineId: string;
  medicineName: string;
  formData: FormData;
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const TreatmentRecommendation: React.FC<TreatmentRecommendationProps> = ({
  medicineId,
  medicineName,
  formData,
  isOpen,
  onClose,
  onProceed
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const getRecommendationReason = () => {
    const reasons = [];
    
    if (formData.goals.includes('I want to lose fat without losing muscle')) {
      reasons.push('Your goal to preserve muscle while losing fat');
    }
    
    if (formData.goals.includes('I want to decrease fatigue and increase my energy')) {
      reasons.push('Your desire to increase energy levels');
    }
    
    if (formData.goals.includes('I\'m interested in supporting my heart health')) {
      reasons.push('Your heart health goals');
    }
    
    if (formData.hasDiabetes === 'Yes') {
      reasons.push('Your diabetes condition requires specialized treatment');
    }
    
    if (formData.medicalConditions.includes('High Blood Pressure') || 
        formData.medicalConditions.includes('High Cholesterol')) {
      reasons.push('Your cardiovascular health considerations');
    }
    
    if (formData.weight && formData.targetWeight) {
      const weightLoss = parseInt(formData.weight) - parseInt(formData.targetWeight);
      if (weightLoss > 20) {
        reasons.push('Significant weight loss goals');
      }
    }
    
    return reasons.length > 0 ? reasons : ['Your overall health profile and treatment goals'];
  };

  const calculateBMI = () => {
    const heightInInches = parseInt(formData.height);
    const weightInLbs = parseInt(formData.weight);
    if (heightInInches && weightInLbs) {
      const bmi = (weightInLbs / (heightInInches * heightInInches)) * 703;
      return bmi.toFixed(1);
    }
    return null;
  };

  const handleProceed = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      onProceed();
    } catch (error) {
      console.error('Error processing:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const bmi = calculateBMI();
  const recommendationReasons = getRecommendationReason();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Recommendation for You</h2>
            <p className="text-gray-600">
              Based on your health profile and goals, our doctors recommend this treatment
            </p>
          </div>

          {/* Recommended Treatment */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Recommended Treatment</h3>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-gray-600">Highly Recommended</span>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-white rounded-lg shadow-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">Rx</div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{medicineName}</h4>
                <p className="text-gray-600 mb-4">
                  This treatment has been selected based on your specific health profile and treatment goals.
                </p>
                
                {/* Recommendation Reasons */}
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Why this is recommended for you:</h5>
                  <ul className="space-y-1">
                    {recommendationReasons.map((reason, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Your Health Profile */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Your Health Profile
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">
                    {formData.birthday ? 
                      new Date().getFullYear() - new Date(formData.birthday).getFullYear() : 
                      'Not provided'
                    } years
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">BMI:</span>
                  <span className="font-medium">{bmi || 'Not calculated'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight Goal:</span>
                  <span className="font-medium">
                    Lose {formData.weight && formData.targetWeight ? 
                      parseInt(formData.weight) - parseInt(formData.targetWeight) : 
                      'N/A'
                    } lbs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recent Check-up:</span>
                  <span className="font-medium">{formData.seenDoctorLastTwoYears || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <HeartIcon className="h-5 w-5 mr-2" />
                Health Considerations
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Diabetes:</span>
                  <span className="font-medium">{formData.hasDiabetes || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Medical Conditions:</span>
                  <span className="font-medium">
                    {formData.medicalConditions.length > 0 ? 
                      formData.medicalConditions.join(', ') : 
                      'None reported'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Allergies:</span>
                  <span className="font-medium">
                    {formData.allergies || 'None reported'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Medications:</span>
                  <span className="font-medium">
                    {formData.currentMedications || 'None reported'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-indigo-50 rounded-lg p-6 mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">What's Included in Your Treatment</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start">
                <TruckIcon className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600">Discreet delivery to your door</p>
                </div>
              </div>
              <div className="flex items-start">
                <UserIcon className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Medical Support</p>
                  <p className="text-sm text-gray-600">24/7 access to healthcare team</p>
                </div>
              </div>
              <div className="flex items-start">
                <ShieldCheckIcon className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">FDA Approved</p>
                  <p className="text-sm text-gray-600">Safe and effective treatments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <ClockIcon className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Next Steps</h4>
                <p className="text-sm text-yellow-800">
                  After proceeding, a licensed physician will review your evaluation and contact you within 24-48 hours 
                  to discuss your treatment plan and answer any questions.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              disabled={isProcessing}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  Proceed with Treatment
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </div>
              )}
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Your medical information is protected by HIPAA and will only be shared with your healthcare provider.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TreatmentRecommendation;
