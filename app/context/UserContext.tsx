// app/context/UserContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

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
      await signOut({ redirect: false });
      setUser(null);
      // Force a full page reload to clear all state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed', error);
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