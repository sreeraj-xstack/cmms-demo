import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'XStack CMMS',
  description: 'Plant Maintenance & Asset Management System',
  icons: {
    icon: [
      { url: '/xstack-logo.webp', type: 'image/webp' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/xstack-logo.webp',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/xstack-logo.webp" type="image/webp" />
      </head>
      <body className={`${inter.className} bg-stone-50 text-slate-900 antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
