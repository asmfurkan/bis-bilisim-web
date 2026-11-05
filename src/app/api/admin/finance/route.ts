import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchPayments, fetchReceivable, parseAmount, toReceivable } from "@/lib/financeServer";

const unauthorized = () => NextResponse.json({ success: false, error: "Yetkisiz erişim." }, { status: 401 });
const fail = (error: string, status = 500) => NextResponse.json({ success: false, error }, { status });

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Finans API Gerçek Hata:", error);
      return fail("Kayıtlar alınamadı.");
    }
    const payments = await fetchPayments(data.map((r) => r.id));
    return NextResponse.json({
      success: true,
      receivables: data.map((r) => toReceivable(r, payments.get(r.id) ?? [])),
    });
  } catch (error) {
    console.error("Finans API Gerçek Hata:", error);
    return fail("Beklenmeyen bir hata oluştu.");
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    const body = await request.json();
    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const amount = parseAmount(body?.amount);
    const deviceId = str(body?.deviceId);
    let customerName = str(body?.customerName);
    let phone = str(body?.phone);
    let description = str(body?.description);
    let title = str(body?.title);
    let deviceInfo: string | null = null;

    const supabase = getSupabaseAdmin();

    if (deviceId) {
      const { data: device } = await supabase.from("devices").select("*").eq("id", deviceId).single();
      if (!device) return fail("Cihaz bulunamadı.", 404);

      const { data: existing } = await supabase
        .from("transactions")
        .select("id")
        .eq("type", "alacak")
        .eq("title", device.tracking_code)
        .limit(1);
      if (existing && existing.length > 0) return fail("Bu cihaz zaten finansa eklenmiş.", 409);

      customerName = customerName || device.customer_name;
      phone = phone || device.phone;
      title = device.tracking_code;
      deviceInfo = `${device.model}${device.serial_no ? ` · S/N: ${device.serial_no}` : ""}`;
      description = description || `${device.model} servis bedeli`;
    }

    if (!customerName || amount === null) {
      return fail("Müşteri adı ve geçerli bir tutar zorunludur.", 400);
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        type: body?.type === "borc" ? "borc" : "alacak",
        customer_name: customerName,
        contact_name: customerName,
        customer_phone: phone || null,
        title: title || null,
        description: description || null,
        device_info: deviceInfo,
        notes: str(body?.note) || null,
        amount,
        paid_amount: 0,
        status: "bekliyor",
        category: "Cihaz Onarım / Servis",
        due_date: str(body?.dueDate) || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Finans API Gerçek Hata:", error);
      return fail("Kayıt oluşturulamadı.");
    }
    return NextResponse.json({ success: true, receivable: await fetchReceivable(data.id) });
  } catch (error) {
    console.error("Finans API Gerçek Hata:", error);
    return fail("Beklenmeyen bir hata oluştu.");
  }
}
