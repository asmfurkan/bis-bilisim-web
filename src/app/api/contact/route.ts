import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, device, message, city, kvkkConsent } = body;

    const { data, error: sendError } = await resend.emails.send({
      from: "BİS Bilişim Form <onboarding@resend.dev>",
      to: ["info@bisbilisim.com.tr"],
      subject: `Yeni Arıza Kaydı Bildirimi - ${name || "Müşteri"}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #0056b3; border-bottom: 2px solid #0056b3; padding-bottom: 10px;">Yeni Arıza Kaydı Talebi</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr><td style="padding: 8px; font-weight: bold; width: 140px;">Ad Soyad:</td><td style="padding: 8px;">${name || "-"}</td></tr>
            <tr style="background-color: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">Telefon:</td><td style="padding: 8px;">${phone || "-"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Cihaz / Model:</td><td style="padding: 8px;">${device || "-"}</td></tr>
            <tr style="background-color: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">Şehir / İlçe:</td><td style="padding: 8px;">${city || "-"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; vertical-align: top;">Arıza Açıklaması:</td><td style="padding: 8px;">${message || "-"}</td></tr>
            <tr style="background-color: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">KVKK Onayı:</td><td style="padding: 8px;">${kvkkConsent ? "Onaylandı" : "Onaylanmadı"}</td></tr>
          </table>
          <p style="margin-top: 20px; font-size: 12px; color: #777;">Bu e-posta BİS Bilişim web sitesi arıza formundan otomatik olarak gönderilmiştir.</p>
        </div>
      `,
    });

    console.log("Resend API Yanıtı:", { data, error: sendError });

    if (sendError) {
      return NextResponse.json(
        { success: false, error: sendError.message },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Resend Error:", error);
    const message = error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
