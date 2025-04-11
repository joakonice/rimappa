import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rimappa - Competencias de Freestyle',
  description: 'Plataforma para organizar y participar en competencias de freestyle rap',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased min-h-screen bg-gray-900`}>
        <AuthProvider>
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
} 