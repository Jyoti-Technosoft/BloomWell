'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Toast from '../../components/Toast';

interface Evaluation {
  id: string;
  patientName: string;
  patientEmail: string;
  medicineId: string;
  medicineName: string;
  evaluationType: string;
  status: 'pending_review' | 'approved' | 'rejected';
  responses: any;
  createdAt: string;
  updatedAt: string;
}

interface ReviewForm {
  approved: boolean;
  prescription: string;
  notes: string;
  recommendedMedicine: string;
  recommendedDosage: string;
}

export default function DoctorEvaluations() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('pending_review');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    approved: true,
    prescription: '',
    notes: '',
    recommendedMedicine: '',
    recommendedDosage: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Enhanced fetch with auth handling
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    // Check if user is authenticated before making request
    if (status === 'unauthenticated') {
      console.log('🔐 User not authenticated, redirecting to login...');
      const currentPath = window.location.pathname;
      const callbackUrl = encodeURIComponent(currentPath);
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
      throw new Error('User not authenticated');
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Ensure cookies are sent
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      console.log('🔐 Session expired, redirecting to login...');
      
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to login page with callback
      const currentPath = window.location.pathname;
      const callbackUrl = encodeURIComponent(currentPath);
      window.location.href = `/auth/signin?callbackUrl=${callbackUrl}`;
      
      throw new Error('Session expired - redirecting to login');
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Access denied');
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') return; // Will be handled by useAuthenticatedApi
    
    fetchEvaluations();
  }, [filterStatus, status]);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      
      const response = await authenticatedFetch(`/api/evaluations?${params}`);
      const data = await response.json();
      setEvaluations(data.evaluations || []);
      
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      if (error instanceof Error && !error.message.includes('redirecting')) {
        setError(error.message);
        setToast({
          message: error.message || 'Failed to fetch evaluations',
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending_review': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-5 w-5" />;
      case 'rejected': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'pending_review': return <ClockIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const handleViewDetails = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
  };

  const handleReviewEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setReviewForm({
      approved: true,
      prescription: '',
      notes: '',
      recommendedMedicine: evaluation.medicineId,
      recommendedDosage: ''
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedEvaluation) return;

    try {
      setSubmittingReview(true);
      const response = await authenticatedFetch(`/api/evaluations/${selectedEvaluation.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved: reviewForm.approved,
          prescription: reviewForm.prescription,
          notes: reviewForm.notes,
          recommendedMedicine: reviewForm.recommendedMedicine,
          recommendedDosage: reviewForm.recommendedDosage,
        }),
      });

      const data = await response.json();
      setToast({
        message: `Evaluation ${reviewForm.approved ? 'approved' : 'rejected'} successfully`,
        type: 'success'
      });
      setShowReviewModal(false);
      setSelectedEvaluation(null);
      fetchEvaluations(); // Refresh the list
      
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error instanceof Error && !error.message.includes('redirecting')) {
        setToast({
          message: error.message || 'Failed to submit review',
          type: 'error'
        });
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading evaluations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Evaluations</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Evaluations</h1>
          <p className="text-gray-600">Review and manage patient evaluations</p>
        </div>
        
        {/* Filter */}
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Evaluations List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {evaluations.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {evaluations.map((evaluation) => (
              <motion.li
                key={evaluation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getStatusColor(evaluation.status)}`}>
                          {getStatusIcon(evaluation.status)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {evaluation.patientName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {evaluation.medicineName} • {evaluation.evaluationType.replace('-', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>ID: {evaluation.id}</span>
                        <span>•</span>
                        <span>{new Date(evaluation.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {evaluation.status === 'pending_review' && (
                        <button
                          onClick={() => handleReviewEvaluation(evaluation)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Review
                        </button>
                      )}
                      <button
                        onClick={() => handleViewDetails(evaluation)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No evaluations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterStatus === 'all' ? 'No evaluations have been submitted yet.' : `No evaluations with status "${filterStatus}" found.`}
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedEvaluation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowReviewModal(false)} />
            
            <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900">Review Evaluation</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="rounded-md p-2 text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                {/* Patient Info */}
                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedEvaluation.patientName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedEvaluation.patientEmail}
                    </div>
                    <div>
                      <span className="font-medium">Medicine:</span> {selectedEvaluation.medicineName}
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span> {new Date(selectedEvaluation.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Review Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decision
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="decision"
                          checked={reviewForm.approved}
                          onChange={(e) => setReviewForm({ ...reviewForm, approved: true })}
                          className="mr-2"
                        />
                        <span className="text-sm text-green-600 font-medium">Approve</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="decision"
                          checked={!reviewForm.approved}
                          onChange={(e) => setReviewForm({ ...reviewForm, approved: false })}
                          className="mr-2"
                        />
                        <span className="text-sm text-red-600 font-medium">Reject</span>
                      </label>
                    </div>
                  </div>

                  {reviewForm.approved && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prescription (optional)
                        </label>
                        <textarea
                          value={reviewForm.prescription}
                          onChange={(e) => setReviewForm({ ...reviewForm, prescription: e.target.value })}
                          rows={3}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Enter prescription details..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recommended Medicine
                        </label>
                        <input
                          type="text"
                          value={reviewForm.recommendedMedicine}
                          onChange={(e) => setReviewForm({ ...reviewForm, recommendedMedicine: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recommended Dosage
                        </label>
                        <input
                          type="text"
                          value={reviewForm.recommendedDosage}
                          onChange={(e) => setReviewForm({ ...reviewForm, recommendedDosage: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="e.g., 1mg weekly"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={reviewForm.notes}
                      onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder={reviewForm.approved ? "Add notes about the approval..." : "Reason for rejection..."}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : `Submit ${reviewForm.approved ? 'Approval' : 'Rejection'}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedEvaluation && !showReviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedEvaluation(null)} />
            
            <div className="relative w-full max-w-4xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900">Evaluation Details</h2>
                <button
                  onClick={() => setSelectedEvaluation(null)}
                  className="rounded-md p-2 text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="text-gray-900 ml-2">{selectedEvaluation.patientName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="text-gray-900 ml-2">{selectedEvaluation.patientEmail}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Medicine:</span>
                        <span className="text-gray-900 ml-2">{selectedEvaluation.medicineName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="text-gray-900 ml-2">{selectedEvaluation.evaluationType.replace('-', ' ')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${getStatusColor(selectedEvaluation.status)}`}>
                          {getStatusIcon(selectedEvaluation.status)}
                          <span className="ml-1">{selectedEvaluation.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Submitted:</span>
                        <span className="text-gray-900 ml-2">{new Date(selectedEvaluation.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Responses */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Evaluation Responses</h3>
                    {selectedEvaluation.responses && (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {Object.entries(selectedEvaluation.responses).map(([key, value]) => {
                          if (!value || (typeof value === 'string' && value.trim() === '')) {
                            return null;
                          }

                          if (key === 'error' || typeof value === 'string' && value.includes('Failed to decrypt')) {
                            return null;
                          }

                          if (Array.isArray(value)) {
                            return (
                              <div key={key} className="border-l-4 border-gray-200 pl-4">
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
                            );
                          }

                          return (
                            <div key={key} className="border-l-4 border-gray-200 pl-4">
                              <span className="font-medium text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}:
                              </span>
                              <span className="text-gray-900 ml-2">{String(value)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {selectedEvaluation.status === 'pending_review' && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => handleReviewEvaluation(selectedEvaluation)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Review Evaluation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
