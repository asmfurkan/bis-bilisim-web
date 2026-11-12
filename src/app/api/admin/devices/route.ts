import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ensureCustomers } from "@/lib/financeServer";
import { DEFAULT_DELIVERY_TYPE, DELIVERY_TYPES, generateTrackingCode, isDeviceStatus, type AdminDevice } from "@/lib/devices";

type DeviceRow = {
  id: string;
  tracking_code: string;
  customer_name: string;
  phone: string;
  model: string;
  serial_no: string | null;
  complaint: string;
  service_note: string | null;
  customer_address: string | null;
  delivery_type: string | null;
  cargo_tracking_no: string | null;
  cargo_fee: number | string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

function toAdminDevice(row: DeviceRow): AdminDevice {
  return {
    id: row.id,
    trackingCode: row.tracking_code,
    customerName: row.customer_name,
    phone: row.phone,
    model: row.model,
    serialNo: row.serial_no,
    complaint: row.complaint,
    serviceNote: row.service_note,
    customerAddress: row.customer_address ?? null,
    deliveryType: row.delivery_type || DEFAULT_DELIVERY_TYPE,
    cargoTrackingNo: row.cargo_tracking_no ?? null,
    cargoFee: row.cargo_fee === null || row.cargo_fee === undefined ? null : Number(row.cargo_fee),
    status: isDeviceStatus(row.status) ? row.status : "kayit_alindi",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase.from("devices").select("*").order("created_at", { ascending: false });

    if (status && isDeviceStatus(status)) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Devices list error:", error);
      return NextResponse.json({ success: false, error: "Kayıtlar alınamadı." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      devices: (data as DeviceRow[]).map(toAdminDevice),
    });
  } catch (error) {
    console.error("Devices list error:", error);
    return NextResponse.json({ success: false, error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const customerName = typeof body?.customerName === "string" ? body.customerName.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const model = typeof body?.model === "string" ? body.model.trim() : "";
    const serialNo = typeof body?.serialNo === "string" ? body.serialNo.trim() : "";
    const complaint = typeof body?.complaint === "string" ? body.complaint.trim() : "";

    const customerAddress = typeof body?.customerAddress === "string" ? body.customerAddress.trim() : "";
    const deliveryTypeRaw = typeof body?.deliveryType === "string" ? body.deliveryType.trim() : "";
    const deliveryType = (DELIVERY_TYPES as readonly string[]).includes(deliveryTypeRaw)
      ? deliveryTypeRaw
      : DEFAULT_DELIVERY_TYPE;
    const cargoTrackingNo = typeof body?.cargoTrackingNo === "string" ? body.cargoTrackingNo.trim() : "";
    const feeRaw = String(body?.cargoFee ?? "").trim().replace(",", ".");
    const cargoFee = feeRaw === "" ? null : Number(feeRaw);
    if (cargoFee !== null && (!Number.isFinite(cargoFee) || cargoFee < 0)) {
      return NextResponse.json({ success: false, error: "Kargo ücreti geçersiz." }, { status: 400 });
    }

    if (!customerName || !phone || !model || !complaint) {
      return NextResponse.json(
        { success: false, error: "Müşteri adı, telefon, model ve şikayet alanları zorunludur." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const trackingCode = generateTrackingCode();
      const { data, error } = await supabase
        .from("devices")
        .insert({
          tracking_code: trackingCode,
          customer_name: customerName,
          phone,
          model,
          serial_no: serialNo || null,
          complaint,
          customer_address: customerAddress || null,
          delivery_type: deliveryType,
          cargo_tracking_no: cargoTrackingNo || null,
          cargo_fee: cargoFee,
          status: "kayit_alindi",
        })
        .select("*")
        .single();

      if (!error) {
        await ensureCustomers([{ name: customerName, phone }]);
        return NextResponse.json({ success: true, device: toAdminDevice(data as DeviceRow) });
      }

      // 23505 = unique_violation (tracking_code çakışması) -> yeniden dene
      if (error.code !== "23505") {
        console.error("Device create error:", error);
        return NextResponse.json(
          {
            success: false,
            error: `Cihaz kaydedilemedi: ${error.message}${error.details ? ` (${error.details})` : ""}${error.hint ? ` — ${error.hint}` : ""}`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Benzersiz takip kodu üretilemedi, lütfen tekrar deneyin." },
      { status: 409 }
    );
  } catch (error) {
    console.error("Device create error:", error);
    return NextResponse.json({ success: false, error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
