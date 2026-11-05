import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import AdminLogin from "@/components/admin/AdminLogin";
import FinanceDashboard from "@/components/finance/FinanceDashboard";

export const metadata: Metadata = {
  title: "Finans Paneli | BİS Bilişim Teknolojileri",
  robots: { index: false, follow: false },
};

export default async function FinansPage() {
  const authenticated = await isAdminAuthenticated();
  return authenticated ? <FinanceDashboard /> : <AdminLogin title="Finans Paneli" />;
}
