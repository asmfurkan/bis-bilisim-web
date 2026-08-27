import Image from "next/image";
import { ArrowRight, BadgeCheck, Wrench } from "lucide-react";

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[640px] scroll-mt-24 items-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80"
        alt="Teknik servis atölyesinde yazıcı bakımı yapan teknisyen"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-blue-950/92 via-blue-950/85 to-slate-950/90"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-8">
        <div className="max-w-2xl">
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
            <BadgeCheck className="h-4 w-4 text-amber-400" />
            Epson Yetkili Servis
          </div>

          <h1 className="animate-fade-in-up text-4xl font-extrabold leading-tight tracking-tight text-white [animation-delay:100ms] sm:text-5xl">
            BİS Bilişim — Epson Yetkili Servis &amp; Yazıcı Çözümleri
          </h1>

          <p className="animate-fade-in-up mt-6 max-w-xl text-lg leading-8 text-blue-100 [animation-delay:200ms]">
            Yazıcı, tarayıcı ve kurumsal baskı sistemleriniz için orijinal
            parça garantili, hızlı ve profesyonel teknik servis desteği.
          </p>

          <div className="animate-fade-in-up mt-10 flex flex-col gap-4 sm:flex-row [animation-delay:300ms]">
            <a
              href="#iletisim"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-7 py-3.5 text-base font-semibold text-blue-950 shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/40 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              <Wrench className="h-4.5 w-4.5" />
              Arıza Kaydı Oluştur
            </a>
            <a
              href="#hizmetler"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Hizmetlerimiz
              <ArrowRight className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>

        <div
          aria-hidden
          className="absolute right-8 bottom-8 hidden w-64 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-md lg:block xl:right-16"
        >
          <div className="relative h-32 w-full overflow-hidden rounded-lg bg-white">
            <Image
              src="/hizmet-ecotank-yazici.jpg"
              alt="Epson EcoTank yazıcı"
              fill
              loading="lazy"
              sizes="256px"
              className="object-contain"
            />
          </div>
          <p className="mt-3 text-center text-sm font-semibold text-blue-950">
            Epson EcoTank &amp; L3150 / L3250 Serisi Teknik Servis
          </p>
        </div>
      </div>
    </section>
  );
}
