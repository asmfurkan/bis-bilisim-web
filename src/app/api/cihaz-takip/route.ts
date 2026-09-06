import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isDeviceStatus, normalizePhoneDigits, type PublicDeviceResult } from "@/lib/devices";

const NOT_FOUND_MESSAGE = "Bu bilgilerle eşleşen bir cihaz kaydı bulunamadı.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const trackingCodeInput = typeof body?.trackingCode === "string" ? body.trackingCode.trim() : "";
    const phoneInput = typeof body?.phone === "string" ? body.phone.trim() : "";

    if (!trackingCodeInput && !phoneInput) {
      return NextResponse.json(
        { success: false, error: "Takip numarası veya telefon numarası girin." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("devices")
      .select("tracking_code, model, complaint, service_note, status, created_at, updated_at");

    if (trackingCodeInput) {
      const normalizedCode = trackingCodeInput.toUpperCase().replace(/\s+/g, "");
      query = query.eq("tracking_code", normalizedCode);
    } else {
      const digits = normalizePhoneDigits(phoneInput);
      if (digits.length < 10) {
        return NextResponse.json(
          { success: false, error: "Geçerli bir telefon numarası girin." },
          { status: 400 }
        );
      }
      query = query.eq("phone_digits", digits);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Cihaz takip lookup error:", error);
      return NextResponse.json(
        { success: false, error: "Sorgu sırasında bir hata oluştu, lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: NOT_FOUND_MESSAGE }, { status: 404 });
    }

    const results: PublicDeviceResult[] = data.map((row) => ({
      trackingCode: row.tracking_code,
      model: row.model,
      complaint: row.complaint,
      serviceNote: row.service_note,
      status: isDeviceStatus(row.status) ? row.status : "kayit_alindi",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ success: true, devices: results });
  } catch (error) {
    console.error("Cihaz takip lookup error:", error);
    return NextResponse.json(
      { success: false, error: "Beklenmeyen bir hata oluştu, lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
