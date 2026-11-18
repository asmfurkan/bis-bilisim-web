import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";

const fail = (error: string, status = 500) => NextResponse.json({ success: false, error }, { status });
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function parseBalance(v: unknown) {
  if (v === undefined || v === null || v === "") return 0;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

const toAccount = (r: { id: string; name: string; kind: string; opening_balance: number }) => ({
  id: r.id,
  name: r.name,
  kind: r.kind === "banka" ? "banka" : "kasa",
  openingBalance: Number(r.opening_balance),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) return fail("Yetkisiz erişim.", 401);
  const { data, error } = await getSupabaseAdmin().from("accounts").select("*").order("created_at", { ascending: true });
  if (error) {
    console.error("Hesaplar alınamadı:", error);
    return fail(error.message);
  }
  return NextResponse.json({ success: true, accounts: data.map(toAccount) });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return fail("Yetkisiz erişim.", 401);
  try {
    const body = await request.json();
    const name = str(body?.name).slice(0, 100);
    const balance = parseBalance(body?.openingBalance);
    if (!name) return fail("Hesap adı zorunludur.", 400);
    if (balance === null) return fail("Geçerli bir açılış bakiyesi girin.", 400);
    const kind = body?.kind === "banka" ? "banka" : "kasa";
    const { data, error } = await getSupabaseAdmin()
      .from("accounts")
      .insert({ name, kind, opening_balance: balance })
      .select("*")
      .single();
    if (error) return fail(error.code === "23505" ? "Bu isimde bir hesap zaten var." : error.message, error.code === "23505" ? 409 : 500);
    await logAudit({ entity: "account", entityId: data.id, action: "create", summary: `Hesap eklendi: ${name} (${kind})` });
    return NextResponse.json({ success: true, account: toAccount(data) });
  } catch (error) {
    console.error("Hesap eklenemedi:", error);
    return fail("Beklenmeyen bir hata oluştu.");
  }
}
