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
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 py-6 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>© {new Date().getFullYear()} Created by</span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.do1e.cn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
                  >
                    Do1e
                  </a>
                  <span className="text-gray-400">·</span>
                  <a
                    href="https://github.com/nvidia-smi-web/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
                  >
                    nvidia-smi-web
                  </a>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                <a
                  href="https://github.com/nvidia-smi-web/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
