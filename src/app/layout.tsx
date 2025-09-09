// app/layout.tsx

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import ReduxProvider from '@/store/ReduxProvider';
import QueryProvider from '@/providers/QueryProvider';
import AuthDebug from '@/components/AuthDebug';
import TokenRefresh from '@/components/TokenRefresh';
import 'antd/dist/reset.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MangaHub',
  description: 'A manga reading platform',
  icons: {
    icon: '/img/favico.ico',
    shortcut: '/img/favico.ico',
    apple: '/img/favico.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <ReduxProvider>
            <TokenRefresh />
            <Header />
            <main className="pt-16">{children}</main>
            <AuthDebug />
          </ReduxProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
