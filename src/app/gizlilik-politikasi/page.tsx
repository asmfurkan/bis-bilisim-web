import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CONTACT } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | BİS Bilişim Teknolojileri",
  description:
    "BİS Bilişim Teknolojileri (Epson Yetkili Servisi) web sitesi Gizlilik Politikası ve çerez kullanımı hakkında bilgilendirme.",
};

export default function GizlilikPolitikasiPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-base font-semibold uppercase tracking-wide text-blue-800">
                Gizliliğiniz Bizim İçin Önemli
              </h1>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Gizlilik Politikası
              </p>
              <p className="mt-4 text-lg text-slate-600">
                Bu Gizlilik Politikası, BİS Bilişim Teknolojileri (Epson
                Yetkili Servisi) web sitesini ziyaret ettiğinizde ve
                hizmetlerimizden faydalandığınızda kişisel verilerinizin
                nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <article className="space-y-10 text-sm leading-7 text-slate-600">
              <div>
                <h2 className="text-xl font-bold text-slate-900">1. Genel Bilgilendirme</h2>
                <p className="mt-3">
                  BİS Bilişim Teknolojileri olarak (&quot;Şirket&quot;, &quot;biz&quot;)
                  bisbilisim.com.tr alan adlı web sitemizi (&quot;Site&quot;)
                  ziyaret eden ve hizmetlerimizi kullanan kullanıcılarımızın
                  gizliliğini korumayı taahhüt ediyoruz. Bu politika, hangi
                  bilgilerin toplandığını, bu bilgilerin nasıl kullanıldığını
                  ve haklarınızı açıklamaktadır. Kişisel verilerin işlenmesine
                  ilişkin detaylı bilgiye{" "}
                  <a href="/kvkk" className="font-semibold text-blue-800 hover:underline">
                    KVKK Aydınlatma Metni
                  </a>{" "}
                  sayfamızdan ulaşabilirsiniz.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">2. Toplanan Bilgiler</h2>
                <p className="mt-3">
                  Sitemiz üzerinden arıza kaydı formunu doldurduğunuzda veya
                  bizimle iletişime geçtiğinizde; ad soyad, telefon numarası,
                  e-posta adresi, cihaz/yazıcı modeli ve arıza açıklaması gibi
                  bilgileri toplayabiliriz. Ayrıca siteyi ziyaretiniz sırasında
                  cihaz bilgileri, IP adresi, tarayıcı türü ve ziyaret
                  tarihleri gibi teknik bilgiler otomatik olarak
                  kaydedilebilir.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">3. Çerezler (Cookies)</h2>
                <p className="mt-3">
                  Sitemiz, kullanıcı deneyimini iyileştirmek, site
                  performansını ölçmek ve tercihlerinizi hatırlamak amacıyla
                  çerezler kullanabilir. Tarayıcınızın ayarlarını değiştirerek
                  çerezleri devre dışı bırakabilir veya çerez kullanımı
                  konusunda uyarı almayı tercih edebilirsiniz; ancak bu durum
                  sitenin bazı özelliklerinin düzgün çalışmamasına neden
                  olabilir.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  4. Bilgilerin Kullanım Amacı
                </h2>
                <p className="mt-3">
                  Toplanan bilgiler; arıza kaydınızın oluşturulması ve takibi,
                  size ulaşılarak servis/destek sürecinin yürütülmesi, teknik
                  destek taleplerinizin yanıtlanması, sitemizin ve
                  hizmetlerimizin geliştirilmesi ile yasal yükümlülüklerimizin
                  yerine getirilmesi amacıyla kullanılır. Bilgileriniz,
                  açık rızanız veya yasal bir zorunluluk olmadıkça pazarlama
                  amacıyla üçüncü taraflarla paylaşılmaz.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  5. Üçüncü Taraf Hizmetler ve Bağlantılar
                </h2>
                <p className="mt-3">
                  Sitemiz, WhatsApp üzerinden iletişim gibi üçüncü taraf
                  hizmetlere yönlendiren bağlantılar içerebilir. Bu tür
                  üçüncü taraf platformlara yönlendirildiğinizde, ilgili
                  platformun kendi gizlilik politikası ve kullanım koşulları
                  geçerli olur; bu platformların gizlilik uygulamalarından
                  Şirketimiz sorumlu değildir.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">6. Veri Güvenliği</h2>
                <p className="mt-3">
                  Kişisel verilerinizin güvenliğini sağlamak amacıyla makul
                  teknik ve idari tedbirler alıyoruz. Ancak internet üzerinden
                  yapılan hiçbir veri iletiminin veya elektronik depolamanın
                  %100 güvenli olmadığını, mutlak güvenliğin garanti
                  edilemeyeceğini belirtmek isteriz.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  7. Haklarınız
                </h2>
                <p className="mt-3">
                  6698 sayılı KVKK kapsamındaki haklarınız (kişisel
                  verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini
                  veya silinmesini talep etme dahil) hakkında detaylı bilgi
                  için{" "}
                  <a href="/kvkk" className="font-semibold text-blue-800 hover:underline">
                    KVKK Aydınlatma Metni
                  </a>{" "}
                  sayfamızı inceleyebilir, taleplerinizi aşağıdaki iletişim
                  bilgilerimiz üzerinden bize iletebilirsiniz.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  8. Politikada Değişiklikler
                </h2>
                <p className="mt-3">
                  Bu Gizlilik Politikası, yasal düzenlemeler veya iş
                  süreçlerimizdeki değişikliklere bağlı olarak zaman zaman
                  güncellenebilir. Güncel politika her zaman bu sayfada
                  yayımlanır.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">9. İletişim</h2>
                <p className="mt-3">
                  Gizlilik Politikamız hakkında sorularınız için bizimle
                  aşağıdaki kanallardan iletişime geçebilirsiniz.
                </p>
                <p className="mt-3">
                  E-posta:{" "}
                  <a href={CONTACT.emailHref} className="font-semibold text-blue-800 hover:underline">
                    {CONTACT.email}
                  </a>
                  <br />
                  Telefon:{" "}
                  <a href={CONTACT.phoneHref} className="font-semibold text-blue-800 hover:underline">
                    {CONTACT.phoneDisplay}
                  </a>
                  <br />
                  Adres: {CONTACT.address}
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
