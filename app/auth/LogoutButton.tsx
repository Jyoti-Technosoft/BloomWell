'use client';
import { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function LogoutButton() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { logout } = useUser();

  const handleCancelLogout = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirmDialog(true)}
        className="text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
      >
        Logout
      </button>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Do you want to logout?
            </h3>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}