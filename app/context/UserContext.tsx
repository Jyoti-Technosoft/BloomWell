'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type User = {
  id: string;
  email: string;
  fullName: string;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      setUser({
        id: session.user.id!,
        email: session.user.email!,
        fullName: session.user.name || 'User'
      });
    } else {
      setUser(null);
    }
  }, [session, status]);

  const logout = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
      // Clear client-side storage
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      // Redirect to signin page
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
      window.location.href = '/auth/signin';
    }
  };

  const loading = status === 'loading';

  return (
    <UserContext.Provider value={{ user, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}