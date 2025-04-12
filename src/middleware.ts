import { withAuth } from 'next-auth/middleware';

// Rutas que requieren autenticación
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/competitions/:path*',
  ]
};

export default withAuth({
  pages: {
    signIn: '/login',
  }
}); 