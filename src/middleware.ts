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
      // Los logs del middleware aparecerán en los logs del servidor
      console.log('Middleware - Token:', token);
      console.log('Middleware - URL:', req.url);
      
      if (!token) {
        console.log('Middleware - No hay token, redirigiendo a login');
        return false;
      }
      
      console.log('Middleware - Token válido, permitiendo acceso');
      return true;
    }
  },
  pages: {
    signIn: '/login',
  }
}); 