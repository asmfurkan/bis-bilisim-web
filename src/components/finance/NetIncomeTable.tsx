"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatTRY, toTRY, type Receivable } from "@/lib/finance";

type Row = { month: string; income: number; expense: number; collected: number };

const monthLabel = (key: string) =>
  new Date(`${key}-01T00:00:00`).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

/**
 * Aylık net gelir tablosu (TL). Gelir: "alacak" kayıtlarının tutarı, Gider: "borç" kayıtlarının tutarı
 * (kayıt tarihine göre), Net Gelir = Gelir − Gider. Tahsilat: ay içinde yapılan tahsilat girişleri.
 * USD kayıtlar güncel kurla TL'ye çevrilir.
 */
export default function NetIncomeTable({ items, rate }: { items: Receivable[]; rate: number | null }) {
  const [open, setOpen] = useState(true);

  const { rows, total } = useMemo(() => {
    const map = new Map<string, Row>();
    const get = (iso: string) => {
      const d = new Date(iso);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      let row = map.get(key);
      if (!row) {
        row = { month: key, income: 0, expense: 0, collected: 0 };
        map.set(key, row);
      }
      return row;
    };
    for (const r of items) {
      const row = get(r.createdAt);
      const tl = toTRY(r, r.amount, rate);
      if (r.type === "alacak") row.income += tl;
      else row.expense += tl;
      if (r.type === "alacak") {
        for (const p of r.payments) get(p.paidAt).collected += toTRY(r, p.amount, rate);
      }
    }
    const list = [...map.values()].sort((a, b) => b.month.localeCompare(a.month));
    const sum = list.reduce(
      (acc, r) => ({
        month: "",
        income: acc.income + r.income,
        expense: acc.expense + r.expense,
        collected: acc.collected + r.collected,
      }),
      { month: "", income: 0, expense: 0, collected: 0 }
    );
    return { rows: list, total: sum };
  }, [items, rate]);

  const net = (r: Row) => r.income - r.expense;
  const netClass = (n: number) => (n < 0 ? "text-red-600" : "text-emerald-700");

  return (
    <section className="mt-6 rounded-2xl border border-slate-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="block text-sm font-bold text-slate-900">Net Gelir Tablosu</span>
          <span className="block text-[11px] text-slate-500">Aylık gelir, gider ve net sonuç (₺)</span>
        </span>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="overflow-x-auto border-t border-slate-100">
          {rows.length === 0 ? (
            <p className="p-5 text-center text-sm text-slate-500">Henüz kayıt yok.</p>
          ) : (
            <table className="w-full min-w-[34rem] text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-2">Ay</th>
                  <th className="px-4 py-2 text-right">Gelir</th>
                  <th className="px-4 py-2 text-right">Gider</th>
                  <th className="px-4 py-2 text-right">Net Gelir</th>
                  <th className="px-4 py-2 text-right">Tahsilat</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.month} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium text-slate-800 capitalize">{monthLabel(r.month)}</td>
                    <td className="px-4 py-2 text-right text-slate-700">{formatTRY(r.income)}</td>
                    <td className="px-4 py-2 text-right text-slate-700">{formatTRY(r.expense)}</td>
                    <td className={`px-4 py-2 text-right font-bold ${netClass(net(r))}`}>{formatTRY(net(r))}</td>
                    <td className="px-4 py-2 text-right text-slate-700">{formatTRY(r.collected)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
                  <td className="px-4 py-2 text-slate-900">Toplam</td>
                  <td className="px-4 py-2 text-right">{formatTRY(total.income)}</td>
                  <td className="px-4 py-2 text-right">{formatTRY(total.expense)}</td>
                  <td className={`px-4 py-2 text-right ${netClass(net(total))}`}>{formatTRY(net(total))}</td>
                  <td className="px-4 py-2 text-right">{formatTRY(total.collected)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}
    </section>
  );
}
