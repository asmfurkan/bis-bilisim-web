import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import WhatsAppButton from "@/components/WhatsAppButton";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://www.bisbilisim.com.tr";
const SITE_TITLE = "BİS Bilişim Teknolojileri | Epson Yetkili Servisi";
const SITE_DESCRIPTION =
  "BİS Bilişim Teknolojileri resmi web sitesi. Epson yetkili servis, satış, profesyonel teknik servis ve kurumsal bilişim çözümleri.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "BİS Bilişim",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/bisbilisim-logo.png",
        width: 1266,
        height: 396,
        alt: "BİS Bilişim Teknolojileri",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "rBH9I34PqgHyetjVIyK44wVVQ5pNQvtKZHhgmhA0FcA",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {children}
        <WhatsAppButton />
        <CookieConsent />
      </body>
    </html>
  );
}
