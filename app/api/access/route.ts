import { NextRequest, NextResponse } from 'next/server';
import { access } from '@/app/lib/accessLog';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const { payload } = await jose.jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );

      if (!payload.email) {
        return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
      }

      const email = payload.email as string;
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

      await access(email, ip);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error logging access:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
