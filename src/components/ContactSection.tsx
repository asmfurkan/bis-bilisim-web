"use client";

import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, User, Printer, ClipboardList } from "lucide-react";
import { CONTACT } from "@/lib/contact";

const NAME_PATTERN = "^[A-Za-zÇçĞğİıÖöŞşÜü\\s'-]{2,60}$";
const PHONE_PATTERN = "^(\\+90|0)?[\\s.-]?5\\d{2}[\\s.-]?\\d{3}[\\s.-]?\\d{2}[\\s.-]?\\d{2}$";

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    // Honeypot: bots fill every field, real users never see or touch this one.
    const honeypot = (new FormData(form).get("company_website") as string) ?? "";
    if (honeypot.trim() !== "") {
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    // Client-side checks are UX only, not a trust boundary — any real backend
    // that eventually receives this payload must re-validate and sanitize it.
    setSubmitted(true);
  }

  return (
    <section id="iletisim" className="scroll-mt-24 bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold uppercase tracking-wide text-blue-800">
            Servis & Arıza Kaydı
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Arıza Kaydı Oluşturun
          </p>
          <p className="mt-4 text-lg text-slate-600">
            Cihazınızın arızasını bize iletin, ekibimiz en kısa sürede sizinle
            iletişime geçsin.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-900/5 lg:col-span-3 sm:p-10">
            {submitted ? (
              <div className="animate-fade-in-up flex h-full min-h-80 flex-col items-center justify-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  Arıza Kaydınız Alındı
                </h3>
                <p className="mt-2 max-w-sm text-sm text-slate-600">
                  Ekibimiz en kısa sürede sizinle iletişime geçerek cihazınızın
                  durumu hakkında bilgi verecek.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <input
                  type="text"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="sr-only"
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Ad Soyad
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        minLength={2}
                        maxLength={60}
                        pattern={NAME_PATTERN}
                        title="Yalnızca harf, boşluk ve tire içermelidir (2-60 karakter)"
                        placeholder="Adınız Soyadınız"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-800 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Telefon
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        maxLength={17}
                        pattern={PHONE_PATTERN}
                        title="Geçerli bir Türkiye cep telefonu numarası girin (örn. 0532 123 45 67)"
                        placeholder="05XX XXX XX XX"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-800 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="device" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Cihaz / Yazıcı Modeli
                  </label>
                  <div className="relative">
                    <Printer className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="device"
                      name="device"
                      type="text"
                      required
                      maxLength={80}
                      placeholder="Örn. Epson L3250"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-800 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Arıza Özeti
                  </label>
                  <div className="relative">
                    <ClipboardList className="pointer-events-none absolute top-3.5 left-3.5 h-4.5 w-4.5 text-slate-400" />
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      minLength={10}
                      maxLength={1000}
                      placeholder="Cihazınızda yaşadığınız sorunu kısaca anlatın..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-800 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-all hover:-translate-y-0.5 hover:bg-blue-900 hover:shadow-xl hover:shadow-amber-400/40 active:translate-y-0 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                >
                  Arıza Kaydı Oluştur
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-900/5">
              <h3 className="text-lg font-bold text-slate-900">İletişim Bilgileri</h3>
              <p className="mt-1 text-sm text-slate-500">
                Sorularınız için bize aşağıdaki kanallardan ulaşabilirsiniz.
              </p>

              <div className="mt-6 space-y-2">
                <a
                  href={CONTACT.phoneHref}
                  className="group flex items-start gap-3.5 rounded-2xl p-2 transition-colors hover:bg-blue-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800 transition-colors group-hover:bg-blue-800 group-hover:text-white">
                    <Phone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Telefon</p>
                    <p className="text-sm font-semibold text-slate-900">{CONTACT.phoneDisplay}</p>
                  </div>
                </a>
                <a
                  href={CONTACT.emailHref}
                  className="group flex items-start gap-3.5 rounded-2xl p-2 transition-colors hover:bg-blue-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800 transition-colors group-hover:bg-blue-800 group-hover:text-white">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-500">E-posta</p>
                    <p className="text-sm font-semibold text-slate-900">{CONTACT.email}</p>
                  </div>
                </a>
                <div className="flex items-start gap-3.5 rounded-2xl p-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Adres</p>
                    <p className="text-sm font-semibold text-slate-900">{CONTACT.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Çalışma Saatleri</p>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                <span>Pazartesi – Cuma</span>
                <span className="font-medium text-slate-900">09:00 – 18:00</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                <span>Cumartesi</span>
                <span className="font-medium text-cyan-600">10:00 – 15:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
