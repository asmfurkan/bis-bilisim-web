"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatTRY, KASA_METHODS, remaining, toTRY, type Receivable } from "@/lib/finance";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100";

const round = (n: number) => Math.round(n * 100) / 100;
const dayOf = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
const key = (name: string) => name.trim().toLocaleLowerCase("tr-TR");

/** customers tablosundaki tüm cariler + bakiyeleri. Satıra tıklayınca cari ekstre açılır. */
export function CustomersTab({
  items,
  rate,
  onOpen,
}: {
  items: Receivable[];
  rate: number | null;
  onOpen: (name: string) => void;
}) {
  const [customers, setCustomers] = useState<{ name: string; phone: string | null }[]>([]);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setCustomers(result.customers);
        else setLoadError(result.error || "Cari listesi alınamadı.");
      })
      .catch(() => setLoadError("Bağlantı hatası oluştu."));
  }, []);

  const rows = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; receivable: number; payable: number }>();
    for (const c of customers) {
      map.set(key(c.name), { name: c.name, phone: c.phone ?? "", receivable: 0, payable: 0 });
    }
    for (const r of items) {
      const k = key(r.customerName);
      const row = map.get(k) ?? { name: r.customerName, phone: r.phone, receivable: 0, payable: 0 };
      const left = toTRY(r, Math.max(0, remaining(r)), rate);
      if (r.type === "borc") row.payable += left;
      else row.receivable += left;
      if (!row.phone && r.phone) row.phone = r.phone;
      map.set(k, row);
    }
    const q = key(query);
    return [...map.values()]
      .filter((r) => !q || `${r.name} ${r.phone}`.toLocaleLowerCase("tr-TR").includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [customers, items, rate, query]);

  return (
    <div className="mt-5">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari ara..." className={`${inputClass} pl-9`} />
      </div>
      {loadError && <p className="mt-3 text-sm text-red-600">{loadError}</p>}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full min-w-[40rem] text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-3 py-2">Cari</th>
              <th className="px-3 py-2">Telefon</th>
              <th className="px-3 py-2 text-right">Alacağımız</th>
              <th className="px-3 py-2 text-right">Borcumuz</th>
              <th className="px-3 py-2 text-right">Net Bakiye</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                  Cari bulunamadı.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const net = round(r.receivable - r.payable);
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Günlük kasa: ödeme yöntemi Nakit / Banka POS / Fiş olan tahsilat ve ödemeler. */
export function KasaTab({ items, rate }: { items: Receivable[]; rate: number | null }) {
  const [day, setDay] = useState(() => dayOf(new Date()));

  const { entries, income, expense } = useMemo(() => {
    const list: {
      id: string;
      at: string;
      customer: string;
      doc: string;
      method: string;
      sign: 1 | -1;
      tl: number;
    }[] = [];
    for (const r of items) {
      for (const p of r.payments) {
        if (!p.method || !KASA_METHODS.includes(p.method)) continue;
        if (day && dayOf(new Date(p.paidAt)) !== day) continue;
        list.push({
          id: p.id,
          at: p.paidAt,
          customer: r.customerName,
          doc: r.title || r.description || "—",
          method: p.method,
          sign: r.type === "borc" ? -1 : 1,
          tl: toTRY(r, p.amount, rate),
        });
      }
    }
    list.sort((a, b) => b.at.localeCompare(a.at));
    const income = round(list.filter((e) => e.sign === 1).reduce((t, e) => t + e.tl, 0));
    const expense = round(list.filter((e) => e.sign === -1).reduce((t, e) => t + e.tl, 0));
    return { entries: list, income, expense };
  }, [items, rate, day]);

  const btn = "rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200";

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-3">
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} aria-label="Kasa tarihi" className={`${inputClass} w-44`} />
        <button type="button" onClick={() => setDay(dayOf(new Date()))} className={btn}>
          Bugün
        </button>
        <button type="button" onClick={() => setDay("")} className={btn}>
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
        <table className="w-full min-w-[40rem] text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-3 py-2">Zaman</th>
              <th className="px-3 py-2">Cari</th>
              <th className="px-3 py-2">Belge / Açıklama</th>
              <th className="px-3 py-2">Yöntem</th>
              <th className="px-3 py-2 text-right">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                  Nakit, Banka POS veya Fiş ile yapılmış işlem bulunamadı.
                </td>
              </tr>
            )}
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                  {new Date(e.at).toLocaleString("tr-TR", { dateStyle: day ? undefined : "short", timeStyle: "short" })}
                </td>
                <td className="px-3 py-2 font-medium text-slate-900">{e.customer}</td>
                <td className="px-3 py-2 text-slate-600">{e.doc}</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">{e.method}</span>
                </td>
                <td className={`px-3 py-2 text-right font-bold ${e.sign === 1 ? "text-emerald-700" : "text-amber-700"}`}>
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
