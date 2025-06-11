import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from 'sonner';
import { NavigationProvider } from '@/lib/navigation-context';
import { Transition } from '@/components/ui/transition';
import { CityProvider } from '@/lib/city-context';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Forever N Co. - Your One-Stop Wedding Wonderland',
  description: 'Plan your dream Indian wedding with our comprehensive e-commerce platform. From venues to photographers, we make your special day stress-free.',
  keywords: 'Indian wedding, wedding planning, wedding services, wedding vendors, wedding packages',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <AuthProvider>
          <NavigationProvider>
            <CityProvider>
              <Transition>
                {children}
              </Transition>
            </CityProvider>
          </NavigationProvider>
        </AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: 'black',
              border: '1px solid #e5e7eb',
            },
          }}
        />
      </body>
    </html>
  );
}