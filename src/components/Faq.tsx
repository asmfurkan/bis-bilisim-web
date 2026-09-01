"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Orijinal Epson sarf malzemesi ve yedek parça mı kullanıyorsunuz?",
    answer:
      "Evet. Epson Yetkili Servisi olarak tüm bakım ve onarım işlemlerinde yalnızca %100 orijinal Epson mürekkep, toner ve yedek parça kullanıyoruz. Bu sayede cihazınızın performansı ve ömrü üretici standartlarında korunur.",
  },
  {
    question: "Cihaz tamiri ne kadar sürer?",
    answer:
      "Süre arızanın niteliğine göre değişir. Periyodik bakım ve baskı kafası temizliği gibi işlemler genellikle aynı gün içinde, parça değişimi gerektiren onarımlar ise 1-3 iş günü içinde tamamlanır. Cihazınızı teslim aldığımızda size net bir süre bilgisi veriyoruz.",
  },
  {
    question: "Yetkili servis garantisi var mı?",
    answer:
      "Evet. Epson Yetkili Servisi olarak gerçekleştirdiğimiz tüm onarım ve bakım işlemleri garanti kapsamındadır; kullanılan orijinal parçalar da üretici garantisiyle korunur.",
  },
  {
    question: "Onarım öncesi ücret talep ediyor musunuz?",
    answer:
      "Hayır. Cihazınızı teslim aldığımızda önce ücretsiz ön inceleme yapıyor, onarım kapsamı ve maliyetini onayınıza sunuyoruz. Onayınız olmadan hiçbir işlem veya ücretlendirme yapılmaz.",
  },
  {
    question: "Hangi Epson cihaz modellerine servis veriyorsunuz?",
    answer:
      "Ev ve ofis tipi mürekkep tanklı yazıcılardan kurumsal çok fonksiyonlu yazıcılara, tarayıcılara ve etiket yazıcılarına kadar geniş bir Epson ürün yelpazesine teknik servis desteği sağlıyoruz.",
  },
  {
    question: "Ankara'nın hangi bölgelerine Epson yetkili servis hizmeti veriyorsunuz?",
    answer:
      "Çankaya/Öveçler'deki servis merkezimizden başta olmak üzere Ankara genelinde; Öveçler, Bahçelievler, Kızılay, Dikmen, Balgat ve çevre ilçeler dahil tüm Ankara'ya Epson yetkili servis hizmeti sunuyoruz.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="sss" className="scroll-mt-24 bg-white py-24 sm:py-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold uppercase tracking-wide text-blue-800">
            Merak Edilenler
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Sıkça Sorulan Sorular
          </p>
          <p className="mt-4 text-lg text-slate-600">
            Epson yetkili servis sürecimizle ilgili en çok merak edilen
            soruları sizin için yanıtladık.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl space-y-4">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-blue-100"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-base font-semibold text-slate-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    aria-hidden
                    className={`h-5 w-5 shrink-0 text-blue-800 transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-7 text-slate-600">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
