import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Rutas que requieren autenticación
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/competitions/:path*',
  ]
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    console.log('Middleware - Token:', token);
    
    // Si hay token, permitir el acceso
    if (token) {
      console.log('Middleware - Usuario autenticado, permitiendo acceso');
      return NextResponse.next();
    }

    // Si no hay token, redirigir al login
    console.log('Middleware - Usuario no autenticado, redirigiendo a login');
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token;
      },
    },
  }
); 