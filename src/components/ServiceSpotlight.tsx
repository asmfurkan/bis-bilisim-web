import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function ServiceSpotlight() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 rounded-2xl border border-blue-100 bg-blue-50/70 p-8 backdrop-blur-md sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
          <div className="order-1 flex justify-center lg:order-2">
            <Image
              src="/servis-kahramani.png"
              alt="BİS Bilişim servis kahramanı"
              width={350}
              height={441}
              className="h-auto w-full max-w-[260px] drop-shadow-xl sm:max-w-[300px]"
              priority={false}
            />
          </div>

          <div className="order-2 text-center lg:order-1 lg:text-left">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Sorunlarınızı Çözen, İşinizi Güçlendiren Servis Kahramanımız
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Bizim için her müşteri bir önceliktir. Epson sertifikalı
              uzmanlarımız, en karmaşık yazıcı sorunlarını bile hızlıca
              çözerek iş akışınızı kesintisiz sürdürmenizi sağlar.
            </p>
            <a
              href="#iletisim"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-7 py-3.5 text-base font-semibold text-blue-950 shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/40 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              Hemen Servis Talebi Oluştur
              <ArrowRight className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
