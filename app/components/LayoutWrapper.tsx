'use client';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth/');

  return (
    <main className={`min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${
      isAuthPage ? 'py-4' : 'pt-30 md:pt-25'
    }`}>
      {children}
    </main>
  );
}
