import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { parseAmount, parseDate } from "@/lib/invoiceImport";

const MAX_ROWS = 1000;

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
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
      .eq("type", "alacak");
    if (existingError) {
      return NextResponse.json({ success: false, error: existingError.message, details: existingError }, { status: 500 });
    }

    const keyOf = (name: string, title: string, amount: number) =>
      `${name.toLocaleLowerCase("tr-TR")}|${title.toLocaleLowerCase("tr-TR")}|${amount.toFixed(2)}`;
    const seen = new Set(
      existing.map((r) => keyOf(r.customer_name || r.contact_name || "", r.title ?? "", Number(r.amount)))
    );

    const toInsert = [];
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
      const key = keyOf(name, title, amount);
      // Başlığı (fatura no) olan kayıtlar mükerrer kontrolüne girer
      if (title && seen.has(key)) {
        duplicates += 1;
        continue;
      }
      seen.add(key);
      toInsert.push({
        type: "alacak",
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

    if (toInsert.length > 0) {
      const { error } = await supabase.from("transactions").insert(toInsert);
      if (error) {
        console.error("Finans API Gerçek Hata:", error);
        return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, inserted: toInsert.length, duplicates, invalid });
  } catch (error) {
    console.error("Finans API Gerçek Hata:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
