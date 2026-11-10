"use client";

import { Fragment, useState, type FormEvent } from "react";
import { Loader2, Save, Wallet, Check, ChevronDown, ChevronRight, Truck, ExternalLink } from "lucide-react";
import {
  DEVICE_STATUSES,
  DEVICE_STATUS_LABELS,
  cargoTrackingUrl,
  type AdminDevice,
  type DeviceStatus,
} from "@/lib/devices";
import { formatTRY } from "@/lib/finance";

const STATUS_BADGE_CLASSES: Record<DeviceStatus, string> = {
  kayit_alindi: "bg-slate-100 text-slate-700",
  ariza_tespiti: "bg-sky-50 text-sky-700",
  onarimda: "bg-amber-50 text-amber-700",
  hazir: "bg-emerald-50 text-emerald-700",
  teslim_edildi: "bg-blue-50 text-blue-800",
};

function CargoNo({ device }: { device: AdminDevice }) {
  if (!device.cargoTrackingNo) return null;
  const url = cargoTrackingUrl(device.deliveryType, device.cargoTrackingNo);
  if (!url) return <div className="text-[11px] text-slate-500">{device.cargoTrackingNo}</div>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Kargo sorgula"
      className="flex items-center gap-1 text-[11px] font-medium text-blue-800 hover:underline"
    >
      {device.cargoTrackingNo}
      <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1 py-px text-[10px] font-semibold">
        Sorgula <ExternalLink className="h-2.5 w-2.5" />
      </span>
    </a>
  );
}

const detailInput =
  "rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100";

function DeviceTableRow({
  device,
  onUpdated,
}: {
  device: AdminDevice;
  onUpdated: (device: AdminDevice) => void;
}) {
  const [open, setOpen] = useState(false);
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

  const canFinance = device.status === "hazir" || device.status === "teslim_edildi";

  return (
    <Fragment>
      <tr className="border-t border-slate-100 align-middle hover:bg-slate-50/70">
        <td className="px-2 py-1.5">
          <select
            value={status}
            aria-label="Durum"
            onChange={(event) => {
              const next = event.target.value as DeviceStatus;
              setStatus(next);
              handleSave(next, note);
            }}
            className={`rounded-full border-0 px-2 py-0.5 text-xs font-semibold outline-none ${STATUS_BADGE_CLASSES[status]}`}
          >
            {DEVICE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {DEVICE_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </td>
        <td className="px-2 py-1.5 whitespace-nowrap text-slate-500">
          {new Date(device.createdAt).toLocaleDateString("tr-TR")}
        </td>
        <td className="px-2 py-1.5 font-bold whitespace-nowrap text-blue-800">{device.trackingCode}</td>
        <td className="px-2 py-1.5">
          <div className="font-medium text-slate-900">{device.customerName}</div>
          <div className="text-[11px] text-slate-500">{device.phone}</div>
        </td>
        <td className="max-w-[16rem] px-2 py-1.5">
          <div className="truncate text-slate-800" title={device.model}>
            {device.model}
            {device.serialNo ? ` · ${device.serialNo}` : ""}
          </div>
          <div className="truncate text-[11px] text-slate-500" title={device.complaint}>
            {device.complaint}
          </div>
        </td>
        <td className="px-2 py-1.5 whitespace-nowrap">
          <div className="flex items-center gap-1 text-slate-700">
            <Truck className="h-3 w-3 text-slate-400" />
            {device.deliveryType}
          </div>
          <CargoNo device={device} />
        </td>
        <td className="px-2 py-1.5 text-right whitespace-nowrap">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
          >
            {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Detay
          </button>
        </td>
      </tr>

      {open && (
        <tr className="bg-slate-50/60">
          <td colSpan={7} className="px-4 py-3">
            <div className="grid gap-3 text-xs text-slate-700 sm:grid-cols-2">
              <div className="space-y-1">
                <p>
                  <span className="font-semibold">Şikayet:</span> {device.complaint}
                </p>
                <p>
                  <span className="font-semibold">Adres:</span> {device.customerAddress || "—"}
                </p>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Kargo takip no:</span>
                  {device.cargoTrackingNo ? <CargoNo device={device} /> : "—"}
                </div>
                <p>
                  <span className="font-semibold">Kargo ücreti:</span>{" "}
                  {device.cargoFee !== null ? formatTRY(device.cargoFee) : "—"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <textarea
                    value={note}
                    onChange={(event) => {
                      setNote(event.target.value);
                      setDirty(true);
                    }}
                    rows={2}
                    maxLength={1000}
                    placeholder="Servis notu ekleyin..."
                    className={`${detailInput} w-full resize-none`}
                  />
                  <button
                    type="button"
                    disabled={!dirty || saving}
                    onClick={() => handleSave(status, note)}
                    className="flex shrink-0 items-center gap-1 self-start rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Kaydet
                  </button>
                </div>

                {canFinance && !financeOpen && (
                  <button
                    type="button"
                    onClick={() => setFinanceOpen(true)}
                    className="flex w-fit items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <Wallet className="h-3 w-3" />
                    Finansa / Borca Ekle
                  </button>
                )}
                {canFinance && financeOpen && (
                  <form onSubmit={handleAddToFinance} className="flex items-center gap-2">
                    <input
                      name="amount"
                      required
                      autoFocus
                      inputMode="decimal"
                      placeholder="Servis tutarı (₺)"
                      className={`${detailInput} w-40`}
                    />
                    <button
                      type="submit"
                      disabled={financeBusy}
                      className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {financeBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      Borç Kaydı Oluştur
                    </button>
                    <button
                      type="button"
                      onClick={() => setFinanceOpen(false)}
                      className="text-[11px] font-medium text-slate-500 hover:text-slate-900"
                    >
                      Vazgeç
                    </button>
                  </form>
                )}
                {financeMsg && (
                  <p className={`text-[11px] ${financeMsg.ok ? "text-emerald-700" : "text-red-600"}`}>
                    {financeMsg.text}
                  </p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
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
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-900/5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Kayıtlı Cihazlar</h2>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onFilterChange(item.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === item.value ? "bg-blue-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[56rem] text-left text-xs">
          <thead>
            <tr className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              <th className="px-2 py-1.5">Durum</th>
              <th className="px-2 py-1.5">Tarih</th>
              <th className="px-2 py-1.5">Fiş No</th>
              <th className="px-2 py-1.5">Müşteri</th>
              <th className="px-2 py-1.5">Cihaz / Arıza</th>
              <th className="px-2 py-1.5">Kargo</th>
              <th className="px-2 py-1.5 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              devices.map((device) => (
                <DeviceTableRow key={device.id} device={device} onUpdated={onDeviceUpdated} />
              ))}
          </tbody>
        </table>
        {loading && (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        {!loading && devices.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">Kayıt bulunamadı.</p>
        )}
      </div>
    </div>
  );
}
