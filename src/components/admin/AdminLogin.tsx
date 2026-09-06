"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const key = (formData.get("key") as string)?.trim() ?? "";

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const result = await response.json();

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || "Giriş başarısız.");
        setLoading(false);
      }
    } catch {
      setError("Bağlantı hatası oluştu.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-900/5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-800">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-slate-900">Yönetim Paneli</h1>
        <p className="mt-1 text-sm text-slate-500">Devam etmek için erişim anahtarını girin.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            name="key"
            type="password"
            required
            autoFocus
            placeholder="Erişim anahtarı"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-800 focus:ring-4 focus:ring-blue-100"
          />

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-all hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
