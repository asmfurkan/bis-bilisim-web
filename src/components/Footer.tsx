import Image from "next/image";
import { Briefcase, Send, Camera, ThumbsUp } from "lucide-react";
import { CONTACT } from "@/lib/contact";

const quickLinks = [
  { label: "Hizmetlerimiz", href: "#hizmetler" },
  { label: "Hakkımızda", href: "#hakkimizda" },
  { label: "Süreç", href: "#surec" },
  { label: "İletişim", href: "#iletisim" },
];

const socials = [
  { icon: Briefcase, label: "LinkedIn", href: "#" },
  { icon: Send, label: "Twitter", href: "#" },
  { icon: Camera, label: "Instagram", href: "#" },
  { icon: ThumbsUp, label: "Facebook", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-200 bg-white">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/0 via-blue-800 to-amber-500/0"
      />
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="#top" className="group flex items-center transition-transform group-hover:scale-105">
              <Image
                src="/bisbilisim-seffaflogo.png"
                alt="BİS Bilişim Teknolojileri"
                width={505}
                height={159}
                className="h-10 w-auto"
              />
            </a>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              Epson yetkili servis güvencesiyle yazıcı, tarayıcı ve kurumsal
              baskı sistemleriniz için profesyonel teknik destek sağlıyoruz.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Hızlı Linkler</h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="inline-block text-sm text-slate-500 transition-all hover:translate-x-0.5 hover:text-blue-800"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">İletişim</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              <li>
                <a href={CONTACT.emailHref} className="transition-colors hover:text-blue-800">
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a href={CONTACT.phoneHref} className="transition-colors hover:text-blue-800">
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>{CONTACT.address}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Bizi Takip Edin</h3>
            <div className="mt-4 flex gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-blue-800 hover:text-white hover:shadow-md hover:shadow-blue-900/30"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center gap-4 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 sm:flex-row sm:justify-between">
          <p>© 2026 BİS Bilişim. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-5">
            <a href="/kvkk" className="transition-colors hover:text-blue-800">
              KVKK Aydınlatma Metni
            </a>
            <a href="/gizlilik-politikasi" className="transition-colors hover:text-blue-800">
              Gizlilik Politikası
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
