
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';
import MobileDock from '@/components/mobile-dock';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Venusespor Gaming Cafe',
  description: 'Premium gaming experience with PC, PS5, Racing zones and delicious cafe menu',
  keywords: 'gaming, cafe, PC gaming, PS5, racing simulator, istanbul',
  openGraph: {
    title: 'Venusespor Gaming Cafe',
    description: 'Premium gaming experience with PC, PS5, Racing zones and delicious cafe menu',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <Header />
            {children}
            <Toaster />
            <MobileDock />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
