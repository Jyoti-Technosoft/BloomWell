'use client';
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  healthcarePurpose: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyPhone: string;
  allergies: string;
  medications: string;
  medicalHistory: string;
  createdAt: string;
  updatedAt: string;
}

export function useUserProfile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const profileData = await response.json();
        setProfile(profileData);
        setError(null);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    isAuthenticated: !!user
  };
}
