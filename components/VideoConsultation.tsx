'use client';
import { useState } from 'react';
import VideoCall from '@/components/VideoCall';
import { Physician } from '../app/lib/types';

interface VideoConsultationProps {
  physician: Physician;
  onBack: () => void;
}

export default function VideoConsultation({ physician, onBack }: VideoConsultationProps) {
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInCall, setIsInCall] = useState(false);

  const startVideoCall = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/video/room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create video room');
      }

      const data = await response.json();
      setRoomUrl(data.url);
      setIsInCall(true);
    } catch (err) {
      console.error('Error starting video call:', err);
      setError('Unable to start video call. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveCall = () => {
    setIsInCall(false);
    setRoomUrl(null);
  };

  if (isInCall && roomUrl) {
    return (
      <div className="fixed inset-0 z-50">
        <VideoCall roomUrl={roomUrl} onLeave={handleLeaveCall} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Consultation
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Consultation</h1>
          <p className="text-gray-600">Connect with your healthcare provider via secure video call</p>
        </div>

        {/* Physician Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            {physician.image ? (
              <img
                src={physician.image}
                alt={physician.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {physician.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{physician.name}</h2>
              <p className="text-blue-600 font-semibold">{physician.role}</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Available for video call</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Call Setup */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Your Video Consultation</h3>
            
            <div className="text-left max-w-md mx-auto mb-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Secure, HIPAA-compliant video connection</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">High-quality video and audio</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Screen sharing capabilities</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">No software download required</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <button
              onClick={startVideoCall}
              disabled={isLoading}
              className="cursor-pointer px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Starting Video Call...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Start Video Call
                </div>
              )}
            </button>

            <p className="text-sm text-gray-500 mt-4">
              By starting this call, you agree to our terms of service and privacy policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
