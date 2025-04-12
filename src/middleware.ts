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
    console.log('Middleware - Request path:', req.nextUrl.pathname);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log('Middleware - Token:', JSON.stringify(token, null, 2));
        console.log('Middleware - URL:', req.url);
        
        if (!token) {
          console.log('Middleware - No hay token, redirigiendo a login');
          return false;
        }
        
        // Verificar que el token tenga la información necesaria
        if (!token.email || !token.id) {
          console.log('Middleware - Token inválido, redirigiendo a login');
          return false;
        }
        
        console.log('Middleware - Token válido, permitiendo acceso');
        return true;
      }
    },
    pages: {
      signIn: '/login',
    }
  }
); 