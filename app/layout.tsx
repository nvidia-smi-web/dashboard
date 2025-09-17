import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import { PublicEnvScript } from 'next-runtime-env';
import ThemeProvider from './components/themeProvider';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const title = process.env.NEXT_PUBLIC_SITE_TITLE || 'GPU Dashboard';
  const description = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'GPU Dashboard in CITE Lab';
  return {
    title,
    description,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
