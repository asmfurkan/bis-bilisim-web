import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DeviceTrackingClient from "@/components/DeviceTrackingClient";

export const metadata: Metadata = {
  title: "Cihaz Servis Takip | BİS Bilişim Teknolojileri",
  description:
    "Takip numaranız veya telefon numaranızla cihazınızın servis durumunu anında sorgulayın.",
  robots: { index: false, follow: false },
};

export default function CihazTakipPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-base font-semibold uppercase tracking-wide text-blue-800">
              Servis Takibi
            </h1>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Cihazınızın Durumunu Sorgulayın
            </p>
            <p className="mt-4 text-lg text-slate-600">
              Servise teslim ederken size verilen takip numarası veya kayıtlı telefon
              numaranızla cihazınızın anlık servis durumunu görüntüleyin.
            </p>
          </div>

          <div className="mt-16">
            <DeviceTrackingClient />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
