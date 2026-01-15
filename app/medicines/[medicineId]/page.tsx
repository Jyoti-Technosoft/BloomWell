'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ArrowLeftIcon, 
  ShieldCheckIcon, 
  TruckIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../context/UserContext';
import Toast from '../../components/Toast';
import MedicalQuestionnaire from '../../components/MedicalQuestionnaire';
import IdentityVerification from '../../components/IdentityVerification';
import TreatmentRecommendation from '../../components/TreatmentRecommendation';
import { Medicine } from '../../lib/types';

export default function MedicinePage({ params }: { params: Promise<{ medicineId: string }> }) {
  const resolvedParams = React.use(params);
  const medicineId = resolvedParams.medicineId;
  const router = useRouter();
  const { user } = useUser();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Questionnaire flow state - moved to top
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showIdentityVerification, setShowIdentityVerification] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<any>(null);

  const handleCloseToast = () => {
    setToast(null);
  };

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        // Try to fetch from API first
        const response = await fetch('/api/medicines');
        const medicines = await response.json();
        
        const foundMedicine = medicines.find((m: Medicine) => m.id === medicineId);
        setMedicine(foundMedicine || null);
      } catch (error) {
        console.error('Error fetching medicine:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [medicineId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-8"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Medicine Not Found</h1>
            <p className="text-gray-600 mb-6">The medicine you're looking for doesn't exist.</p>
            <Link href="/treatments" className="text-indigo-600 hover:text-indigo-500">
              ← Back to Treatments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const treatmentCategory = medicine.category;

  const handleClaimEvaluation = () => {
    // Check if medicine data is available
    if (!medicine) {
      setToast({
        message: 'Medicine information not available. Please refresh the page.',
        type: 'error'
      });
      return;
    }

    if (!user) {
      router.push(`/auth/signin?callbackUrl=/medicines/${medicineId}`);
      return;
    }

    // Start the questionnaire flow
    setShowQuestionnaire(true);
  };

  const handleQuestionnaireComplete = (formData: any) => {
    setQuestionnaireData(formData);
    setShowQuestionnaire(false);
    setShowIdentityVerification(true);
  };

  const handleIdentityVerificationComplete = (ssnLast4: string) => {
    // Add SSN to questionnaire data
    const updatedData = { ...questionnaireData, lastFourSSN: ssnLast4 };
    setQuestionnaireData(updatedData);
    setShowIdentityVerification(false);
    setShowRecommendation(true);
  };

  const handleRecommendationProceed = async () => {
    try {
      // Submit the evaluation data to the backend
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          medicineId,
          medicineName: medicine?.name || 'Unknown Medicine',
          ...questionnaireData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit evaluation');
      }

      setShowRecommendation(false);
      setToast({
        message: 'Evaluation submitted successfully! Our medical team will review your information.',
        type: 'success'
      });

    } catch (error) {
      console.error('Failed to submit evaluation:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to submit evaluation. Please try again.',
        type: 'error'
      });
    }
  };

  const handleCloseAllModals = () => {
    setShowQuestionnaire(false);
    setShowIdentityVerification(false);
    setShowRecommendation(false);
  };

  if (!medicine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Medicine Not Found</h1>
          <p className="text-gray-600 mb-8">The medicine you're looking for doesn't exist.</p>
          <Link
            href={`/${treatmentCategory}`}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to {treatmentCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Link
            href={`/${treatmentCategory}`}
            className="inline-flex items-center text-indigo-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to {treatmentCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Link>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0">
              <div className="w-48 h-48 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
                <Image
                  src={medicine.image || '/placeholder-medicine.png'}
                  alt={medicine.name}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {medicine.category}
                </span>
                {medicine.inStock && (
                  <span className="px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full text-sm font-medium text-green-100">
                    In Stock
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-2">{medicine.name}</h1>
              <p className="text-xl text-indigo-100 mb-4">{medicine.description}</p>
              <div className="flex items-center justify-center md:justify-start gap-6">
                <div>
                  <p className="text-3xl font-bold">${medicine.price}</p>
                  <p className="text-sm text-indigo-200">per treatment</p>
                </div>
                <div>
                  <p className="text-lg font-medium">{medicine.dosage}</p>
                  <p className="text-sm text-indigo-200">supply</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-600 leading-relaxed">{medicine.overview}</p>
            </motion.div>

            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-gray-600 leading-relaxed">{medicine.howItWorks}</p>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {medicine.benefits?.map((benefit: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Usage Instructions */}
            {medicine.usageInstructions && medicine.usageInstructions.length > 0 && (
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage Instructions</h2>
              <ul className="space-y-3">
                {medicine.usageInstructions?.map((instruction: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            )}

            {/* Side Effects */}
            {medicine.precautions && medicine.precautions.length > 0 && (
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Possible Side Effects</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  Most side effects are mild and temporary. Consult your healthcare provider for complete information.
                </p>
              </div>
              <ul className="space-y-2">
                {medicine.sideEffects?.map((sideEffect: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span className="text-gray-700">{sideEffect}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            )}

            {/* Precautions */}
            {medicine.precautions && medicine.precautions.length > 0 && (
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Precautions</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  Important safety information. Please read carefully before use.
                </p>
              </div>
              <ul className="space-y-2">
                {medicine.precautions?.map((precaution: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <ShieldCheckIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{precaution}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features */}
            {medicine.features && medicine.features.length > 0 && (
              <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-3">
                {medicine.features?.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            )}

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support & Shipping</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <TruckIcon className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Free Shipping</p>
                    <p className="text-sm text-gray-600">{medicine.shipping}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Medical Support</p>
                    <p className="text-sm text-gray-600">{medicine.support}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">24/7 Availability</p>
                    <p className="text-sm text-gray-600">Round-the-clock customer service</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Claim Free Evaluation Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Ready to Start?</h3>
                <p className="text-indigo-100 mb-6">Claim your free evaluation and consultation</p>
                <button
                  onClick={handleClaimEvaluation}
                  disabled={!medicine.inStock}
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                    medicine.inStock
                      ? 'bg-white text-indigo-600 hover:bg-gray-100'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {!medicine.inStock ? "Out of Stock" : "Claim Free Evaluation"}
                </button>
                {!user && (
                  <p className="text-xs text-indigo-200 mt-3">
                    Sign in required to claim evaluation
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}

      {/* Questionnaire Flow Components */}
      {medicine && (
        <>
          <MedicalQuestionnaire
            key="medical-questionnaire"
            medicineId={medicineId}
            medicineName={medicine.name}
            isOpen={showQuestionnaire}
            onClose={handleCloseAllModals}
            onComplete={handleQuestionnaireComplete}
          />

          <IdentityVerification
            isOpen={showIdentityVerification}
            onClose={handleCloseAllModals}
            onComplete={handleIdentityVerificationComplete}
          />

          <TreatmentRecommendation
            medicineId={medicineId}
            medicineName={medicine.name}
            formData={questionnaireData}
            isOpen={showRecommendation}
            onClose={handleCloseAllModals}
            onProceed={handleRecommendationProceed}
          />
        </>
      )}
    </div>
  );
}
