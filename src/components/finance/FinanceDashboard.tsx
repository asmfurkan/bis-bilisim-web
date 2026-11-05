"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Banknote,
  Check,
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
import {
  formatTRY,
  isOverdue,
  paidTotal,
  remaining,
  whatsappReminderHref,
  type Receivable,
} from "@/lib/finance";

type Filter = "hepsi" | "acik" | "vadesi_gecen" | "odendi";

const FILTERS: { label: string; value: Filter }[] = [
  { label: "Hepsi", value: "hepsi" },
  { label: "Açık Bakiye", value: "acik" },
  { label: "Vadesi Geçen", value: "vadesi_gecen" },
  { label: "Ödendi", value: "odendi" },
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100";

async function api(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return (await response.json()) as { success: boolean; error?: string; receivable?: Receivable };
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
      <input name="customerName" required defaultValue={initial?.customerName} placeholder="Müşteri adı" className={inputClass} />
      <input name="phone" required defaultValue={initial?.phone} placeholder="Telefon" className={inputClass} />
      <input name="description" defaultValue={initial?.description} placeholder="Açıklama (cihaz / hizmet)" className={inputClass} />
      <input name="amount" required inputMode="decimal" defaultValue={initial?.amount} placeholder="Tutar (₺)" className={inputClass} />
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

function ReceivableCard({
  item,
  onChange,
  onDeleted,
}: {
  item: Receivable;
  onChange: (r: Receivable) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const left = remaining(item);
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
      <ReceivableForm
        initial={item}
        onSaved={(r) => {
          onChange(r);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${overdue ? "border-red-200" : "border-slate-100"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {item.customerName}
            {item.type === "borc" && (
              <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">Borç</span>
            )}
          </p>
          <p className="text-xs text-slate-500">{[item.phone, item.title].filter(Boolean).join(" · ")}</p>
          {item.deviceInfo && <p className="mt-1 text-xs text-slate-500">{item.deviceInfo}</p>}
          {item.description && <p className="mt-1 text-sm text-slate-700">{item.description}</p>}
          {item.note && <p className="mt-1 text-xs text-slate-500">Not: {item.note}</p>}
          {item.dueDate && (
            <p className={`mt-1 text-xs font-medium ${overdue ? "text-red-600" : "text-slate-500"}`}>
              Vade: {new Date(item.dueDate).toLocaleDateString("tr-TR")}
              {overdue ? " (geçti)" : ""}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">
            Toplam {formatTRY(item.amount)} · Ödenen {formatTRY(paidTotal(item))}
          </p>
          <p className={`text-xl font-extrabold ${left > 0 ? "text-slate-900" : "text-emerald-600"}`}>
            {left > 0 ? formatTRY(left) : "Ödendi"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {left > 0 && (
          <>
            <button
              type="button"
              onClick={() => setPaying((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Tahsilat Ekle
            </button>
            {item.type === "alacak" && item.phone && (
            <a
              href={whatsappReminderHref(item)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp Hatırlat
            </a>
            )}
          </>
        )}
        <button
          type="button"
          onClick={() => setShowLog((v) => !v)}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          Ödeme Geçmişi ({item.payments.length})
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          <Pencil className="h-3.5 w-3.5" />
          Düzenle
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Sil
        </button>
      </div>

      {paying && (
        <form onSubmit={handlePayment} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input name="amount" required inputMode="decimal" defaultValue={left} placeholder="Tutar (₺)" className={inputClass} />
          <input name="note" placeholder="Not (nakit, havale...)" className={inputClass} />
          <button
            type="submit"
            disabled={busy}
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Kaydet
          </button>
        </form>
      )}

      {showLog && (
        <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100 text-sm">
          {item.payments.length === 0 && <li className="p-3 text-slate-500">Henüz ödeme yok.</li>}
          {item.payments.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 p-3">
              <span className="text-slate-500">
                {new Date(p.paidAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                {p.note ? ` · ${p.note}` : ""}
              </span>
              <span className="flex items-center gap-2 font-semibold text-emerald-700">
                {formatTRY(p.amount)}
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
                  <X className="h-4 w-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
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

  const totals = useMemo(() => {
    let collected = 0;
    let outstanding = 0;
    let overdue = 0;
    for (const r of items) {
      if (r.type === "borc") continue;
      collected += paidTotal(r);
      outstanding += remaining(r);
      if (isOverdue(r)) overdue += remaining(r);
    }
    return { collected, outstanding, overdue };
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return items.filter((r) => {
      if (filter === "acik" && remaining(r) <= 0) return false;
      if (filter === "odendi" && remaining(r) > 0) return false;
      if (filter === "vadesi_gecen" && !isOverdue(r)) return false;
      if (!q) return true;
      return [r.customerName, r.phone, r.description, r.note ?? ""]
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(q);
    });
  }, [items, query, filter]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] bg-slate-50 py-16">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
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

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Kasa / Tahsilat" value={totals.collected} icon={<Wallet className="h-5 w-5" />} tone="bg-emerald-50 text-emerald-700" />
          <SummaryCard label="Piyasada Kalan Alacak" value={totals.outstanding} icon={<Banknote className="h-5 w-5" />} tone="bg-blue-50 text-blue-800" />
          <SummaryCard label="Vadesi Geçenler" value={totals.overdue} icon={<AlertTriangle className="h-5 w-5" />} tone="bg-red-50 text-red-700" />
        </div>

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

          {!loading &&
            visible.map((item) => (
              <ReceivableCard
                key={item.id}
                item={item}
                onChange={(updated) => setItems((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
                onDeleted={(id) => setItems((prev) => prev.filter((r) => r.id !== id))}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
