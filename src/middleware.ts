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
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                      req.nextUrl.pathname.startsWith('/register');
    
    if (isAuthPage) {
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.next();
    }

    if (!token) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/login',
      error: '/login',
    },
  }
); 