import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchReceivable, parseAmount } from "@/lib/financeServer";
import type { Database } from "@/lib/database.types";

const fail = (error: string, status = 500) => NextResponse.json({ success: false, error }, { status });

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/finance/[id]">) {
  if (!(await isAdminAuthenticated())) return fail("Yetkisiz erişim.", 401);
  const { id } = await ctx.params;
  try {
    const body = await request.json();
    const updates: Database["public"]["Tables"]["transactions"]["Update"] = {};
    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

    if (body?.customerName !== undefined) {
      if (!str(body.customerName)) return fail("Müşteri adı boş olamaz.", 400);
      updates.customer_name = str(body.customerName);
    }
    if (body?.phone !== undefined) updates.customer_phone = str(body.phone) || null;
    if (body?.description !== undefined) updates.description = str(body.description) || null;
    if (body?.note !== undefined) updates.notes = str(body.note) || null;
    if (body?.dueDate !== undefined) updates.due_date = str(body.dueDate) || null;
    if (body?.amount !== undefined) {
      const amount = parseAmount(body.amount);
      if (amount === null) return fail("Geçerli bir tutar girin.", 400);
      updates.amount = amount;
    }
    if (Object.keys(updates).length === 0) return fail("Güncellenecek alan bulunamadı.", 400);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("transactions").update(updates).eq("id", id);
    if (error) {
      console.error("Finans API Gerçek Hata:", error);
      return fail("Kayıt güncellenemedi.");
    }
    return NextResponse.json({ success: true, receivable: await fetchReceivable(id) });
  } catch (error) {
    console.error("Finans API Gerçek Hata:", error);
    return fail("Beklenmeyen bir hata oluştu.");
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/finance/[id]">) {
  if (!(await isAdminAuthenticated())) return fail("Yetkisiz erişim.", 401);
  const { id } = await ctx.params;
  const supabase = getSupabaseAdmin();
  await supabase.from("payment_logs").delete().eq("transaction_id", id);
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) {
    console.error("Finans API Gerçek Hata:", error);
    return fail("Kayıt silinemedi.");
  }
  return NextResponse.json({ success: true });
}
