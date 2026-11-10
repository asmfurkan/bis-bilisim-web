"use client";

import { useState, type FormEvent } from "react";
import { Loader2, AlertCircle, CheckCircle2, PlusCircle } from "lucide-react";
import { DEFAULT_DELIVERY_TYPE, DELIVERY_TYPES, POPULAR_EPSON_MODELS } from "@/lib/devices";
import type { AdminDevice } from "@/lib/devices";

export default function NewDeviceForm({ onCreated }: { onCreated: (device: AdminDevice) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [customModel, setCustomModel] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setLoading(true);
    setError("");
    setCreatedCode("");

    const payload = {
      customerName: formData.get("customerName"),
      phone: formData.get("phone"),
      model: formData.get("model"),
      serialNo: formData.get("serialNo"),
      complaint: formData.get("complaint"),
      customerAddress: formData.get("customerAddress"),
      deliveryType: formData.get("deliveryType"),
      cargoTrackingNo: formData.get("cargoTrackingNo"),
      cargoFee: formData.get("cargoFee"),
    };

    try {
      const response = await fetch("/api/admin/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.success) {
        onCreated(result.device);
        setCreatedCode(result.device.trackingCode);
        form.reset();
        setCustomModel(false);
      } else {
        setError(result.error || "Kayıt oluşturulamadı.");
      }
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <PlusCircle className="h-5 w-5 text-blue-800" />
        Yeni Cihaz Kabul
      </h2>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Müşteri Adı</label>
            <input
              name="customerName"
              type="text"
              required
              maxLength={80}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Telefon</label>
            <input
              name="phone"
              type="tel"
              required
              maxLength={20}
              placeholder="05XX XXX XX XX"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Model</label>
            {customModel ? (
              <input
                name="model"
                type="text"
                required
                autoFocus
                maxLength={80}
                placeholder="Model adını yazın"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100"
              />
            ) : (
              <select
                name="model"
                required
                defaultValue=""
                onChange={(event) => {
                  if (event.target.value === "__custom__") setCustomModel(true);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100"
              >
                <option value="" disabled>
                  Model seçin
                </option>
                {POPULAR_EPSON_MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
                <option value="__custom__">Diğer (yazmak istiyorum)</option>
              </select>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Seri No <span className="font-normal text-slate-400">(varsa)</span>
            </label>
            <input
              name="serialNo"
              type="text"
              maxLength={80}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Arıza Şikayeti</label>
          <textarea
            name="complaint"
            required
            rows={3}
            maxLength={1000}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Müşteri Adresi <span className="font-normal text-slate-400">(kargo / teslimat)</span>
          </label>
          <textarea name="customerAddress" rows={2} maxLength={500} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100 resize-none" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Teslim Eden / Kargo Firması</label>
            <select name="deliveryType" defaultValue={DEFAULT_DELIVERY_TYPE} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100">
              {DELIVERY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Kargo Takip No</label>
            <input name="cargoTrackingNo" type="text" maxLength={60} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Kargo Ücreti (TL)</label>
            <input name="cargoFee" type="number" min="0" step="0.01" inputMode="decimal" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100" />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {createdCode && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Kayıt oluşturuldu. Takip kodu: <span className="font-bold">{createdCode}</span>
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-all hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Kaydı Oluştur
        </button>
      </form>
    </div>
  );
}
