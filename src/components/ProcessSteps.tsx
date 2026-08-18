import { ClipboardCheck, FileText, PackageCheck, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Cihaz Kabul & Ücretsiz Ön Muayene",
    description: "Cihazınızı teslim alıyor, arızayı ücretsiz olarak ön inceliyoruz.",
  },
  {
    icon: FileText,
    title: "Fiyat / Onarım Bilgilendirmesi",
    description: "Onarım kapsamını ve maliyeti onayınıza sunuyoruz, sürpriz ücret yok.",
  },
  {
    icon: PackageCheck,
    title: "Test & Garantili Teslimat",
    description: "Onarım sonrası test ediyor, cihazınızı garanti kapsamında teslim ediyoruz.",
  },
];

export default function ProcessSteps() {
  return (
    <section id="surec" className="scroll-mt-24 bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold uppercase tracking-wide text-blue-800">
            Servis Sürecimiz
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            3 Adımda Cihazınız Yeniden Çalışır Halde
          </p>
          <p className="mt-4 text-lg text-slate-600">
            Şeffaf ve öngörülebilir bir servis süreciyle cihazınızı güvenle
            teslim edin.
          </p>
        </div>

        <div className="mt-16 flex flex-col items-stretch gap-6 lg:flex-row lg:items-center lg:gap-4">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="flex flex-1 items-center gap-4">
              <div className="flex flex-1 flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-800 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                  <Icon className="h-6 w-6" strokeWidth={2.25} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <ArrowRight
                  aria-hidden
                  className="hidden h-6 w-6 shrink-0 text-amber-500 lg:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
