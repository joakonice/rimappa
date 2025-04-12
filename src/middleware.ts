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
    authorized: ({ token, req }) => {
      console.log('Middleware - Token:', token);
      console.log('Middleware - URL:', req.url);
      
      if (!token) {
        console.log('No hay token, redirigiendo a login');
        return false;
      }
      
      console.log('Token válido, permitiendo acceso');
      return true;
    }
  },
  pages: {
    signIn: '/login',
  }
}); 