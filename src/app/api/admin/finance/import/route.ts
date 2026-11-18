import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { parseAmount, parseDate } from "@/lib/invoiceImport";
import { ensureCustomers } from "@/lib/financeServer";

const MAX_ROWS = 1000;

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const type = body?.type === "borc" ? "borc" : "alacak";
    const input: unknown[] = Array.isArray(body?.rows) ? body.rows : [];
    if (input.length === 0) {
      return NextResponse.json({ success: false, error: "Aktarılacak kayıt yok." }, { status: 400 });
    }
    if (input.length > MAX_ROWS) {
      return NextResponse.json({ success: false, error: `En fazla ${MAX_ROWS} kayıt aktarılabilir.` }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: existing, error: existingError } = await supabase
      .from("transactions")
      .select("customer_name, contact_name, title, amount")
      .eq("type", type);
    if (existingError) {
      return NextResponse.json({ success: false, error: existingError.message, details: existingError }, { status: 500 });
    }

    const lc = (s: string) => s.trim().toLocaleLowerCase("tr-TR");
    const nameAmountKey = (name: string, amount: number) => `${lc(name)}|${amount.toFixed(2)}`;
    // Mükerrer: aynı belge no VEYA aynı cari + aynı tutar (veritabanında veya dosyada daha önce geçmiş)
    const seenDocs = new Set(existing.map((r) => lc(r.title ?? "")).filter(Boolean));
    const seenNameAmount = new Set(
      existing.map((r) => nameAmountKey(r.customer_name || r.contact_name || "", Number(r.amount)))
    );
    const mode = body?.onDuplicate === "skip" || body?.onDuplicate === "force" ? body.onDuplicate : "ask";

    const toInsert = [];
    const duplicateList: { customerName: string; title: string; amount: number }[] = [];
    let duplicates = 0;
    let invalid = 0;
    for (const raw of input) {
      const r = (raw ?? {}) as Record<string, unknown>;
      const name = typeof r.customerName === "string" ? r.customerName.trim().slice(0, 200) : "";
      const title = typeof r.title === "string" ? r.title.trim().slice(0, 200) : "";
      const amount = parseAmount(r.amount);
      if (!name || amount === null) {
        invalid += 1;
        continue;
      }
      const isDup = (title && seenDocs.has(lc(title))) || seenNameAmount.has(nameAmountKey(name, amount));
      if (title) seenDocs.add(lc(title));
      seenNameAmount.add(nameAmountKey(name, amount));
      if (isDup) {
        duplicates += 1;
        duplicateList.push({ customerName: name, title, amount });
        if (mode !== "force") continue;
      }
      toInsert.push({
        type,
        customer_name: name,
        contact_name: name,
        title: title || null,
        amount,
        due_date: typeof r.dueDate === "string" ? parseDate(r.dueDate) : null,
        notes: typeof r.notes === "string" && r.notes.trim() ? r.notes.trim().slice(0, 1000) : null,
        status: "bekliyor",
        paid_amount: 0,
        category: "Cihaz Onarım / Servis",
      });
    }

    if (duplicates > 0 && mode === "ask") {
      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          error: "Dikkat: Bu belge numarasına ait kayıt zaten mevcut!",
          duplicates,
          samples: duplicateList.slice(0, 8),
        },
        { status: 409 }
      );
    }

    if (toInsert.length > 0) {
      const { error } = await supabase.from("transactions").insert(toInsert);
      if (error) {
        console.error("Finans API Gerçek Hata:", error);
        return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 });
      }
    }

    await ensureCustomers(toInsert.map((t) => ({ name: t.customer_name })));

    return NextResponse.json({ success: true, inserted: toInsert.length, duplicates, invalid });
  } catch (error) {
    console.error("Finans API Gerçek Hata:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
