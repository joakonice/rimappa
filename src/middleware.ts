import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Rutas que requieren autenticación
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/competitions/:path*',
  ]
};

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  },
  pages: {
    signIn: '/login',
  }
}); 