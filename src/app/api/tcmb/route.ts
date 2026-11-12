import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

const fail = (error: string, status = 500) => NextResponse.json({ success: false, error }, { status });

/** Kayıtlı güncel USD kuru (exchange_rates tablosu). */
export async function GET() {
  if (!(await isAdminAuthenticated())) return fail("Yetkisiz erişim.", 401);
  const { data, error } = await getSupabaseAdmin()
    .from("exchange_rates")
    .select("*")
    .eq("currency", "USD")
    .maybeSingle();
  if (error) {
    console.error("Kur okunamadı:", error);
    return fail(error.message);
  }
  return NextResponse.json({
    success: true,
    rate: data ? { rate: Number(data.rate), source: null, updatedAt: data.updated_at } : null,
  });
}

/**
 * Kuru günceller. Gövde: { rate: number } -> elle giriş,
 * gövde boş ya da { source: "tcmb" } -> TCMB today.xml üzerinden USD efektif satış kuru.
 */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return fail("Yetkisiz erişim.", 401);
  try {
    const body = await request.json().catch(() => ({}));
    let rate: number;
    let source: string;

    if (body?.rate !== undefined && body?.rate !== null && body?.rate !== "") {
      rate = Number(String(body.rate).replace(",", "."));
      source = "Manuel";
      if (!Number.isFinite(rate) || rate <= 0) return fail("Geçerli bir kur girin.", 400);
    } else {
      const response = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", { cache: "no-store" });
      if (!response.ok) return fail(`TCMB'ye ulaşılamadı (HTTP ${response.status}).`, 502);
      const xml = await response.text();
      const block = xml.match(/<Currency[^>]*CurrencyCode="USD"[^>]*>([\s\S]*?)<\/Currency>/)?.[1] ?? "";
      const pick = (tag: string) => Number(block.match(new RegExp(`<${tag}>([\\d.,]+)</${tag}>`))?.[1]);
      // Efektif satış; yoksa döviz satış
      const value = [pick("BanknoteSelling"), pick("ForexSelling")].find((n) => Number.isFinite(n) && n > 0);
      if (!value) return fail("TCMB yanıtında USD kuru bulunamadı.", 502);
      rate = value;
      source = "TCMB";
    }

    rate = Math.round(rate * 10000) / 10000;
    const updatedAt = new Date().toISOString();
    const { error } = await getSupabaseAdmin()
      .from("exchange_rates")
      .upsert({ currency: "USD", rate, updated_at: updatedAt }, { onConflict: "currency" });
    if (error) {
      console.error("Kur kaydedilemedi:", error);
      return fail(`Kur kaydedilemedi: ${error.message}`);
    }
    return NextResponse.json({ success: true, rate: { rate, source, updatedAt } });
  } catch (error) {
    console.error("TCMB kur hatası:", error);
    return fail(error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.");
  }
}
