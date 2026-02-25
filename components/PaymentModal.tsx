'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicineId: string;
  medicineName: string;
  amount: number;
  userId: string;
  evaluationId: string;
  customerData?: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentModal({
  isOpen,
  onClose,
  medicineId,
  medicineName,
  amount,
  userId,
  evaluationId,
  customerData,
  onSuccess,
  onError,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Clean up any existing Razorpay scripts first
    const existingScripts = document.querySelectorAll('script[src*="razorpay"]');
    existingScripts.forEach(script => script.remove());
    
    // Remove any existing Razorpay global object
    if (window.Razorpay) {
      delete window.Razorpay;
    }

    // Load Razorpay script with proper error handling
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      // Verify the script loaded properly
      if (typeof window.Razorpay !== 'undefined') {
        setRazorpayLoaded(true);
      } else {
        console.error('Razorpay script loaded but global object not available');
        setRazorpayLoaded(false);
      }
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Razorpay script:', error);
      setRazorpayLoaded(false);
    };

    // Add to head instead of body for better loading
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      onError('Payment gateway is loading. Please wait...');
      return;
    }

    // Double-check Razorpay is available
    if (typeof window.Razorpay === 'undefined') {
      console.error('Razorpay not available when trying to make payment');
      onError('Payment gateway not available. Please refresh the page and try again.');
      return;
    }

    setLoading(true);

    try {
      // Always create a new Razorpay order for each payment attempt
      // Razorpay orders should NEVER be reused - one order = one payment attempt
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          medicineId,
          medicineName,
          evaluationId,
          userId,
          customerName: customerData?.name || '',
          customerEmail: customerData?.email || '',
          customerPhone: customerData?.phone || ''
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create order API error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const newOrderData = await response.json();

      if (!newOrderData.success) {
        throw new Error(newOrderData.error || 'Failed to create payment order');
      }

      // Validate order data before using it
      if (!newOrderData.keyId || !newOrderData.order?.id || !newOrderData.order?.amount) {
        throw new Error('Invalid order data received from server');
      }

      // Clean and validate the key ID
      const cleanKeyId = newOrderData.keyId.toString().trim();
      if (!cleanKeyId.startsWith('rzp_')) {
        throw new Error('Invalid Razorpay key format');
      }

      // Initialize Razorpay payment with enhanced error handling
      // Create the most minimal Razorpay options to avoid session_token issues
      const options = {
        key: cleanKeyId,
        amount: parseInt(newOrderData.order.amount),
        currency: newOrderData.order.currency || 'INR',
        name: 'BloomWell',
        description: `Payment for ${medicineName}`,
        order_id: newOrderData.order.id.toString().trim(),
        handler: async function (response: any) {
          try {
            // Verify payment            
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              const errorText = await verifyResponse.text();
              console.error('Verification API error:', {
                status: verifyResponse.status,
                statusText: verifyResponse.statusText,
                errorText: errorText
              });
              throw new Error(`Payment verification failed: ${verifyResponse.status} ${errorText}`);
            }

            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              setRetryCount(0); // Reset retry count on success
              
              // Add small delay to ensure database is updated
              setTimeout(() => {
                onSuccess({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  amount: amount,
                  medicineId,
                  medicineName,
                  transaction: verifyData.transaction
                });
                onClose();
              }, 1000);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            onError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: customerData?.name || '',
          email: customerData?.email || '',
          contact: customerData?.phone || '',
        },
        // Add configuration to prevent browser autofill
        readonly: {
          email: false,
          contact: false
        },
        // Add modal configuration to prevent autofill
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
          escape: true,
          handleback: true,
          confirm_close: true,
          // Prevent browser autofill
          animation: 'slide',
        },
        // Add event handlers for debugging
        callback_url: `${process.env.RAZORPAY_WEBHOOK_DOMAIN || window.location.origin}/api/payments/verify`,
        redirect: false,
        notes: {
          app_user_name: customerData?.name || '',
          app_user_email: customerData?.email || '',
          app_user_id: userId,
          source: 'bloomwell_app',
          timestamp: Date.now()
        }
      };

      try {
        // Create Razorpay instance with error boundary
        let razorpay;
        try {
          razorpay = new window.Razorpay(options);
        } catch (constructorError) {
          console.error('Razorpay constructor failed:', constructorError);
          throw new Error('Failed to initialize payment gateway. Please refresh the page.');
        }
        
        // Add comprehensive error handling for payment failures
        razorpay.on('payment.failed', function (response: any) {
          console.error('Payment failed:', response);
          const errorDescription = response.error?.description || 'Payment failed';
          const errorCode = response.error?.code || 'UNKNOWN_ERROR';
          console.error('Error code:', errorCode);
          console.error('Error description:', errorDescription);
          
          // Handle specific "Invalid Token" error with retry logic
          if (errorCode === 'BAD_REQUEST_ERROR' && errorDescription.includes('Invalid token')) {
            
            if (retryCount < 2) { // Allow up to 2 retries
              setRetryCount(prev => prev + 1);
              setLoading(false);
              
              // Wait a moment before retrying
              setTimeout(() => {
                handlePayment();
              }, 1000 * (retryCount + 1)); // Exponential backoff
              
              return;
            } else {
              onError('Invalid payment token detected. Please refresh the page and try again.');
              setRetryCount(0);
            }
          } else {
            onError(`Payment failed: ${errorDescription}`);
            setRetryCount(0);
          }
          setLoading(false);
        });

        // Try to open the modal with error handling
        try {
          razorpay.open();
        } catch (openError) {
          console.error('Failed to open Razorpay modal:', openError);
          throw new Error('Failed to open payment modal. Please try again.');
        }
        
      } catch (razorpayError) {
        console.error('Razorpay initialization error:', razorpayError);
        
        // If initialization fails, try to reload the script and retry
        if (retryCount < 1) {
          setRazorpayLoaded(false);
          setRetryCount(prev => prev + 1);
          
          // Reload the script
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.crossOrigin = 'anonymous';
          script.onload = () => {
            if (typeof window.Razorpay !== 'undefined') {
              setRazorpayLoaded(true);
              setTimeout(() => handlePayment(), 1000);
            } else {
              onError('Payment gateway failed to load. Please refresh the page.');
              setRetryCount(0);
              setLoading(false);
            }
          };
          script.onerror = () => {
            console.error('Failed to reload Razorpay script');
            onError('Payment gateway initialization failed. Please refresh the page and try again.');
            setRetryCount(0);
            setLoading(false);
          };
          document.head.appendChild(script);
        } else {
          onError('Payment gateway initialization failed. Please refresh the page and try again.');
          setRetryCount(0);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setRetryCount(0);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-lg bg-white shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900">Complete Payment</h2>
                <button
                  onClick={onClose}
                  className="rounded-md p-2 text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Medicine Details */}
                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                  <h3 className="font-medium text-gray-900">{medicineName}</h3>
                  <p className="text-sm text-gray-600">Medicine ID: {medicineId}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-lg font-semibold text-gray-900">₹{amount}</span>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mb-6 rounded-lg bg-blue-50 p-4">
                  <div className="flex items-start">
                    <LockClosedIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Secure Payment</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your payment information is encrypted and secure. We use industry-standard security measures.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={loading || !razorpayLoaded}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Processing...' : 'Pay Now'}
                  </button>
                </div>

                {!razorpayLoaded && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Loading payment gateway...
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
