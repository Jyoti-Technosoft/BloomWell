// app/components/auth/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to sign out');
      }

      // Refresh the page to update the UI
      // router.refresh();
      // router.push('/');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleLogoutClick = () => {
    setShowConfirmDialog(true);
  };

  const handleCancelLogout = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <button
        onClick={handleLogoutClick}
        disabled={isLoading}
        className="text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
      >
        {isLoading ? 'Signing out...' : 'Logout'}
      </button>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Do you want to logout?
            </h3>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelLogout}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Signing out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}