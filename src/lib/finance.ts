export type Currency = "TRY" | "USD";

export interface ReceivablePayment {
  id: string;
  amount: number;
  paidAt: string;
  note: string | null;
}

export interface Receivable {
  id: string;
  type: "alacak" | "borc";
  customerName: string;
  phone: string;
  title: string;
  description: string;
  deviceInfo: string | null;
  /** "USD" kayıtlarda amount / paid dolar cinsindendir. */
  currency: Currency;
  amount: number;
  /** Tahsil edilen toplam (status "odendi" ise tutarın tamamı). */
  paid: number;
  dueDate: string | null;
  note: string | null;
  status: string;
  createdAt: string;
  payments: ReceivablePayment[];
}

export function paidTotal(r: Receivable) {
  return r.paid;
}

/** Kalan bakiye. Fazla ödemede negatif döner (alacaklı). */
export function remaining(r: Receivable) {
  return Math.round((r.amount - r.paid) * 100) / 100;
}

/** Kayıt para biriminden TL karşılığı (USD için kur ile çarpılır). */
export function toTRY(r: Receivable, value: number, rate: number | null) {
  if (r.currency !== "USD") return value;
  return Math.round(value * (rate ?? 0) * 100) / 100;
}

export function formatMoney(value: number, currency: Currency) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(value);
}

export function isOverdue(r: Receivable) {
  if (!r.dueDate || remaining(r) <= 0) return false;
  const today = new Date().toISOString().slice(0, 10);
  return r.dueDate < today;
}

export function formatTRY(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);
}

export function whatsappReminderHref(r: Receivable) {
  let digits = r.phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `90${digits.slice(1)}`;
  else if (digits.length === 10) digits = `90${digits}`;

  const what = r.description || r.title;
  const text =
    `Merhaba ${r.customerName}, BİS Bilişim Teknolojileri'ne ait ${formatMoney(Math.max(0, remaining(r)), r.currency)} bakiyeniz bulunmaktadır` +
    (what ? ` (${what})` : "") +
    (r.dueDate ? `, vade tarihi ${new Date(r.dueDate).toLocaleDateString("tr-TR")}` : "") +
    `. Müsait olduğunuzda ödemenizi rica ederiz. Teşekkürler.`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
