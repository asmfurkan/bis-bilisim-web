import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchReceivable, parseAmount } from "@/lib/financeServer";

const fail = (error: string, status = 500) => NextResponse.json({ success: false, error }, { status });

async function applyPaid(id: string, paid: number, amount: number) {
  const done = amount - paid <= 0.001;
  return getSupabaseAdmin()
    .from("transactions")
    .update({ paid_amount: Math.max(0, paid), status: done ? "odendi" : "bekliyor" })
    .eq("id", id);
}

export async function POST(request: Request, ctx: RouteContext<"/api/admin/finance/[id]/payments">) {
  if (!(await isAdminAuthenticated())) return fail("Yetkisiz erişim.", 401);
  const { id } = await ctx.params;
  try {
    const body = await request.json();
    const amount = parseAmount(body?.amount);
    if (amount === null) return fail("Geçerli bir tahsilat tutarı girin.", 400);

    const current = await fetchReceivable(id);
    // Fazla ödemeye izin verilir: bakiye negatif (alacaklı) görünür, durum "odendi" olur.

    const { error: logError } = await getSupabaseAdmin()
      .from("payment_logs")
      .insert({
        transaction_id: id,
        amount,
        note: typeof body?.note === "string" && body.note.trim() ? body.note.trim() : null,
      });
    if (logError) {
      console.error("Finans API Gerçek Hata:", logError);
      return fail("Ödeme kaydedilemedi.");
    }

    const { error } = await applyPaid(id, current.paid + amount, current.amount);
    if (error) {
      console.error("Finans API Gerçek Hata:", error);
      return fail("Bakiye güncellenemedi.");
    }
    return NextResponse.json({ success: true, receivable: await fetchReceivable(id) });
  } catch (error) {
    console.error("Finans API Gerçek Hata:", error);
    return fail("Beklenmeyen bir hata oluştu.");
  }
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/finance/[id]/payments">) {
  if (!(await isAdminAuthenticated())) return fail("Yetkisiz erişim.", 401);
  const { id } = await ctx.params;
  const paymentId = new URL(request.url).searchParams.get("paymentId");
  if (!paymentId) return fail("paymentId gerekli.", 400);
  try {
    const supabase = getSupabaseAdmin();
    const { data: log } = await supabase
      .from("payment_logs")
      .select("*")
      .eq("id", paymentId)
      .eq("transaction_id", id)
      .single();
    if (!log) return fail("Ödeme kaydı bulunamadı.", 404);

    const current = await fetchReceivable(id);
    const { error } = await supabase.from("payment_logs").delete().eq("id", paymentId);
    if (error) {
      console.error("Finans API Gerçek Hata:", error);
      return fail("Ödeme silinemedi.");
    }
    await applyPaid(id, current.paid - Number(log.amount), current.amount);
    return NextResponse.json({ success: true, receivable: await fetchReceivable(id) });
  } catch (error) {
    console.error("Finans API Gerçek Hata:", error);
    return fail("Beklenmeyen bir hata oluştu.");
  }
}
