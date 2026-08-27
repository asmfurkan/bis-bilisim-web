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
const SITE_TITLE = "BİS Bilişim Teknolojileri | Ankara Epson Yetkili Servisi";
const SITE_DESCRIPTION =
  "Ankara Epson Yetkili Servisi BİS Bilişim Teknolojileri. Öveçler'deki servisimizde Epson yazıcı tamiri, Epson L3150, L3250, EcoTank teknik servis, satış ve kurumsal bilişim çözümleri sunuyoruz.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "Ankara Epson Yetkili Servisi",
    "Epson Yazıcı Tamiri Ankara",
    "Öveçler Epson Servisi",
    "Epson L3150 Teknik Servis Ankara",
    "Epson L3250 Teknik Servis Ankara",
    "Epson EcoTank Teknik Servis Ankara",
    "Çankaya Epson Servisi",
  ],
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
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  verification: {
    google: "rBH9I34PqgHyetjVIyK44wVVQ5pNQvtKZHhgmhA0FcA",
  },
};

const LOCAL_BUSINESS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "BİS Bilişim Teknolojileri - Ankara Epson Yetkili Servisi",
  description:
    "Ankara genelinde resmi Epson yetkili servisi olarak garantili ve orijinal parça ile yazıcı bakım onarım hizmeti.",
  url: SITE_URL,
  telephone: "+903124181213",
  email: "info@bisbilisim.com.tr",
  image: `${SITE_URL}/bisbilisim-logo.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "A.Öveçler Mah. 1308 Cad. No:14/A",
    addressLocality: "Çankaya",
    addressRegion: "Ankara",
    addressCountry: "TR",
  },
  areaServed: "Ankara",
  priceRange: "$$",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSON_LD) }}
        />
        {children}
        <WhatsAppButton />
        <CookieConsent />
      </body>
    </html>
  );
}
