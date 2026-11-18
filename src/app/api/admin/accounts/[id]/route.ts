import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";

const fail = (error: string, status = 500) => NextResponse.json({ success: false, error }, { status });
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/accounts/[id]">) {
  if (!(await isAdminAuthenticated())) return fail("Yetkisiz erişim.", 401);
  const { id } = await ctx.params;
  try {
    const body = await request.json();
    const name = str(body?.name).slice(0, 100);
    const balance = Number(String(body?.openingBalance ?? 0).replace(",", "."));
    if (!name) return fail("Hesap adı zorunludur.", 400);
    if (!Number.isFinite(balance)) return fail("Geçerli bir açılış bakiyesi girin.", 400);
    const kind = body?.kind === "banka" ? "banka" : "kasa";
    const supabase = getSupabaseAdmin();
    const { data: before } = await supabase.from("accounts").select("*").eq("id", id).single();
    const { error } = await supabase
      .from("accounts")
      .update({ name, kind, opening_balance: Math.round(balance * 100) / 100 })
      .eq("id", id);
    if (error) return fail(error.code === "23505" ? "Bu isimde bir hesap zaten var." : error.message, error.code === "23505" ? 409 : 500);
    await logAudit({ entity: "account", entityId: id, action: "update", summary: `Hesap düzenlendi: ${name}`, snapshot: { account: before } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Hesap güncellenemedi:", error);
    return fail("Beklenmeyen bir hata oluştu.");
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/accounts/[id]">) {
  if (!(await isAdminAuthenticated())) return fail("Yetkisiz erişim.", 401);
  const { id } = await ctx.params;
  const supabase = getSupabaseAdmin();
  const { data: before } = await supabase.from("accounts").select("*").eq("id", id).single();
  // Bağlı ödemeler silinmez; hesap_id boşalır (on delete set null)
  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) return fail(`Hesap silinemedi: ${error.message}`);
  await logAudit({ entity: "account", entityId: id, action: "delete", summary: `Hesap silindi: ${before?.name ?? ""}`, snapshot: { account: before } });
  return NextResponse.json({ success: true });
}
