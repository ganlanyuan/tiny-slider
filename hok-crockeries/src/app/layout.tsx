import type { Metadata, Viewport } from 'next';
import { Inter, Sora, Hind_Siliguri } from 'next/font/google';
import { Toaster } from 'sonner';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
});

// Bangla face, so ‘হক ক্রোকারিজ’ renders properly everywhere.
const hind = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'হক ক্রোকারিজ — Hok Crockeries',
    template: '%s · Hok Crockeries',
  },
  description:
    'Distribution, inventory, SR sales and accounts for Hok Crockeries — stock in, stock out, market demand, deposits and payroll in one place.',
  keywords: ['crockery', 'distribution', 'inventory', 'SR management', 'Bangladesh', 'হক ক্রোকারিজ'],
  applicationName: 'Hok Crockeries',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0c1018' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        {/* Applied before paint so a dark-mode reload never flashes white. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('hok-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m))document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${sora.variable} ${hind.variable} font-sans antialiased`}
        style={
          {
            '--font-sans': 'var(--font-inter), var(--font-hind), system-ui, sans-serif',
            '--font-display': 'var(--font-sora), var(--font-hind), system-ui, sans-serif',
          } as React.CSSProperties
        }
      >
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ className: 'font-sans text-sm' }}
        />
      </body>
    </html>
  );
}
