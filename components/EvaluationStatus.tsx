'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CreditCardIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface EvaluationStatusProps {
  evaluationId: string;
  isOpen: boolean;
  onClose: () => void;
  onPaymentRequired?: (evaluationData: any) => void;
}

interface EvaluationData {
  id: string;
  status: 'pending_review' | 'approved' | 'rejected';
  medicineName: string;
  createdAt: string;
  responses?: any;
}

export default function EvaluationStatus({ 
  evaluationId, 
  isOpen, 
  onClose, 
  onPaymentRequired 
}: EvaluationStatusProps) {
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'none' | 'paid'>('none');

  useEffect(() => {
    if (isOpen && evaluationId) {
      fetchEvaluationStatus();
    }
  }, [isOpen, evaluationId]);

  // Refresh payment status when modal opens
  useEffect(() => {
    if (isOpen && evaluation) {
      checkPaymentStatus(evaluation.id);
    }
  }, [isOpen, evaluation?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setEvaluation(null);
      setPaymentStatus('none');
      setLoading(false);
    };
  }, []);

  const fetchEvaluationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/evaluations`);
      const data = await response.json();
      
      if (data.evaluations) {
        const userEvaluation = data.evaluations.find((evaluation: EvaluationData) => evaluation.id === evaluationId);
        setEvaluation(userEvaluation || null);
        
        // Check payment status if evaluation exists
        if (userEvaluation) {
          await checkPaymentStatus(userEvaluation.id);
        }
      }
    } catch (error) {
      console.error('Error fetching evaluation status:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (evalId: string) => {
    try {
      const response = await fetch(`/api/payments/check-payment?evaluationId=${evalId}`);
      const data = await response.json();
      
      if (data.hasPayment) {
        setPaymentStatus('paid');
      } else {
        setPaymentStatus('none');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('none');
    }
  };

  const handleRefreshStatus = async () => {
    if (evaluation) {
      await fetchEvaluationStatus();
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
      case 'approved': return <CheckCircleIcon className="h-6 w-6" />;
      case 'rejected': return <ExclamationTriangleIcon className="h-6 w-6" />;
      case 'pending_review': 
      default: return <ClockIcon className="h-6 w-6" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Evaluation Approved';
      case 'rejected': return 'Evaluation Rejected';
      case 'pending_review': 
      default: return 'Under Medical Review';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'approved': 
        return 'Your medical evaluation has been approved by our medical team. You can now proceed with your order.';
      case 'rejected': 
        return 'Based on your medical evaluation, our team has determined that this treatment may not be suitable for you at this time.';
      case 'pending_review': 
      default: 
        return 'Your medical evaluation is currently being reviewed by our licensed healthcare professionals. This typically takes 1-2 business hours.';
    }
  };

  const handleProceedToPayment = () => {
    if (evaluation && onPaymentRequired) {
      onPaymentRequired(evaluation);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md rounded-lg bg-white shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900">Evaluation Status</h2>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading evaluation status...</span>
              </div>
            ) : evaluation ? (
              <div className="space-y-6">
                {/* Status Display */}
                <div className={`flex items-center rounded-lg p-4 ${getStatusColor(evaluation.status)}`}>
                  <div className="shrink-0">
                    {getStatusIcon(evaluation.status)}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">{getStatusText(evaluation.status)}</h3>
                    <p className="text-sm mt-1">{getStatusDescription(evaluation.status)}</p>
                  </div>
                </div>

                {/* Evaluation Details */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Evaluation Details</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Evaluation ID: </span> {evaluation.id}</p>
                    <p><span className="font-medium">Medicine: </span> {evaluation.medicineName}</p>
                    <p><span className="font-medium">Submitted: </span> {new Date(evaluation.createdAt).toLocaleDateString()}</p>
                    <p><span className="font-medium">Status: </span> {evaluation.status.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {evaluation.status === 'approved' && (
                  <div className="space-y-3">
                    {paymentStatus === 'paid' ? (
                      // Show purchased status
                      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-green-900">Payment Completed ✅</h4>
                            <p className="text-sm text-green-700 mt-1">
                              Your payment has been successfully processed. Your order is being prepared for shipment.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : onPaymentRequired ? (
                      // Show payment button
                      <>
                        <button
                          onClick={handleProceedToPayment}
                          className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <CreditCardIcon className="h-5 w-5 mr-2" />
                          Proceed to Payment
                        </button>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            Click to complete your order and proceed to secure payment
                          </p>
                          <button
                            onClick={handleRefreshStatus}
                            className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                          >
                            Refresh Status
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

                {evaluation.status === 'rejected' && (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-blue-50 p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Consider consulting with your primary care physician</li>
                        <li>• Explore alternative treatment options</li>
                        <li>• Contact our support team for guidance</li>
                      </ul>
                    </div>
                  </div>
                )}

                {evaluation.status === 'pending_review' && (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-blue-50 p-4">
                      <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Medical team reviews your evaluation</li>
                        {/* <li>• You'll receive email notification</li> */}
                        <li>• If approved, you can proceed to payment</li>
                        <li>• Typical review time: 1-2 business hours</li>
                      </ul>
                    </div>
                    
                    <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                      <h4 className="font-medium text-yellow-900 mb-2">💳 Payment Information</h4>
                      <div className="text-sm text-yellow-800 space-y-2">
                        <p>Once your evaluation is approved, you'll need to complete payment to proceed with your treatment.</p>
                        <div className="bg-yellow-100 rounded p-2">
                          <p className="font-medium mb-1">📍 <strong>Where to pay:</strong></p>
                          <ul className="text-xs space-y-1">
                            <li>• Check your status in "My Evaluations" page</li>
                            <li>• Find your approved evaluation</li>
                            <li>• Click "Proceed to Payment" when ready</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Evaluation not found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
