"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Save, Phone, Hash, Wallet, Check } from "lucide-react";
import { DEVICE_STATUSES, DEVICE_STATUS_LABELS, type AdminDevice, type DeviceStatus } from "@/lib/devices";

const STATUS_BADGE_CLASSES: Record<DeviceStatus, string> = {
  kayit_alindi: "bg-slate-100 text-slate-700",
  ariza_tespiti: "bg-sky-50 text-sky-700",
  onarimda: "bg-amber-50 text-amber-700",
  hazir: "bg-emerald-50 text-emerald-700",
  teslim_edildi: "bg-blue-50 text-blue-800",
};

function DeviceRow({
  device,
  onUpdated,
}: {
  device: AdminDevice;
  onUpdated: (device: AdminDevice) => void;
}) {
  const [status, setStatus] = useState<DeviceStatus>(device.status);
  const [note, setNote] = useState(device.serviceNote ?? "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [financeBusy, setFinanceBusy] = useState(false);
  const [financeMsg, setFinanceMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleAddToFinance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = new FormData(event.currentTarget).get("amount");
    setFinanceBusy(true);
    setFinanceMsg(null);
    try {
      const response = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: device.id, amount }),
      });
      const result = await response.json();
      if (result.success) {
        setFinanceMsg({ ok: true, text: "Finans tablosuna borç olarak eklendi." });
        setFinanceOpen(false);
      } else {
        setFinanceMsg({ ok: false, text: result.error || "Eklenemedi." });
      }
    } catch {
      setFinanceMsg({ ok: false, text: "Bağlantı hatası oluştu." });
    } finally {
      setFinanceBusy(false);
    }
  }

  async function handleSave(nextStatus: DeviceStatus, nextNote: string) {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/devices/${device.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, serviceNote: nextNote }),
      });
      const result = await response.json();
      if (result.success) {
        onUpdated({ ...device, status: nextStatus, serviceNote: nextNote });
        setDirty(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              <Hash className="h-3 w-3" />
              {device.trackingCode}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASSES[device.status]}`}>
              {DEVICE_STATUS_LABELS[device.status]}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{device.customerName}</p>
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <Phone className="h-3 w-3" />
            {device.phone}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {device.model}
            {device.serialNo ? ` · S/N: ${device.serialNo}` : ""}
          </p>
          <p className="mt-1 text-sm text-slate-500">{device.complaint}</p>
        </div>

        <select
          value={status}
          onChange={(event) => {
            const next = event.target.value as DeviceStatus;
            setStatus(next);
            handleSave(next, note);
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100"
        >
          {DEVICE_STATUSES.map((value) => (
            <option key={value} value={value}>
              {DEVICE_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <textarea
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            setDirty(true);
          }}
          rows={2}
          maxLength={1000}
          placeholder="Servis notu ekleyin..."
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100"
        />
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={() => handleSave(status, note)}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Notu Kaydet
        </button>
      </div>

      {(device.status === "hazir" || device.status === "teslim_edildi") && (
        <div className="mt-3">
          {!financeOpen && (
            <button
              type="button"
              onClick={() => setFinanceOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              <Wallet className="h-3.5 w-3.5" />
              Finansa / Borca Ekle
            </button>
          )}
          {financeOpen && (
            <form onSubmit={handleAddToFinance} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                name="amount"
                required
                autoFocus
                inputMode="decimal"
                placeholder="Servis tutarı (₺)"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100 sm:w-48"
              />
              <button
                type="submit"
                disabled={financeBusy}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {financeBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Borç Kaydı Oluştur
              </button>
              <button type="button" onClick={() => setFinanceOpen(false)} className="text-xs font-medium text-slate-500 hover:text-slate-900">
                Vazgeç
              </button>
            </form>
          )}
          {financeMsg && (
            <p className={`mt-1.5 text-xs ${financeMsg.ok ? "text-emerald-700" : "text-red-600"}`}>{financeMsg.text}</p>
          )}
        </div>
      )}
    </div>
  );
}

const FILTERS: { label: string; value: DeviceStatus | "hepsi" }[] = [
  { label: "Hepsi", value: "hepsi" },
  ...DEVICE_STATUSES.map((value) => ({ label: DEVICE_STATUS_LABELS[value], value })),
];

export default function DeviceList({
  devices,
  loading,
  filter,
  onFilterChange,
  onDeviceUpdated,
}: {
  devices: AdminDevice[];
  loading: boolean;
  filter: DeviceStatus | "hepsi";
  onFilterChange: (filter: DeviceStatus | "hepsi") => void;
  onDeviceUpdated: (device: AdminDevice) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Kayıtlı Cihazlar</h2>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onFilterChange(item.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === item.value
                  ? "bg-blue-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {loading && (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {!loading && devices.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">Kayıt bulunamadı.</p>
        )}

        {!loading &&
          devices.map((device) => (
            <DeviceRow key={device.id} device={device} onUpdated={onDeviceUpdated} />
          ))}
      </div>
    </div>
  );
}
