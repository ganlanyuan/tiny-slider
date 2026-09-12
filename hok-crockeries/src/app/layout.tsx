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

// Bengali face, so a workspace named in Bangla still renders correctly.
const hind = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Hok Crockeries — distribution, inventory and accounts',
    template: '%s · Hok Crockeries',
  },
  description:
    'Run a wholesale distribution business on one ledger: stock in, stock out to sales reps, market sales, deposits, expenses and payroll.',
  keywords: [
    'distribution software',
    'inventory management',
    'sales rep management',
    'wholesale accounting',
    'crockery',
  ],
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
    <html lang="en" suppressHydrationWarning>
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
