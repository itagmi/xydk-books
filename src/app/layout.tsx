import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { getSiteUrl } from '@/lib/site';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

const siteDescription =
  '나의 독서 여정을 기록하고 AI로 독후감을 만드는 서비스';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Ginkgo — 나의 독서 여정',
    template: '%s | Ginkgo',
  },
  description: siteDescription,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ginkgo',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: 'Ginkgo',
    title: 'Ginkgo — 나의 독서 여정',
    description: siteDescription,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ginkgo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ginkgo — 나의 독서 여정',
    description: siteDescription,
    images: ['/og-image.png'],
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
