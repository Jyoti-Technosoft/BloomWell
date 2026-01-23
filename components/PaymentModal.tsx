'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, LockClosedIcon, CreditCardIcon } from '@heroicons/react/24/outline';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicineId: string;
  medicineName: string;
  amount: number;
  userId: string;
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
  onSuccess,
  onError,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      onError('Payment gateway is loading. Please wait...');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          medicineId,
          userId,
        }),
      });

      const orderData = await response.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      // Initialize Razorpay payment
      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'BloomWell',
        description: `Payment for ${medicineName}`,
        order_id: orderData.order.id,
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

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: amount,
                medicineId,
                medicineName,
              });
              onClose();
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            onError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#4F46E5',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
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
                    <span className="text-lg font-semibold text-gray-900">${amount}</span>
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

                {/* Payment Methods */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Payment Methods</h4>
                  <div className="space-y-2">
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <CreditCardIcon className="h-5 w-5 text-gray-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Credit/Debit Card</p>
                        <p className="text-sm text-gray-600">Visa, Mastercard, Rupay, and more</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <div className="h-5 w-5 text-gray-600 mr-3 flex items-center justify-center text-xs font-bold">
                        UPI
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">UPI</p>
                        <p className="text-sm text-gray-600">Pay via any UPI app</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <div className="h-5 w-5 text-gray-600 mr-3 flex items-center justify-center text-xs font-bold">
                        NB
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Net Banking</p>
                        <p className="text-sm text-gray-600">All major banks supported</p>
                      </div>
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
