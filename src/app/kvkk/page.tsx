import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CONTACT } from "@/lib/contact";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | BİS Bilişim Teknolojileri",
  description:
    "BİS Bilişim Teknolojileri (Epson Yetkili Servisi) 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında KVKK Aydınlatma Metni.",
};

export default function KvkkPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-base font-semibold uppercase tracking-wide text-blue-800">
                6698 Sayılı Kanun Kapsamında
              </h1>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                KVKK Aydınlatma Metni
              </p>
              <p className="mt-4 text-lg text-slate-600">
                BİS Bilişim Teknolojileri olarak kişisel verilerinizin
                güvenliğine önem veriyor, 6698 sayılı Kişisel Verilerin
                Korunması Kanunu (&quot;KVKK&quot;) kapsamındaki yükümlülüklerimizi
                yerine getiriyoruz.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <article className="prose-legal space-y-10 text-sm leading-7 text-slate-600">
              <div>
                <h2 className="text-xl font-bold text-slate-900">1. Veri Sorumlusu</h2>
                <p className="mt-3">
                  6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
                  uyarınca, Epson Yetkili Servisi olarak faaliyet gösteren
                  BİS Bilişim Teknolojileri (&quot;Şirket&quot;), veri sorumlusu
                  sıfatıyla kişisel verilerinizi aşağıda açıklanan kapsamda
                  işleyebilecektir.
                </p>
                <p className="mt-3">
                  Adres: {CONTACT.address}
                  <br />
                  E-posta:{" "}
                  <a href={CONTACT.emailHref} className="font-semibold text-blue-800 hover:underline">
                    {CONTACT.email}
                  </a>
                  <br />
                  Telefon:{" "}
                  <a href={CONTACT.phoneHref} className="font-semibold text-blue-800 hover:underline">
                    {CONTACT.phoneDisplay}
                  </a>
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  2. Kişisel Verilerin İşlenme Amacı
                </h2>
                <p className="mt-3">
                  Toplanan kişisel verileriniz; Epson yazıcı, tarayıcı ve
                  kurumsal baskı sistemlerine yönelik teknik servis, bakım,
                  onarım ve arıza kaydı süreçlerinin yürütülmesi, müşteri
                  taleplerinin ve şikayetlerinin takibi, sözleşme süreçlerinin
                  yürütülmesi, iletişim faaliyetlerinin planlanması ve
                  icrası, çağrı merkezi ve destek hizmetlerinin sunulması,
                  yasal yükümlülüklerin yerine getirilmesi ve şirket
                  faaliyetlerinin mevzuata uygun yürütülmesi amaçlarıyla
                  KVKK&apos;nın 5. ve 6. maddelerinde belirtilen kişisel veri
                  işleme şartları dahilinde işlenmektedir.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  3. İşlenen Kişisel Veri Kategorileri
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>
                    <span className="font-semibold text-slate-800">Kimlik Bilgileri:</span>{" "}
                    ad, soyad
                  </li>
                  <li>
                    <span className="font-semibold text-slate-800">İletişim Bilgileri:</span>{" "}
                    telefon numarası, e-posta adresi, adres
                  </li>
                  <li>
                    <span className="font-semibold text-slate-800">
                      Müşteri İşlem / Servis Bilgileri:
                    </span>{" "}
                    arıza kaydı içeriği, cihaz/yazıcı model ve seri bilgileri,
                    servis geçmişi
                  </li>
                  <li>
                    <span className="font-semibold text-slate-800">İşlem Güvenliği Bilgileri:</span>{" "}
                    IP adresi, çerez kayıtları, log kayıtları
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  4. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi
                </h2>
                <p className="mt-3">
                  Kişisel verileriniz; web sitemizdeki iletişim ve arıza
                  kaydı formları, telefon, WhatsApp, e-posta ve şirketimizin
                  fiziksel servis noktaları aracılığıyla, otomatik veya
                  otomatik olmayan yöntemlerle elde edilmektedir. Bu veriler,
                  bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya
                  ilgili olması, hukuki yükümlülüğün yerine getirilmesi,
                  bir hakkın tesisi, kullanılması veya korunması için veri
                  işlemenin zorunlu olması ve açık rızanızın bulunması hukuki
                  sebeplerine dayanılarak işlenmektedir.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  5. Kişisel Verilerin Aktarılması
                </h2>
                <p className="mt-3">
                  Kişisel verileriniz; yasal yükümlülüklerimiz gereği yetkili
                  kamu kurum ve kuruluşlarına, Epson yetkili servis
                  faaliyetlerinin gereği olarak Epson Türkiye ve ilgili
                  tedarikçilere, hizmet aldığımız kargo/lojistik firmalarına
                  ve bilgi teknolojileri altyapı/hizmet sağlayıcılarımıza,
                  KVKK&apos;nın 8. ve 9. maddelerinde belirtilen kişisel veri
                  işleme şartları ve amaçları çerçevesinde ve gerekli
                  güvenlik önlemleri alınmak suretiyle aktarılabilmektedir.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  6. Kişisel Verilerin Saklanma Süresi
                </h2>
                <p className="mt-3">
                  Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre
                  boyunca ve ilgili mevzuatta öngörülen zamanaşımı süreleri
                  (Türk Ticaret Kanunu, Vergi Usul Kanunu ve Tüketicinin
                  Korunması Hakkında Kanun başta olmak üzere) saklanmakta,
                  bu sürelerin sona ermesini müteakip silinmekte, yok
                  edilmekte veya anonim hale getirilmektedir.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  7. KVKK&apos;nın 11. Maddesi Kapsamındaki Haklarınız
                </h2>
                <p className="mt-3">
                  KVKK&apos;nın 11. maddesi uyarınca kişisel veri sahibi olarak;
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>Kişisel verinizin işlenip işlenmediğini öğrenme,</li>
                  <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
                  <li>
                    İşlenme amacını ve amacına uygun kullanılıp
                    kullanılmadığını öğrenme,
                  </li>
                  <li>
                    Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri
                    bilme,
                  </li>
                  <li>
                    Eksik veya yanlış işlenmişse düzeltilmesini isteme,
                  </li>
                  <li>
                    KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde
                    silinmesini veya yok edilmesini isteme,
                  </li>
                  <li>
                    Düzeltme, silme ve yok edilme işlemlerinin, kişisel
                    verilerin aktarıldığı üçüncü kişilere bildirilmesini
                    isteme,
                  </li>
                  <li>
                    İşlenen verilerin münhasıran otomatik sistemler
                    vasıtasıyla analiz edilmesi suretiyle aleyhinize bir
                    sonucun ortaya çıkmasına itiraz etme,
                  </li>
                  <li>
                    Kanuna aykırı olarak işlenmesi sebebiyle zarara
                    uğramanız halinde zararın giderilmesini talep etme
                  </li>
                </ul>
                <p className="mt-3">haklarına sahipsiniz.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">8. Başvuru Yöntemi</h2>
                <p className="mt-3">
                  Yukarıda sayılan haklarınıza ilişkin taleplerinizi, kimliğinizi
                  tevsik edici belgelerle birlikte{" "}
                  <a href={CONTACT.emailHref} className="font-semibold text-blue-800 hover:underline">
                    {CONTACT.email}
                  </a>{" "}
                  adresine e-posta yoluyla veya{" "}
                  <span className="font-semibold text-slate-800">{CONTACT.address}</span>{" "}
                  adresine yazılı olarak iletebilirsiniz. Talepleriniz, niteliğine
                  göre en geç 30 (otuz) gün içinde ücretsiz olarak sonuçlandırılır.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  9. Diğer Hususlar
                </h2>
                <p className="mt-3">
                  Bu Aydınlatma Metni, yasal düzenlemeler ve şirket
                  politikalarındaki değişikliklere bağlı olarak güncellenebilir.
                  Web sitemizde kullanılan çerezler ve gizlilik uygulamalarımız
                  hakkında ayrıntılı bilgi için{" "}
                  <a href="/gizlilik-politikasi" className="font-semibold text-blue-800 hover:underline">
                    Gizlilik Politikası
                  </a>{" "}
                  sayfamızı inceleyebilirsiniz.
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
