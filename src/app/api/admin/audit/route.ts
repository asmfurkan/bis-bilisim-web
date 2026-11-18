import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";
import type { Database } from "@/lib/database.types";

const fail = (error: string, status = 500) => NextResponse.json({ success: false, error }, { status });

type Tables = Database["public"]["Tables"];
type Snapshot = {
  transaction?: Tables["transactions"]["Row"] | null;
  payments?: Tables["payment_logs"]["Row"][];
  payment?: Tables["payment_logs"]["Row"] | null;
  customer?: Tables["customers"]["Row"] | null;
  account?: Tables["accounts"]["Row"] | null;
};

export async function GET() {
  if (!(await isAdminAuthenticated())) return fail("Yetkisiz erişim.", 401);
  const { data, error } = await getSupabaseAdmin()
    .from("audit_log")
    .select("id, created_at, entity, entity_id, action, summary, restored_at, snapshot")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) {
    console.error("Denetim kaydı okunamadı:", error);
    return fail(error.message);
  }
  return NextResponse.json({
    success: true,
    entries: data.map((e) => ({
      id: e.id,
      createdAt: e.created_at,
      entity: e.entity,
      action: e.action,
      summary: e.summary ?? "",
      restoredAt: e.restored_at,
      // Yalnızca silme kayıtları geri getirilebilir
      restorable: e.action === "delete" && !e.restored_at && e.snapshot != null,
    })),
  });
}

/** Silinen bir kaydı (alacak/borç + ödemeleri, tek ödeme, cari, hesap) geri getirir. */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return fail("Yetkisiz erişim.", 401);
  try {
    const body = await request.json();
    const auditId = typeof body?.id === "string" ? body.id : "";
    const supabase = getSupabaseAdmin();
    const { data: entry } = await supabase.from("audit_log").select("*").eq("id", auditId).single();
    if (!entry) return fail("Kayıt bulunamadı.", 404);
    if (entry.action !== "delete" || entry.restored_at) return fail("Bu kayıt geri getirilemez.", 400);
    const snap = (entry.snapshot ?? {}) as Snapshot;

    if (entry.entity === "transaction" && snap.transaction) {
      const { error } = await supabase.from("transactions").insert(snap.transaction);
      if (error) return fail(`Geri getirilemedi: ${error.message}`);
      if (snap.payments && snap.payments.length > 0) {
        const { error: payError } = await supabase.from("payment_logs").insert(snap.payments);
        if (payError) return fail(`Kayıt geri geldi ancak ödemeler getirilemedi: ${payError.message}`);
      }
    } else if (entry.entity === "payment" && snap.payment) {
      const { data: tx } = await supabase.from("transactions").select("id, amount, paid_amount").eq("id", snap.payment.transaction_id).single();
      if (!tx) return fail("Ödemenin bağlı olduğu kayıt artık yok; önce o kaydı geri getirin.", 409);
      const { error } = await supabase.from("payment_logs").insert(snap.payment);
      if (error) return fail(`Geri getirilemedi: ${error.message}`);
      const paid = Number(tx.paid_amount ?? 0) + Number(snap.payment.amount);
      await supabase
        .from("transactions")
        .update({ paid_amount: paid, status: Number(tx.amount) - paid <= 0.001 ? "odendi" : "bekliyor" })
        .eq("id", tx.id);
    } else if (entry.entity === "customer" && snap.customer) {
      const { error } = await supabase.from("customers").insert(snap.customer);
      if (error) return fail(error.code === "23505" ? "Bu isimde bir cari zaten var." : `Geri getirilemedi: ${error.message}`, error.code === "23505" ? 409 : 500);
    } else if (entry.entity === "account" && snap.account) {
      const { error } = await supabase.from("accounts").insert(snap.account);
      if (error) return fail(error.code === "23505" ? "Bu isimde bir hesap zaten var." : `Geri getirilemedi: ${error.message}`, error.code === "23505" ? 409 : 500);
    } else {
      return fail("Bu kayıt türü geri getirilemez.", 400);
    }

    await supabase.from("audit_log").update({ restored_at: new Date().toISOString() }).eq("id", auditId);
    await logAudit({ entity: entry.entity as "transaction", entityId: entry.entity_id, action: "restore", summary: `Geri getirildi: ${entry.summary ?? ""}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Geri getirme hatası:", error);
    return fail("Beklenmeyen bir hata oluştu.");
  }
}
