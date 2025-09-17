import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";
const TOKEN = process.env.TOKEN || '';
const NO_NEED_LOGIN = process.env.NEXT_PUBLIC_NO_NEED_LOGIN === 'true';
const publicPaths = ['/login', '/api/auth', '/_next/static', '/_next/image', '/favicon.ico'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (NO_NEED_LOGIN) {
    if (path === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;
  if (path === '/login' && token) {
    try {
      await jose.jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      return NextResponse.redirect(new URL('/', request.url));
    } catch {
    }
  }

  if (publicPaths.some(publicPath => path === publicPath || path.startsWith(publicPath + '/'))) {
    return NextResponse.next();
  }

  if (TOKEN && token === TOKEN) {
    return NextResponse.next();
  }

  if (!token) {
    if (path === '/') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await jose.jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return NextResponse.next();
  } catch {
    if (path === '/') {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
    const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'
  ],
};
