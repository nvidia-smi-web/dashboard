import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { setVerificationCodeWithExpiry, canResendVerificationCode } from '@/app/lib/redis';

const DEVOPS = process.env.DEVOPS || '';
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || '').split(',');

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(email)) {
      return NextResponse.json(
        { success: false, message: `This email is not in the allowed list, please contact ${DEVOPS} to add it` },
        { status: 403 }
      );
    }

    const canResend = await canResendVerificationCode(email);
    if (!canResend) {
      return NextResponse.json(
        { success: false, message: 'Do not repeat requests' },
        { status: 429 }
      );
    }

    const code = generateVerificationCode();

    await setVerificationCodeWithExpiry(email, {
      code,
      expires: Date.now() + 10 * 60 * 1000,
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"GPU Dashboard" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `GPU Dashboard code: ${code}`,
      text: `Your GPU Dashboard login verification code is: ${code}, valid for 10 minutes.`,
      html: `
        <h2>GPU Dashboard Login Verification</h2>
        <p>Hello, your login GPU Dashboard verification code is: ${code}</p>
        <p>This verification code is valid for 10 minutes. If this is not your operation, please ignore this email.</p>
      `,
    });

    return NextResponse.json(
      { success: true, message: 'Verification code sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to send verification code:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send verification code, please try again later' },
      { status: 500 }
    );
  }
}
