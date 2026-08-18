"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";
import { CONTACT } from "@/lib/contact";

const navLinks = [
  { label: "Hizmetlerimiz", href: "#hizmetler" },
  { label: "Hakkımızda", href: "#hakkimizda" },
  { label: "Süreç", href: "#surec" },
  { label: "İletişim", href: "#iletisim" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg transition-shadow duration-300 ${
        scrolled ? "border-slate-200/70 shadow-sm shadow-slate-900/5" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
        <a href="#top" className="group flex items-center transition-transform group-hover:scale-105">
          <Image
            src="/bisbilisim-logo.png"
            alt="BİS Bilişim Teknolojileri"
            width={1266}
            height={396}
            priority
            className="h-9 w-auto lg:h-10"
          />
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="group relative px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-800"
            >
              {link.label}
              <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-amber-500 transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            href={CONTACT.phoneHref}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-800"
          >
            <Phone className="h-4 w-4 text-blue-800" strokeWidth={2.25} />
            {CONTACT.phoneDisplay}
          </a>
          <a
            href="#iletisim"
            className="rounded-full bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/30 transition-all hover:-translate-y-0.5 hover:bg-blue-900 hover:shadow-lg hover:shadow-amber-400/40 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
          >
            Arıza Kaydı
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-800 lg:hidden"
          aria-label="Menüyü aç/kapat"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="animate-fade-in-up border-t border-slate-200/70 bg-white/95 backdrop-blur-lg lg:hidden">
          <nav className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-800"
              >
                {link.label}
              </a>
            ))}
            <a
              href={CONTACT.phoneHref}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-800"
            >
              <Phone className="h-4 w-4 text-blue-800" strokeWidth={2.25} />
              {CONTACT.phoneDisplay}
            </a>
            <a
              href="#iletisim"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-blue-800 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-blue-900/30 transition-colors hover:bg-blue-900"
            >
              Arıza Kaydı
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
