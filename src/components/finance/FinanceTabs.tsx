"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Loader2, Pencil, Search, Trash2, X } from "lucide-react";
import { formatTRY, KASA_METHODS, PAYMENT_METHODS, remaining, toTRY, type Receivable } from "@/lib/finance";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100";

const round = (n: number) => Math.round(n * 100) / 100;
const dayOf = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
const key = (name: string) => name.trim().toLocaleLowerCase("tr-TR");

type Customer = { id: string; name: string; phone: string | null };

/** customers tablosundaki tüm cariler + bakiyeleri. Satıra tıklayınca cari ekstre açılır. */
export function CustomersTab({
  items,
  rate,
  onOpen,
  onCustomerChanged,
}: {
  items: Receivable[];
  rate: number | null;
  onOpen: (name: string) => void;
  /** Cari adı/telefonu değiştiğinde finans kayıtlarını yeniden yüklemek için. */
  onCustomerChanged?: () => void;
}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function reload() {
    try {
      const result = await (await fetch("/api/admin/customers")).json();
      if (result.success) {
        setCustomers(result.customers);
        setLoadError("");
      } else setLoadError(result.error || "Cari listesi alınamadı.");
    } catch {
      setLoadError("Bağlantı hatası oluştu.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, []);

  const rows = useMemo(() => {
    const map = new Map<string, { id: string | null; name: string; phone: string; receivable: number; payable: number; count: number }>();
    for (const c of customers) {
      map.set(key(c.name), { id: c.id, name: c.name, phone: c.phone ?? "", receivable: 0, payable: 0, count: 0 });
    }
    for (const r of items) {
      const k = key(r.customerName);
      const row = map.get(k) ?? { id: null, name: r.customerName, phone: r.phone, receivable: 0, payable: 0, count: 0 };
      const left = toTRY(r, Math.max(0, remaining(r)), rate);
      if (r.type === "borc") row.payable += left;
      else row.receivable += left;
      row.count += 1;
      if (!row.phone && r.phone) row.phone = r.phone;
      map.set(k, row);
    }
    const q = key(query);
    return [...map.values()]
      .filter((r) => !q || `${r.name} ${r.phone}`.toLocaleLowerCase("tr-TR").includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [customers, items, rate, query]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setEditError("");
    try {
      const response = await fetch(`/api/admin/customers/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), phone: form.get("phone") }),
      });
      const result = await response.json();
      if (!result.success) {
        setEditError(result.error || "Kaydedilemedi.");
        return;
      }
      setEditing(null);
      await reload();
      onCustomerChanged?.();
    } catch {
      setEditError("Bağlantı hatası oluştu.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string, count: number) {
    const warn = count > 0 ? `\n\nBu cariye ait ${count} finans kaydı silinmez, listede kalmaya devam eder.` : "";
    if (!window.confirm(`"${name}" carisi veritabanından silinsin mi?${warn}`)) return;
    setBusyId(id);
    try {
      const result = await (await fetch(`/api/admin/customers/${id}`, { method: "DELETE" })).json();
      if (result.success) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
      } else setLoadError(result.error || "Cari silinemedi.");
    } catch {
      setLoadError("Bağlantı hatası oluştu.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-5">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari ara..." className={`${inputClass} pl-9`} />
      </div>
      {loadError && <p className="mt-3 text-sm text-red-600">{loadError}</p>}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full min-w-[44rem] text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-3 py-2">Cari</th>
              <th className="px-3 py-2">Telefon</th>
              <th className="px-3 py-2 text-right">Alacağımız</th>
              <th className="px-3 py-2 text-right">Borcumuz</th>
              <th className="px-3 py-2 text-right">Net Bakiye</th>
              <th className="px-3 py-2 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  Cari bulunamadı.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const net = round(r.receivable - r.payable);
              const id = r.id;
              return (
                <tr
                  key={r.name}
                  onClick={() => onOpen(r.name)}
                  className="cursor-pointer border-t border-slate-100 hover:bg-blue-50/50"
                >
                  <td className="px-3 py-2 font-medium text-blue-800">{r.name}</td>
                  <td className="px-3 py-2 text-slate-600">{r.phone || "—"}</td>
                  <td className="px-3 py-2 text-right text-slate-900">{formatTRY(round(r.receivable))}</td>
                  <td className="px-3 py-2 text-right text-amber-700">{formatTRY(round(r.payable))}</td>
                  <td
                    className={`px-3 py-2 text-right font-bold ${net > 0 ? "text-red-600" : net < 0 ? "text-sky-700" : "text-emerald-700"}`}
                  >
                    {formatTRY(net)}
                    <span className="ml-1 text-[11px] font-medium">
                      {net > 0 ? "(alacaklıyız)" : net < 0 ? "(borçluyuz)" : ""}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    {id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditError("");
                            setEditing({ id, name: r.name, phone: r.phone || null });
                          }}
                          className="mr-1 inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Düzenle
                        </button>
                        <button
                          type="button"
                          disabled={busyId === id}
                          onClick={() => handleDelete(id, r.name, r.count)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {busyId === id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          Sil
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400">cari kartı yok</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
          <form onSubmit={handleSave} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Cariyi Düzenle</h3>
              <button type="button" aria-label="Kapat" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <label className="text-xs font-semibold text-slate-500">
                Cari Adı
                <input name="name" required maxLength={200} defaultValue={editing.name} className={`${inputClass} mt-1`} />
              </label>
              <label className="text-xs font-semibold text-slate-500">
                Telefon
                <input name="phone" maxLength={50} defaultValue={editing.phone ?? ""} className={`${inputClass} mt-1`} />
              </label>
              <p className="text-[11px] text-slate-400">İsim değişirse bu cariye ait tüm finans kayıtları da güncellenir.</p>
              {editError && <p className="text-sm text-red-600">{editError}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/** Günlük kasa: tarih aralığı + ödeme yöntemi filtresiyle tahsilat ve ödemeler. */
export function KasaTab({ items, rate }: { items: Receivable[]; rate: number | null }) {
  const [from, setFrom] = useState(() => dayOf(new Date()));
  const [to, setTo] = useState(() => dayOf(new Date()));
  // "kasa" = Nakit / Banka POS / Fiş, "hepsi" = tüm yöntemler, aksi halde tek yöntem
  const [method, setMethod] = useState<string>("kasa");

  const { entries, income, expense } = useMemo(() => {
    const list: {
      id: string;
      at: string;
      customer: string;
      doc: string;
      reason: string;
      description: string;
      method: string;
      sign: 1 | -1;
      tl: number;
    }[] = [];
    for (const r of items) {
      for (const p of r.payments) {
        const m = p.method ?? "";
        if (method === "kasa" && !KASA_METHODS.includes(m)) continue;
        if (method !== "kasa" && method !== "hepsi" && m !== method) continue;
        const d = dayOf(new Date(p.paidAt));
        if (from && d < from) continue;
        if (to && d > to) continue;
        list.push({
          id: p.id,
          at: p.paidAt,
          customer: r.customerName,
          doc: r.title || "—",
          reason: r.category || "—",
          description: [r.description, p.note].filter(Boolean).join(" · ") || "—",
          method: m || "Belirtilmedi",
          sign: r.type === "borc" ? -1 : 1,
          tl: toTRY(r, p.amount, rate),
        });
      }
    }
    list.sort((a, b) => b.at.localeCompare(a.at));
    const income = round(list.filter((e) => e.sign === 1).reduce((t, e) => t + e.tl, 0));
    const expense = round(list.filter((e) => e.sign === -1).reduce((t, e) => t + e.tl, 0));
    return { entries: list, income, expense };
  }, [items, rate, from, to, method]);

  const btn = "rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200";
  const label = "flex items-center gap-2 text-xs font-semibold text-slate-500";

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className={label}>
          Başlangıç
          <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={`${inputClass} w-40`} />
        </label>
        <label className={label}>
          Bitiş
          <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={`${inputClass} w-40`} />
        </label>
        <label className={label}>
          Ödeme Türü
          <select value={method} onChange={(e) => setMethod(e.target.value)} className={`${inputClass} w-44`}>
            <option value="kasa">Kasa (Nakit / POS / Fiş)</option>
            <option value="hepsi">Tüm yöntemler</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            setFrom(dayOf(new Date()));
            setTo(dayOf(new Date()));
          }}
          className={btn}
        >
          Bugün
        </button>
        <button
          type="button"
          onClick={() => {
            setFrom("");
            setTo("");
          }}
          className={btn}
        >
          Tüm Zamanlar
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Giren (Tahsilat)</p>
          <p className="mt-1 text-xl font-extrabold text-emerald-700">{formatTRY(income)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Çıkan (Ödeme)</p>
          <p className="mt-1 text-xl font-extrabold text-amber-700">{formatTRY(expense)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Kasa Toplamı</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">{formatTRY(round(income - expense))}</p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full min-w-[52rem] text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-3 py-2">Tarih / Saat</th>
              <th className="px-3 py-2">Cari</th>
              <th className="px-3 py-2">Belge No</th>
              <th className="px-3 py-2">İşlem Nedeni</th>
              <th className="px-3 py-2">Açıklama</th>
              <th className="px-3 py-2">Ödeme Türü</th>
              <th className="px-3 py-2 text-right">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                  Seçilen tarih aralığı ve ödeme türünde işlem bulunamadı.
                </td>
              </tr>
            )}
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                  {new Date(e.at).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                </td>
                <td className="px-3 py-2 font-medium text-slate-900">{e.customer}</td>
                <td className="px-3 py-2 text-slate-600">{e.doc}</td>
                <td className="px-3 py-2 font-medium text-slate-700">{e.reason}</td>
                <td className="px-3 py-2 text-slate-600">{e.description}</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-indigo-700">
                    {e.method}
                  </span>
                </td>
                <td className={`px-3 py-2 text-right font-bold whitespace-nowrap ${e.sign === 1 ? "text-emerald-700" : "text-amber-700"}`}>
                  {e.sign === 1 ? "+" : "−"}
                  {formatTRY(e.tl)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
