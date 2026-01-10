'use client';

import { useEffect, useRef, useState } from 'react';
import { DailyProvider, useDaily } from '@daily-co/daily-react';

interface VideoCallProps {
  roomUrl: string;
  onLeave?: () => void;
}

function VideoCallComponent({ roomUrl, onLeave }: VideoCallProps) {
  const daily = useDaily();
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!daily || !roomUrl) return;

    const joinRoom = async () => {
      try {
        await daily.join({ url: roomUrl });
        setIsJoined(true);
        setError(null);
      } catch (err) {
        console.error('Failed to join room:', err);
        setError('Failed to join video call');
      }
    };

    joinRoom();

    return () => {
      if (daily && daily.meetingState() === 'joined-meeting') {
        daily.leave();
      }
    };
  }, [daily, roomUrl]);

  useEffect(() => {
    if (!daily) return;

    const handleJoinedMeeting = () => {
      setIsJoined(true);
      setError(null);
    };

    const handleLeftMeeting = () => {
      setIsJoined(false);
      onLeave?.();
    };

    const handleError = (error: any) => {
      console.error('Daily error:', error);
      setError(error?.errorMsg || 'An error occurred');
    };

    daily.on('joined-meeting', handleJoinedMeeting);
    daily.on('left-meeting', handleLeftMeeting);
    daily.on('error', handleError);

    return () => {
      daily.off('joined-meeting', handleJoinedMeeting);
      daily.off('left-meeting', handleLeftMeeting);
      daily.off('error', handleError);
    };
  }, [daily, onLeave]);

  const handleLeave = () => {
    if (daily) {
      daily.leave();
    }
  };

  const toggleCamera = () => {
    if (daily) {
      if (daily.localVideo()) {
        daily.setLocalVideo(false);
      } else {
        daily.setLocalVideo(true);
      }
    }
  };

  const toggleMic = () => {
    if (daily) {
      if (daily.localAudio()) {
        daily.setLocalAudio(false);
      } else {
        daily.setLocalAudio(true);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (daily) {
      try {
        await daily.startScreenShare();
      } catch (error) {
        console.error('Screen share error:', error);
        // Try to stop if already sharing
        try {
          await daily.stopScreenShare();
        } catch (stopError) {
          console.error('Stop screen share error:', stopError);
        }
      }
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onLeave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Consultation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Video Container */}
      <div 
        ref={videoContainerRef} 
        className="flex-1 relative"
        id="video-container"
      />

      {/* Controls */}
      {isJoined && (
        <div className="bg-gray-800 p-4 border-t border-gray-700">
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={toggleMic}
              className={`p-3 rounded-full transition-colors ${
                daily?.localAudio() 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {daily?.localAudio() ? '🎤' : '🔇'}
            </button>
            
            <button
              onClick={toggleCamera}
              className={`p-3 rounded-full transition-colors ${
                daily?.localVideo() 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {daily?.localVideo() ? '📹' : '📵'}
            </button>

            <button
              onClick={toggleScreenShare}
              className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
            >
              🖥️
            </button>

            <button
              onClick={handleLeave}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-colors"
            >
              Leave Call
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isJoined && !error && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-white">Joining video call...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VideoCall({ roomUrl, onLeave }: VideoCallProps) {
  return (
    <DailyProvider>
      <VideoCallComponent roomUrl={roomUrl} onLeave={onLeave} />
    </DailyProvider>
  );
}
