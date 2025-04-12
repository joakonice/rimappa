import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(req: NextRequest) {
    // Si el usuario está autenticado y trata de acceder a /login o /register
    if (req.nextauth.token && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a la página principal y registro sin autenticación
        if (req.nextUrl.pathname === "/" || 
            req.nextUrl.pathname === "/login" || 
            req.nextUrl.pathname === "/register") {
          return true;
        }

        // Requerir autenticación para rutas que empiezan con /dashboard
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token;
        }

        // Permitir acceso a todas las demás rutas
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/competitions/:path*'],
}; 