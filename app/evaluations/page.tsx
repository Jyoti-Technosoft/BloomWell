'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  DocumentTextIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../context/UserContext';
import Toast from '../components/Toast';
import PaymentModal from '../../components/PaymentModal';

interface Evaluation {
  id: string;
  medicineId: string;
  medicineName: string;
  evaluationType: string;
  status: 'pending_review' | 'approved' | 'rejected';
  createdAt: string;
  responses?: any;
}

export default function EvaluationsPage() {
  const { user } = useUser();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentEvaluation, setPaymentEvaluation] = useState<Evaluation | null>(null);

  useEffect(() => {
    if (user) {
      fetchEvaluations();
    }
  }, [user]);

  const fetchEvaluations = async () => {
    try {
      const response = await fetch('/api/evaluations');
      const data = await response.json();
      
      if (data.evaluations) {
        setEvaluations(data.evaluations);
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      setToast({
        message: 'Failed to fetch evaluations',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending_review': 
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-5 w-5" />;
      case 'rejected': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'pending_review': 
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'pending_review': 
      default: return 'Under Review';
    }
  };

  const handleViewDetails = (evaluationId: string) => {
    const evaluation = evaluations.find(evaluation => evaluation.id === evaluationId);
    if (evaluation) {
      setSelectedEvaluation(evaluation);
    }
  };

  const handleCloseDetailsModal = () => {
    setSelectedEvaluation(null);
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  const handleProceedToPayment = (evaluation: Evaluation) => {
    if (evaluation.status !== 'approved') {
      setToast({
        message: 'Payment is only available for approved evaluations',
        type: 'error'
      });
      return;
    }
    setPaymentEvaluation(evaluation);
    setShowPayment(true);
    setSelectedEvaluation(null); // Close details modal
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    setToast({
      message: 'Payment successful! Your order has been created.',
      type: 'success'
    });
    setShowPayment(false);
    setPaymentEvaluation(null);
    await fetchEvaluations();
  };

  const handlePaymentError = (error: string) => {
    setToast({
      message: `Payment failed: ${error}`,
      type: 'error'
    });
  };

  const handleClosePayment = () => {
    setShowPayment(false);
    setPaymentEvaluation(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your evaluations.</p>
          <a
            href="/auth/signin"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Medical Evaluations</h1>
          <p className="text-gray-600">Track the status of your medical evaluations</p>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading evaluations...</span>
          </div>
        ) : evaluations.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Evaluations Yet</h2>
            <p className="text-gray-600 mb-6">You haven't submitted any medical evaluations yet.</p>
            <a
              href="/treatments"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Start Evaluation
            </a>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {evaluations.map((evaluation) => (
              <div key={evaluation.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(evaluation.status)}`}>
                        {getStatusIcon(evaluation.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {evaluation.medicineName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Evaluation ID: {evaluation.id}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(evaluation.status)}`}>
                      {getStatusText(evaluation.status)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium text-gray-900">
                      {evaluation.evaluationType.replace('-', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Submitted</p>
                    <p className="font-medium text-gray-900">
                      {new Date(evaluation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900">
                      {new Date(evaluation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex space-x-3">
                  {evaluation.status === 'approved' && (
                    <button
                      onClick={() => handleProceedToPayment(evaluation)}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Proceed to Payment
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleViewDetails(evaluation.id)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {selectedEvaluation && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div onClick={handleCloseDetailsModal} />

            <div className="relative w-full max-w-4xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900">Evaluation Details</h2>
                <button
                  onClick={handleCloseDetailsModal}
                  className="rounded-md p-2 text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Evaluation ID:</span>
                        <span className="text-gray-900">{selectedEvaluation.id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Medicine:</span>
                        <span className="text-gray-900">{selectedEvaluation.medicineName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="text-gray-900">{selectedEvaluation.evaluationType?.replace('-', ' ') || 'General'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEvaluation.status)}`}>
                          {getStatusIcon(selectedEvaluation.status)}
                          <span className="ml-2">{getStatusText(selectedEvaluation.status)}</span>
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Submitted:</span>
                        <span className="text-gray-900">{new Date(selectedEvaluation.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Responses */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Evaluation Responses</h3>
                    {selectedEvaluation.responses && (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {Object.entries(selectedEvaluation.responses).map(([key, value]) => {
                          // Skip empty values
                          if (!value || (typeof value === 'string' && value.trim() === '')) {
                            return null;
                          }

                          if (key === 'error' || typeof value === 'string' && value.includes('Failed to decrypt')) {
                            return null;
                          }

                          // Format array values
                          if (Array.isArray(value)) {
                            return (
                              <React.Fragment key={key}>
                                <div className="border-l-4 border-gray-200 pl-4">
                                  <span className="font-medium text-gray-700 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}:
                                  </span>
                                  <div className="mt-2 space-y-1">
                                    {value.map((item: string, index: number) => (
                                      <div key={index} className="flex items-center">
                                        <span className="text-gray-900">• {item}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          }

                          if (typeof value === 'object' && value !== null) {
                            return (
                              <React.Fragment key={key}>
                                <div className="border-l-4 border-gray-200 pl-4">
                                  <span className="font-medium text-gray-700 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}:
                                  </span>
                                  <span className="text-gray-900">{JSON.stringify(value)}</span>
                                </div>
                              </React.Fragment>
                            );
                          }

                          return (
                            <React.Fragment key={key}>
                              <div className="border-l-4 border-gray-200 pl-4">
                                <span className="font-medium text-gray-700 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}:
                                </span>
                                <span className="text-gray-900">{String(value)}</span>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {selectedEvaluation.status === 'approved' && (
              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => handleProceedToPayment(selectedEvaluation)}
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Proceed to Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showPayment && paymentEvaluation && (
        <PaymentModal
          isOpen={showPayment}
          onClose={handleClosePayment}
          medicineId={paymentEvaluation.medicineId}
          medicineName={paymentEvaluation.medicineName}
          amount={99}
          userId={user.id}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
}
