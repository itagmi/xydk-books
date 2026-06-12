import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: '책 기록',
  description: '독서 여정을 기록하고 AI로 독후감을 만드는 서비스',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '책 기록',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={geist.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased" suppressHydrationWarning>
        <div className="mx-auto max-w-2xl px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
