'use client';

import { Fragment, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Competencias', href: '/dashboard/competitions' },
  { name: 'Perfil', href: '/dashboard/profile' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    console.log('DashboardLayout - No session found, redirecting to login');
    redirect('/login');
  }

  console.log('DashboardLayout - Session found:', {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role
  });

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
} 