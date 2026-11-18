import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";

const fail = (error: string, status = 500) => NextResponse.json({ success: false, error }, { status });
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/customers/[id]">) {
  if (!(await isAdminAuthenticated())) return fail("Yetkisiz erişim.", 401);
  const { id } = await ctx.params;
  try {
    const body = await request.json();
    const name = str(body?.name).slice(0, 200);
    const phone = str(body?.phone).slice(0, 50);
    const address = str(body?.address).slice(0, 500);
    if (!name) return fail("Cari adı boş olamaz.", 400);

    const supabase = getSupabaseAdmin();
    const { data: current, error: readError } = await supabase.from("customers").select("*").eq("id", id).single();
    if (readError || !current) return fail("Cari bulunamadı.", 404);

    const lc = (s: string) => s.trim().toLocaleLowerCase("tr-TR");
    if (lc(name) !== lc(current.name)) {
      const { data: all } = await supabase.from("customers").select("id, name").limit(5000);
      if ((all ?? []).some((c) => c.id !== id && lc(c.name) === lc(name))) {
        return fail("Bu isimde başka bir cari zaten var.", 409);
      }
    }

    const { error } = await supabase.from("customers").update({ name, phone: phone || null, address: address || null }).eq("id", id);
    if (error) {
      console.error("Cari güncellenemedi:", error);
      return fail(`Cari güncellenemedi: ${error.message}`);
    }

    // İsim/telefon değiştiyse bu cariye ait finans kayıtlarını da eşitle
    if (current.name !== name) {
      await supabase.from("transactions").update({ customer_name: name, contact_name: name }).eq("customer_name", current.name);
    }
    await supabase
      .from("transactions")
      .update({ customer_phone: phone || null })
      .eq("customer_name", name);

    await logAudit({
      entity: "customer",
      entityId: id,
      action: "update",
      summary: `Cari düzenlendi: ${current.name}${current.name !== name ? ` → ${name}` : ""}`,
      snapshot: { customer: current },
    });
    return NextResponse.json({ success: true, customer: { id, name, phone: phone || null, address: address || null } });
  } catch (error) {
    console.error("Cari güncelleme hatası:", error);
    return fail("Beklenmeyen bir hata oluştu.");
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/customers/[id]">) {
  if (!(await isAdminAuthenticated())) return fail("Yetkisiz erişim.", 401);
  const { id } = await ctx.params;
  const { data: before } = await getSupabaseAdmin().from("customers").select("*").eq("id", id).single();
  const { error } = await getSupabaseAdmin().from("customers").delete().eq("id", id);
  if (error) {
    console.error("Cari silinemedi:", error);
    return fail(`Cari silinemedi: ${error.message}`);
  }
  await logAudit({
    entity: "customer",
    entityId: id,
    action: "delete",
    summary: `Cari silindi: ${before?.name ?? ""}`,
    snapshot: { customer: before },
  });
  return NextResponse.json({ success: true });
}
