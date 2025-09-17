import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { getVerificationRecordWithExpiry, deleteVerificationCode } from '@/app/lib/redis';

const DEVOPS = process.env.DEVOPS || '';
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || '').split(',');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 });
    }

    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(email)) {
      return NextResponse.json({ message: `This email is not in the allowed list, please contact ${DEVOPS} to add it` }, { status: 403 });
    }

    const storedVerification = await getVerificationRecordWithExpiry(email);
    if (!storedVerification) {
      return NextResponse.json(
        { success: false, message: 'Verification code does not exist or has expired, please re-obtain' },
        { status: 400 }
      );
    }

    if (Date.now() > storedVerification.expires) {
      await deleteVerificationCode(email);
      return NextResponse.json(
        { success: false, message: 'Verification code has expired, please re-obtain' },
        { status: 400 }
      );
    }

    if (storedVerification.code !== code) {
      return NextResponse.json(
        { success: false, message: 'Verification code is incorrect' },
        { status: 400 }
      );
    }

    await deleteVerificationCode(email);

    const token = await new jose.SignJWT({
      email: email,
      role: 'user'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(new TextEncoder().encode(JWT_SECRET));

    return NextResponse.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
