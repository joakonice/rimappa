import { withAuth } from 'next-auth/middleware';

// Rutas que requieren autenticación
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/competitions/:path*',
  ]
};

export default withAuth(
  function middleware(req) {
    return null;
  },
  {
    callbacks: {
      authorized({ token }) {
        if (!token) return false;
        return true;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
); 