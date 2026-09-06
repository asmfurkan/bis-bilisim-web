import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Yönetim Paneli | BİS Bilişim Teknolojileri",
  robots: { index: false, follow: false },
};

export default async function YonetimPage() {
  const authenticated = await isAdminAuthenticated();
  return authenticated ? <AdminDashboard /> : <AdminLogin />;
}
