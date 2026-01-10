import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { UserProvider } from './context/UserContext';
import Header from './components/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BloomWell - Weight Management & Wellness',
  description: 'Personalized weight loss medication and wellness treatments made accessible and affordable.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-white`}>
        <Providers>
          <UserProvider>
            <Header />
            <main className="min-h-[calc(100vh-80px)] pt-30 md:pt-25 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              {children}
            </main>
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
