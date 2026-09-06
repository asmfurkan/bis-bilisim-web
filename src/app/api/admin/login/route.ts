import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken, verifyAdminKey } from "@/lib/adminAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const key = typeof body?.key === "string" ? body.key : "";

    if (!key || !verifyAdminKey(key)) {
      return NextResponse.json({ success: false, error: "Anahtar hatalı." }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ success: false, error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
