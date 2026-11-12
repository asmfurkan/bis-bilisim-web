import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Yetkisiz erişim." }, { status: 401 });
  }
  const { data, error } = await getSupabaseAdmin()
    .from("customers")
    .select("name, phone")
    .order("name", { ascending: true })
    .limit(5000);
  if (error) {
    console.error("Cari listesi alınamadı:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, customers: data });
}
