"use client";

import { Fragment, useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import InvoiceImportModal from "@/components/finance/InvoiceImportModal";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Banknote,
  RefreshCw,
  FileSpreadsheet,
  Check,
  History,
  Loader2,
  LogOut,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import CustomerCombobox from "@/components/CustomerCombobox";
import NetIncomeTable from "@/components/finance/NetIncomeTable";
import CustomerStatementDrawer from "@/components/finance/CustomerStatementDrawer";
import {
  formatMoney,
  formatTRY,
  isOverdue,
  paidTotal,
  remaining,
  toTRY,
  whatsappReminderHref,
  type Receivable,
} from "@/lib/finance";

type Rate = { rate: number; source: string | null; updatedAt: string } | null;
type SortKey = "date" | "doc" | "customer" | "amount";

type Filter = "hepsi" | "acik" | "vadesi_gecen" | "odendi";

const FILTERS: { label: string; value: Filter }[] = [
  { label: "Hepsi", value: "hepsi" },
  { label: "Açık Bakiye", value: "acik" },
  { label: "Vadesi Geçen", value: "vadesi_gecen" },
  { label: "Ödendi", value: "odendi" },
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100";

const compactInput =
  "w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100";

async function api(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return (await response.json()) as { success: boolean; error?: string; receivable?: Receivable };
}

function SortHeader({
  label,
  k,
  sort,
  onSort,
  right,
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onSort: (k: SortKey) => void;
  right?: boolean;
}) {
  const active = sort.key === k;
  return (
    <button
      type="button"
      onClick={() => onSort(k)}
      className={`inline-flex items-center gap-1 uppercase hover:text-slate-900 ${right ? "flex-row-reverse" : ""} ${active ? "text-blue-800" : ""}`}
    >
      {label}
      {active && (sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
    </button>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>{icon}</div>
      <p className="mt-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-900">{formatTRY(value)}</p>
    </div>
  );
}

function ReceivableForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Receivable;
  onSaved: (r: Receivable) => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    setSaving(true);
    setError("");
    try {
      const result = initial
        ? await api(`/api/admin/finance/${initial.id}`, "PATCH", payload)
        : await api("/api/admin/finance", "POST", payload);
      if (result.success && result.receivable) onSaved(result.receivable);
      else setError(result.error || "Kaydedilemedi.");
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-5 sm:grid-cols-2">
      <CustomerCombobox
        name="customerName"
        maxLength={200}
        defaultValue={initial?.customerName ?? ""}
        placeholder="Müşteri ara veya yeni isim yaz"
        className={inputClass}
      />
      <input name="phone" required defaultValue={initial?.phone} placeholder="Telefon" className={inputClass} />
      <input name="description" defaultValue={initial?.description} placeholder="Açıklama (cihaz / hizmet)" className={inputClass} />
      <div className="flex gap-2">
        <input
          name="amount"
          required
          inputMode="decimal"
          defaultValue={initial?.amount}
          placeholder={`Tutar (${initial?.currency === "USD" ? "$" : "₺"})`}
          className={`${inputClass} min-w-0 flex-1`}
        />
        {initial ? (
          <span className="flex items-center rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-600">
            {initial.currency === "USD" ? "$" : "₺"}
          </span>
        ) : (
          <select name="currency" defaultValue="TRY" aria-label="Para birimi" className={inputClass.replace("w-full", "w-28") + " shrink-0"}>
            <option value="TRY">TRY ₺</option>
            <option value="USD">USD $</option>
          </select>
        )}
      </div>
      <input name="dueDate" type="date" defaultValue={initial?.dueDate ?? ""} className={inputClass} aria-label="Vade tarihi" />
      <input name="note" defaultValue={initial?.note ?? ""} placeholder="Not" className={inputClass} />
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Kaydet
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          Vazgeç
        </button>
      </div>
    </form>
  );
}

function ReceivableRow({
  item,
  rate,
  onOpenCustomer,
  onChange,
  onDeleted,
}: {
  item: Receivable;
  rate: number | null;
  onOpenCustomer: (name: string) => void;
  onChange: (r: Receivable) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const left = remaining(item);
  const usd = item.currency === "USD";
  const sym = usd ? "$" : "₺";
  const overdue = isOverdue(item);

  async function run(action: () => Promise<{ success: boolean; error?: string; receivable?: Receivable }>) {
    setBusy(true);
    setError("");
    try {
      const result = await action();
      if (result.success && result.receivable) onChange(result.receivable);
      else if (!result.success) setError(result.error || "İşlem başarısız.");
      return result.success;
    } catch {
      setError("Bağlantı hatası oluştu.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handlePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (await run(() => api(`/api/admin/finance/${item.id}/payments`, "POST", data))) {
      setPaying(false);
      setShowLog(true);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`${item.customerName} kaydı ve tüm ödemeleri silinsin mi?`)) return;
    setBusy(true);
    const result = await api(`/api/admin/finance/${item.id}`, "DELETE");
    setBusy(false);
    if (result.success) onDeleted(item.id);
    else setError(result.error || "Silinemedi.");
  }

  if (editing) {
    return (
      <tr>
        <td colSpan={7} className="p-3">
          <ReceivableForm
            initial={item}
            onSaved={(r) => {
              onChange(r);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </td>
      </tr>
    );
  }

  const statusLabel = left <= 0 ? "Ödendi" : overdue ? "Vadesi Geçti" : item.paid > 0 ? "Kısmi" : "Açık";
  const statusClass =
    left <= 0
      ? "bg-emerald-50 text-emerald-700"
      : overdue
        ? "bg-red-50 text-red-700"
        : item.paid > 0
          ? "bg-sky-50 text-sky-700"
          : "bg-slate-100 text-slate-700";
  const iconBtn = "rounded-md p-1.5 transition-colors disabled:opacity-50";
  const deviceText = [item.deviceInfo, item.description].filter(Boolean).join(" · ");

  return (
    <Fragment>
      <tr className="border-t border-slate-100 align-middle hover:bg-slate-50/70">
        <td className="px-2 py-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${statusClass}`}>
            {statusLabel}
          </span>
          {item.type === "borc" && (
            <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Borç</span>
          )}
        </td>
        <td className="px-2 py-1.5 whitespace-nowrap text-slate-500">
          {new Date(item.createdAt).toLocaleDateString("tr-TR")}
          {item.dueDate && (
            <div className={`text-[11px] ${overdue ? "font-medium text-red-600" : "text-slate-400"}`}>
              Vade: {new Date(item.dueDate).toLocaleDateString("tr-TR")}
            </div>
          )}
        </td>
        <td className="px-2 py-1.5 whitespace-nowrap text-slate-600">{item.title || "—"}</td>
        <td className="px-2 py-1.5">
          <button
            type="button"
            onClick={() => onOpenCustomer(item.customerName)}
            title="Cari ekstreyi aç"
            className="text-left font-medium text-blue-800 hover:underline"
          >
            {item.customerName}
          </button>
          {item.phone && <div className="text-[11px] text-slate-500">{item.phone}</div>}
        </td>
        <td className="max-w-[16rem] px-2 py-1.5">
          <div className="truncate text-slate-700" title={deviceText}>
            {deviceText || "—"}
          </div>
          {item.note && (
            <div className="truncate text-[11px] text-slate-400" title={item.note}>
              Not: {item.note}
            </div>
          )}
        </td>
        <td className="px-2 py-1.5 text-right whitespace-nowrap">
          <div className={`text-sm font-bold ${left > 0 ? "text-slate-900" : left < 0 ? "text-sky-700" : "text-emerald-600"}`}>
            {left > 0 ? formatMoney(left, item.currency) : left < 0 ? `${formatMoney(left, item.currency)} (alacaklı)` : "Ödendi"}
          </div>
          {usd && (
            <div className="text-[11px] font-medium text-slate-500">
              {rate ? `≈ ${formatTRY(toTRY(item, left !== 0 ? left : item.amount, rate))}` : "Kur girilmedi"}
            </div>
          )}
          <div className="text-[11px] text-slate-400">
            {formatMoney(item.amount, item.currency)} · Öd. {formatMoney(paidTotal(item), item.currency)}
          </div>
        </td>
        <td className="px-2 py-1.5 text-right whitespace-nowrap">
          {(
            <button
              type="button"
              title="Tahsilat ekle"
              aria-label="Tahsilat ekle"
              onClick={() => setPaying((v) => !v)}
              className={`${iconBtn} text-emerald-700 hover:bg-emerald-50`}
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          {left > 0 && item.type === "alacak" && item.phone && (
            <a
              href={whatsappReminderHref(item)}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp hatırlat"
              aria-label="WhatsApp hatırlat"
              className={`${iconBtn} inline-block text-[#25D366] hover:bg-green-50`}
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            title={`Ödeme geçmişi (${item.payments.length})`}
            aria-label="Ödeme geçmişi"
            onClick={() => setShowLog((v) => !v)}
            className={`${iconBtn} text-slate-600 hover:bg-slate-100`}
          >
            <History className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Düzenle"
            aria-label="Düzenle"
            onClick={() => setEditing(true)}
            className={`${iconBtn} text-slate-600 hover:bg-slate-100`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Sil"
            aria-label="Sil"
            onClick={handleDelete}
            disabled={busy}
            className={`${iconBtn} text-red-600 hover:bg-red-50`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </td>
      </tr>

      {(paying || showLog || error) && (
        <tr className="bg-slate-50/60">
          <td colSpan={7} className="px-4 py-2">
            {paying && (
              <form onSubmit={handlePayment} className="flex flex-col gap-2 sm:flex-row">
                <input name="amount" required inputMode="decimal" defaultValue={left > 0 ? left : ""} placeholder={`Tutar (${sym})`} className={compactInput} />
                <input name="note" placeholder="Not (nakit, havale...)" className={compactInput} />
                <button
                  type="submit"
                  disabled={busy}
                  className="flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Kaydet
                </button>
              </form>
            )}

            {showLog && (
              <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-100 bg-white text-xs">
                {item.payments.length === 0 && <li className="p-2 text-slate-500">Henüz ödeme yok.</li>}
                {item.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 p-2">
                    <span className="text-slate-500">
                      {new Date(p.paidAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                      {p.note ? ` · ${p.note}` : ""}
                    </span>
                    <span className="flex items-center gap-2 font-semibold text-emerald-700">
                      {formatMoney(p.amount, item.currency)}
                      <button
                        type="button"
                        aria-label="Ödemeyi sil"
                        disabled={busy}
                        onClick={() => {
                          if (window.confirm("Bu ödeme kaydı silinsin mi?"))
                            run(() => api(`/api/admin/finance/${item.id}/payments?paymentId=${p.id}`, "DELETE"));
                        }}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </td>
        </tr>
      )}
    </Fragment>
  );
}

export default function FinanceDashboard() {
  const router = useRouter();
  const [items, setItems] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("hepsi");
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "date", dir: "desc" });
  const [statementFor, setStatementFor] = useState<string | null>(null);
  const [rate, setRate] = useState<Rate>(null);
  const [rateInput, setRateInput] = useState("");
  const [rateBusy, setRateBusy] = useState(false);
  const [rateMsg, setRateMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/finance");
      const result = await response.json();
      if (result.success) {
        setItems(result.receivables);
        setLoadError("");
      } else setLoadError(result.error || "Kayıtlar alınamadı.");
    } catch {
      setLoadError("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    fetch("/api/tcmb")
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) {
          setRateMsg({ ok: false, text: `Kur okunamadı: ${result.error}` });
          return;
        }
        setRate(result.rate);
        // Kayıtlı kur bugüne ait değilse TCMB'den otomatik güncelle
        const day = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
        const stale = !result.rate || day(new Date(result.rate.updatedAt)) !== day(new Date());
        if (stale) {
          return fetch("/api/tcmb", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          })
            .then((res) => res.json())
            .then((updated) => {
              if (updated.success) {
                setRate(updated.rate);
                setRateMsg({ ok: true, text: "Kur TCMB'den otomatik güncellendi." });
              } else setRateMsg({ ok: false, text: `Otomatik güncelleme başarısız: ${updated.error}` });
            });
        }
      })
      .catch(() => setRateMsg({ ok: false, text: "Kur okunamadı (bağlantı hatası)." }));
  }, []);

  async function updateRate(manual: boolean) {
    setRateBusy(true);
    setRateMsg(null);
    try {
      const response = await fetch("/api/tcmb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manual ? { rate: rateInput } : {}),
      });
      const result = await response.json();
      if (result.success) {
        setRate(result.rate);
        setRateInput("");
        setRateMsg({ ok: true, text: `Kur güncellendi (${result.rate.source}).` });
      } else setRateMsg({ ok: false, text: result.error || "Kur güncellenemedi." });
    } catch {
      setRateMsg({ ok: false, text: "Bağlantı hatası oluştu." });
    } finally {
      setRateBusy(false);
    }
  }

  function toggleSort(key: SortKey) {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  const totals = useMemo(() => {
    let collected = 0;
    let outstanding = 0;
    let overdue = 0;
    const rv = rate?.rate ?? null;
    for (const r of items) {
      if (r.type === "borc") continue;
      collected += toTRY(r, paidTotal(r), rv);
      const left = Math.max(0, remaining(r));
      outstanding += toTRY(r, left, rv);
      if (isOverdue(r)) overdue += toTRY(r, left, rv);
    }
    return { collected, outstanding, overdue };
  }, [items, rate]);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    const rv = rate?.rate ?? null;
    const dir = sort.dir === "asc" ? 1 : -1;
    const cmp = (a: Receivable, b: Receivable) => {
      switch (sort.key) {
        case "date":
          return a.createdAt.localeCompare(b.createdAt);
        case "doc":
          return (a.title || "").localeCompare(b.title || "", "tr", { numeric: true });
        case "customer":
          return a.customerName.localeCompare(b.customerName, "tr");
        case "amount":
          return toTRY(a, remaining(a), rv) - toTRY(b, remaining(b), rv);
      }
    };
    return items.filter((r) => {
      if (filter === "acik" && remaining(r) <= 0) return false;
      if (filter === "odendi" && remaining(r) > 0) return false;
      if (filter === "vadesi_gecen" && !isOverdue(r)) return false;
      if (!q) return true;
      return [r.customerName, r.phone, r.description, r.note ?? ""]
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(q);
    }).sort((a, b) => cmp(a, b) * dir);
  }, [items, query, filter, sort, rate]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Finans Paneli</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">USD / TRY Kuru</p>
            <p className="text-xl font-extrabold text-slate-900">
              {rate ? `${rate.rate.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ₺` : "Kur girilmedi"}
            </p>
            {rate && (
              <p className="text-[11px] text-slate-400">
                {rate.source ? `${rate.source} · ` : ""}{new Date(rate.updatedAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
              </p>
            )}
            {rateMsg && <p className={`text-xs ${rateMsg.ok ? "text-emerald-700" : "text-red-600"}`}>{rateMsg.text}</p>}
          </div>
          <input
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            inputMode="decimal"
            placeholder="Elle kur (örn. 34,50)"
            className={`${inputClass} sm:w-44`}
          />
          <button
            type="button"
            disabled={rateBusy || !rateInput.trim()}
            onClick={() => updateRate(true)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Kaydet
          </button>
          <button
            type="button"
            disabled={rateBusy}
            onClick={() => updateRate(false)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-800 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
          >
            {rateBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            TCMB&apos;den Çek
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Kasa / Tahsilat" value={totals.collected} icon={<Wallet className="h-5 w-5" />} tone="bg-emerald-50 text-emerald-700" />
          <SummaryCard label="Piyasada Kalan Alacak" value={totals.outstanding} icon={<Banknote className="h-5 w-5" />} tone="bg-blue-50 text-blue-800" />
          <SummaryCard label="Vadesi Geçenler" value={totals.overdue} icon={<AlertTriangle className="h-5 w-5" />} tone="bg-red-50 text-red-700" />
        </div>

        <NetIncomeTable items={items} rate={rate?.rate ?? null} />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Müşteri, telefon veya açıklama ara..."
              className={`${inputClass} pl-9`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filter === f.value ? "bg-blue-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
          >
            <Plus className="h-4 w-4" />
            Yeni Kayıt
          </button>
          <button
            type="button"
            onClick={() => setImporting(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Fatura Yükle (.xlsx / .csv)
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {adding && (
            <ReceivableForm
              onSaved={(r) => {
                setItems((prev) => [r, ...prev]);
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          )}

          {loading && (
            <div className="flex justify-center py-10 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {!loading && loadError && <p className="py-6 text-center text-sm text-red-600">{loadError}</p>}
          {!loading && !loadError && visible.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">Kayıt bulunamadı.</p>
          )}

          {!loading && visible.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full min-w-[56rem] text-left text-xs">
                <thead className="bg-slate-50">
                  <tr className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                    <th className="px-2 py-2">Durum</th>
                    <th className="px-2 py-2"><SortHeader label="Tarih" k="date" sort={sort} onSort={toggleSort} /></th>
                    <th className="px-2 py-2"><SortHeader label="Belge / Fiş No" k="doc" sort={sort} onSort={toggleSort} /></th>
                    <th className="px-2 py-2"><SortHeader label="Müşteri" k="customer" sort={sort} onSort={toggleSort} /></th>
                    <th className="px-2 py-2">Cihaz / Açıklama</th>
                    <th className="px-2 py-2 text-right"><SortHeader label="Kalan / Tutar" k="amount" sort={sort} onSort={toggleSort} right /></th>
                    <th className="px-2 py-2 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => (
                    <ReceivableRow
                      key={item.id}
                      item={item}
                      rate={rate?.rate ?? null}
                      onOpenCustomer={setStatementFor}
                      onChange={(updated) => setItems((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
                      onDeleted={(id) => setItems((prev) => prev.filter((r) => r.id !== id))}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {statementFor && (
        <CustomerStatementDrawer
          customerName={statementFor}
          items={items}
          rate={rate?.rate ?? null}
          onClose={() => setStatementFor(null)}
        />
      )}
      {importing && <InvoiceImportModal onClose={() => setImporting(false)} onImported={load} />}
    </div>
  );
}
