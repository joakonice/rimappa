'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{session.user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <p className="mt-1 text-gray-900 capitalize">{session.user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 