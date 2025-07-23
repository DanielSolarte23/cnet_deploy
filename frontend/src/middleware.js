import { NextResponse } from 'next/server';

export function middleware(request) {
  // Obtener el token de las cookies
  const token = request.cookies.get('token')?.value || request.cookies.get('jwt')?.value;
  
  // Rutas que requieren autenticación
  const protectedRoutes = ['/secure/administrador'];
  
  // Rutas públicas (login, register, etc.)
  const publicRoutes = ['/', '/reset-password'];
  
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );
  
  // Si no hay token y estamos en una ruta protegida, redirigir al login
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si hay token y estamos en una ruta pública (como login), redirigir al dashboard
  if (token && isPublicRoute && pathname === '/') {
    const dashboardUrl = new URL('/secure/administrador', request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // Continuar con la request normal
  return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};