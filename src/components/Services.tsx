import { Printer, Droplets, PackageCheck, Network } from "lucide-react";

const services = [
  {
    icon: Printer,
    title: "Yazıcı & Donanım Onarımı",
    description: "Mekanik arızalar, kağıt besleme, anakart ve sensör tamiri.",
  },
  {
    icon: Droplets,
    title: "Periyodik Bakım & Kafa Temizliği",
    description: "Mürekkep yolları bakımı, baskı kafası açma ve pad değişimi.",
  },
  {
    icon: PackageCheck,
    title: "Orijinal Sarf Malzeme & Parça",
    description: "Orijinal mürekkep, toner ve Epson yedek parça temini.",
  },
  {
    icon: Network,
    title: "Kurumsal Kurulum & Ağ Desteği",
    description: "Ofis yazıcı altyapısı, ağ bağlantısı ve sürücü kurulumları.",
  },
];

export default function Services() {
  return (
    <section id="hizmetler" className="scroll-mt-24 bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold uppercase tracking-wide text-blue-800">
            Hizmetlerimiz
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Yazıcınız İçin Uçtan Uca Teknik Servis
          </p>
          <p className="mt-4 text-lg text-slate-600">
            Epson yetkili servis standartlarında, orijinal parça garantili
            onarım ve bakım hizmetleri sunuyoruz.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/10"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-cyan-500 via-blue-800 to-amber-500 transition-transform duration-300 group-hover:scale-x-100"
              />
              <span className="absolute top-6 right-7 text-sm font-bold text-slate-100 transition-colors group-hover:text-blue-100">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-800 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-800 group-hover:text-white">
                <Icon className="h-6 w-6" strokeWidth={2.25} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
