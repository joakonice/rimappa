'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, MapPin, User } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 gradient-primary">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-white">
              <Menu size={24} />
            </button>
            <Link href="/" className="text-2xl font-bold text-white">
              Rimappa
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-white">
              <Search size={24} />
            </button>
            <button className="text-white">
              <MapPin size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-3">
            <Link href="/" className={`flex flex-col items-center ${isHome ? 'text-primary-400' : 'text-text-secondary'}`}>
              <Search size={24} />
              <span className="text-xs mt-1">Explorar</span>
            </Link>
            <Link href="/favorites" className="flex flex-col items-center text-text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
              <span className="text-xs mt-1">Favoritos</span>
            </Link>
            <Link href="/messages" className="flex flex-col items-center text-text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span className="text-xs mt-1">Mensajes</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center text-text-secondary">
              <User size={24} />
              <span className="text-xs mt-1">Perfil</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content Padding */}
      <div className="pt-16 pb-20">
        {/* Este div asegura que el contenido no quede detrás del navbar o la navegación inferior */}
      </div>
    </>
  );
} 