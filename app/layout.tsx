import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UserProvider } from '@/context/UserContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LayoutWrapper from '@/components/LayoutWrapper';
import { Providers } from './providers';
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
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <Footer />
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
