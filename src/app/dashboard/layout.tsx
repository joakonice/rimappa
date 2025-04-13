'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Home, Heart, MessageSquare, User, Menu, Search } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <header className="bg-gradient-to-r from-purple-900 to-purple-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="text-white">
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white">Rimappa</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-white">
            <Search size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Suspense fallback={<div className="p-4 text-white">Loading...</div>}>
          {children}
        </Suspense>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-gray-800 text-gray-300 p-4">
        <div className="max-w-screen-xl mx-auto flex justify-around items-center">
          <Link href="/dashboard" className="flex flex-col items-center gap-1">
            <Home size={24} />
            <span className="text-xs">Inicio</span>
          </Link>
          <Link href="/dashboard/favorites" className="flex flex-col items-center gap-1">
            <Heart size={24} />
            <span className="text-xs">Favoritos</span>
          </Link>
          <Link href="/dashboard/messages" className="flex flex-col items-center gap-1">
            <MessageSquare size={24} />
            <span className="text-xs">Mensajes</span>
          </Link>
          <Link href="/dashboard/profile" className="flex flex-col items-center gap-1">
            <User size={24} />
            <span className="text-xs">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
} 