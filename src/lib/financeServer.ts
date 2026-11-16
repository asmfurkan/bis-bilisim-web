import { getSupabaseAdmin } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import type { Receivable, ReceivablePayment } from "@/lib/finance";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

export function toReceivable(row: TransactionRow, payments: ReceivablePayment[] = []): Receivable {
  const amount = Number(row.amount);
  const paidAmount = Number(row.paid_amount ?? 0);
  return {
    id: row.id,
    type: row.type === "borc" ? "borc" : "alacak",
    customerName: row.customer_name || row.contact_name || "—",
    phone: row.customer_phone ?? "",
    title: row.title ?? "",
    description: row.description ?? "",
    deviceInfo: row.device_info,
    currency: row.currency === "USD" ? "USD" : "TRY",
    amount,
    // Yalnızca ödeme girişi/tutarı hiç olmayan ve elle "ödendi" işaretlenmiş eski kayıtlar tam ödenmiş sayılır;
    // kısmi tahsilatta ödenen tutar neyse o gösterilir.
    paid: row.status === "odendi" && paidAmount === 0 && payments.length === 0 ? amount : paidAmount,
    dueDate: row.due_date,
    note: row.notes,
    paymentMethod: row.payment_method ?? null,
    status: row.status ?? "bekliyor",
    createdAt: row.created_at,
    payments,
  };
}

/** Ödeme loglarını ayrı sorguyla çeker; tablo/kolon sorunu olursa boş döner (liste bozulmaz). */
export async function fetchPayments(ids: string[]) {
  const map = new Map<string, ReceivablePayment[]>();
  if (ids.length === 0) return map;
  const { data, error } = await getSupabaseAdmin()
    .from("payment_logs")
    .select("*")
    .in("transaction_id", ids)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Finans ödeme logları alınamadı:", error);
    return map;
  }
  for (const p of data ?? []) {
    const list = map.get(p.transaction_id) ?? [];
    list.push({ id: p.id, amount: Number(p.amount), paidAt: p.created_at, note: p.note, method: p.payment_method ?? null });
    map.set(p.transaction_id, list);
  }
  return map;
}

export async function fetchReceivable(id: string) {
  const { data, error } = await getSupabaseAdmin().from("transactions").select("*").eq("id", id).single();
  if (error) throw error;
  const payments = await fetchPayments([id]);
  return toReceivable(data, payments.get(id) ?? []);
}

export function parseAmount(value: unknown) {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

/** Müşteri adlarını customers tablosuna ekler (olanlar atlanır). Hata olursa kayıt akışını bozmaz. */
export async function ensureCustomers(list: { name: string; phone?: string | null }[]) {
  try {
    const wanted = new Map<string, { name: string; phone: string | null }>();
    for (const c of list) {
      const name = c.name.trim();
      if (!name || name === "—") continue;
      const key = name.toLocaleLowerCase("tr-TR");
      if (!wanted.has(key)) wanted.set(key, { name, phone: c.phone?.trim() || null });
    }
    if (wanted.size === 0) return;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("customers").select("name");
    if (error) throw error;
    const known = new Set((data ?? []).map((r) => r.name.trim().toLocaleLowerCase("tr-TR")));
    const rows = [...wanted.entries()].filter(([k]) => !known.has(k)).map(([, v]) => v);
    if (rows.length === 0) return;
    const { error: insertError } = await supabase.from("customers").insert(rows);
    if (insertError) throw insertError;
  } catch (error) {
    console.error("Cari (customers) kaydı yapılamadı:", error);
  }
}

const METHODS = ["Nakit", "Havale", "Fiş", "Banka POS", "Şahsi Kart"];
/** Bilinen ödeme yöntemlerinden birini döndürür, aksi halde null. */
export function parseMethod(value: unknown) {
  const v = typeof value === "string" ? value.trim() : "";
  return METHODS.includes(v) ? v : null;
}
