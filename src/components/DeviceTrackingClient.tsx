"use client";

import { useState, type FormEvent } from "react";
import { Search, Loader2, AlertCircle, Printer, ClipboardList, StickyNote, Hash } from "lucide-react";
import DeviceStatusStepper from "@/components/DeviceStatusStepper";
import type { PublicDeviceResult } from "@/lib/devices";

type Mode = "code" | "phone";
type Status = "idle" | "loading" | "success" | "error";

export default function DeviceTrackingClient() {
  const [mode, setMode] = useState<Mode>("code");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [results, setResults] = useState<PublicDeviceResult[]>([]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const value = (formData.get("query") as string)?.trim() ?? "";

    if (!value) return;

    setStatus("loading");
    setErrorMessage("");
    setResults([]);

    try {
      const payload = mode === "code" ? { trackingCode: value } : { phone: value };
      const response = await fetch("/api/cihaz-takip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.success) {
        setResults(result.devices);
        setStatus("success");
      } else {
        setErrorMessage(result.error || "Kayıt bulunamadı.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10">
        <div className="mb-6 flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("code")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              mode === "code" ? "bg-white text-blue-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Takip Numarası
          </button>
          <button
            type="button"
            onClick={() => setMode("phone")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              mode === "phone" ? "bg-white text-blue-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Telefon Numarası
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Hash className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              key={mode}
              name="query"
              type={mode === "phone" ? "tel" : "text"}
              required
              placeholder={mode === "code" ? "Örn. BIS-4821" : "Örn. 0532 123 45 67"}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-800 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-all hover:-translate-y-0.5 hover:bg-blue-900 hover:shadow-xl hover:shadow-amber-400/40 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Sorgula
          </button>
        </form>

        {status === "error" && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      {status === "success" && (
        <div className="mt-8 flex flex-col gap-6">
          {results.map((device) => (
            <div
              key={device.trackingCode}
              className="animate-fade-in-up rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold tracking-wide text-blue-800">
                  {device.trackingCode}
                </span>
              </div>

              <div className="mt-6 overflow-x-auto pb-2">
                <div className="min-w-[520px] px-1">
                  <DeviceStatusStepper status={device.status} />
                </div>
              </div>

              <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                    <Printer className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Cihaz Modeli</p>
                    <p className="text-sm font-semibold text-slate-900">{device.model}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                    <ClipboardList className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Şikayet</p>
                    <p className="text-sm text-slate-700">{device.complaint}</p>
                  </div>
                </div>
                {device.serviceNote && (
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <StickyNote className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Servis Notu</p>
                      <p className="text-sm text-slate-700">{device.serviceNote}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
