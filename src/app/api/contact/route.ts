import { NextResponse } from "next/server";

const WEB3FORMS_ACCESS_KEY = "28b0b9a2-1c10-4531-a919-7716d027d0c1";

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    const response = await fetch("https://api.web3forms.com/v1/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: "Yeni Arıza Kaydı Bildirimi - BİS Bilişim",
        ...formData,
      }),
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      console.error(
        "Contact API error: Web3Forms did not return JSON (status",
        response.status,
        ")"
      );
      return NextResponse.json(
        {
          success: false,
          message:
            "Servis şu anda yanıt vermiyor. Lütfen daha sonra tekrar deneyin veya bizi telefonla arayın.",
        },
        { status: 502 }
      );
    }

    const result = await response.json();

    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu tarafında bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
