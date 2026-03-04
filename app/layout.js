import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import AuthProvider from "@/components/Providers/AuthProvider";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

import { SITE_URL, SHARED_TITLE, SHARED_DESCRIPTION, SHARED_KEYWORDS } from './shared-metadata';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1F4B40',
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: SHARED_TITLE,
  description: SHARED_DESCRIPTION,
  keywords: SHARED_KEYWORDS,
  applicationName: 'Les Amis Du CBD',
  authors: [{ name: 'Les Amis Du CBD', url: SITE_URL }],
  creator: 'Les Amis Du CBD',
  publisher: 'Les Amis Du CBD',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: SHARED_TITLE,
    description: SHARED_DESCRIPTION,
    url: SITE_URL,
    siteName: 'Les Amis Du CBD',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/images/og-image.jpg', // Ensure this image exists or create a placeholder task
        width: 1200,
        height: 630,
        alt: 'Les Amis Du CBD - Boutique Premium',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SHARED_TITLE.default,
    description: SHARED_DESCRIPTION,
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

import JsonLd from "@/components/JsonLd";
import CartDrawer from "@/components/Cart/CartDrawer";

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={bricolage.className} suppressHydrationWarning>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <JsonLd />
              <ScrollToTop />
              {children}
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
