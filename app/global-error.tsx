'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h1>
          
          <p className="text-gray-600 mb-6">
            We encountered an unexpected error. This has been logged and our team will look into it.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 font-mono break-all">
              {error.message || 'Unknown error occurred'}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full flex justify-center items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              Try again
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Go to homepage
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Need immediate help?
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Try refreshing the page</strong> - Sometimes a simple reload fixes the issue
              </p>
              <p>
                <strong>Check your internet connection</strong> - Ensure you're connected to the internet
              </p>
              <p>
                <strong>Clear browser cache</strong> - Clear your browser's cache and cookies
              </p>
              <p>
                <strong>Contact support</strong> - If the problem persists, reach out to our support team
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
