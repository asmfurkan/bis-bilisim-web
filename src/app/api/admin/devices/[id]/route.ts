import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isDeviceStatus } from "@/lib/devices";
import type { Database } from "@/lib/database.types";

type DeviceUpdate = Database["public"]["Tables"]["devices"]["Update"];

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/devices/[id]">) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    const body = await request.json();
    const updates: DeviceUpdate = {};

    if (body?.status !== undefined) {
      if (!isDeviceStatus(body.status)) {
        return NextResponse.json({ success: false, error: "Geçersiz durum değeri." }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body?.serviceNote !== undefined) {
      updates.service_note = typeof body.serviceNote === "string" ? body.serviceNote.trim() : "";
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: "Güncellenecek alan bulunamadı." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("devices")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Device update error:", error);
      return NextResponse.json({ success: false, error: "Kayıt güncellenemedi." }, { status: 500 });
    }

    return NextResponse.json({ success: true, device: data });
  } catch (error) {
    console.error("Device update error:", error);
    return NextResponse.json({ success: false, error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
