import { PackageCheck, Search, BadgeCheck, FileCheck } from "lucide-react";

const trustPoints = [
  {
    icon: PackageCheck,
    title: "%100 Orijinal Parça",
    description: "Epson standartlarında orijinal yedek parça ve sarf malzemesi kullanıyoruz.",
    iconBg: "bg-blue-50",
    iconText: "text-blue-800",
  },
  {
    icon: Search,
    title: "Hızlı Arıza Tespiti",
    description: "Cihazınız için aynı gün durum ve maliyet bilgilendirmesi yapıyoruz.",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
  },
  {
    icon: BadgeCheck,
    title: "Yetkili Servis Güvencesi",
    description: "Sertifikalı standartlarda profesyonel teknik müdahale sağlıyoruz.",
    iconBg: "bg-cyan-50",
    iconText: "text-cyan-600",
  },
  {
    icon: FileCheck,
    title: "Garantili İşçilik",
    description: "Yapılan tüm bakım ve onarımlarda servis güvencesi sunuyoruz.",
    iconBg: "bg-blue-50",
    iconText: "text-blue-800",
  },
];

export default function TrustCards() {
  return (
    <section id="hakkimizda" className="relative -mt-12 scroll-mt-24 px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/10 sm:grid-cols-2 sm:p-8 lg:grid-cols-4 lg:gap-6">
        {trustPoints.map(({ icon: Icon, title, description, iconBg, iconText }) => (
          <div
            key={title}
            className="group flex flex-col items-start gap-3 rounded-2xl p-4 transition-colors hover:bg-blue-50/60"
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconText} transition-transform duration-300 group-hover:scale-110`}
            >
              <Icon className="h-6 w-6" strokeWidth={2.25} />
            </span>
            <div>
              <p className="font-bold text-slate-900">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
