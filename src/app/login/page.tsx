import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

export default async function Login() {
  console.log('Login Page - Checking server session');
  const session = await getServerSession(authOptions);
  
  if (session) {
    console.log('Login Page - User already authenticated, redirecting to dashboard');
    redirect('/dashboard');
  }

  console.log('Login Page - No session found, showing login form');
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center"><p className="text-white">Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
} 