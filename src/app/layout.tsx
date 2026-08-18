import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BİS Bilişim | Epson Yetkili Servis & Yazıcı Çözümleri",
  description:
    "Yazıcı, tarayıcı ve kurumsal baskı sistemleriniz için orijinal parça garantili, hızlı ve profesyonel teknik servis desteği.",
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
      </body>
    </html>
  );
}
