"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Download, Loader2, Pencil, Plus, Printer, RotateCcw, Trash2, X } from "lucide-react";
import { formatTRY, payTRY, remaining, toTRY, type Account, type Receivable } from "@/lib/finance";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100";
const card = "rounded-2xl border border-slate-100 bg-white p-4 shadow-sm";
const th = "px-3 py-2";
const round = (n: number) => Math.round(n * 100) / 100;

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return (await res.json()) as { success: boolean; error?: string };
}

/* ------------------------------------------------------------------ */
/* Hesaplar (kasa / banka)                                             */
/* ------------------------------------------------------------------ */

export function AccountsTab({
  accounts,
  items,
  rate,
  onChanged,
}: {
  accounts: Account[];
  items: Receivable[];
  rate: number | null;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState<Account | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const { balances, unassigned } = useMemo(() => {
    const map = new Map<string, { inflow: number; outflow: number }>();
    let un = 0;
    for (const r of items) {
      for (const p of r.payments) {
        const tl = payTRY(r, p, rate);
        const sign = r.type === "borc" ? -1 : 1;
        if (!p.accountId) {
          un += sign * tl;
          continue;
        }
        const b = map.get(p.accountId) ?? { inflow: 0, outflow: 0 };
        if (sign === 1) b.inflow += tl;
        else b.outflow += tl;
        map.set(p.accountId, b);
      }
    }
    return { balances: map, unassigned: round(un) };
  }, [items, rate]);

  const total = round(
    accounts.reduce((t, a) => {
      const b = balances.get(a.id);
      return t + a.openingBalance + (b ? b.inflow - b.outflow : 0);
    }, 0)
  );

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const payload = { name: f.get("name"), kind: f.get("kind"), openingBalance: f.get("openingBalance") };
    setSaving(true);
    setError("");
    try {
      const result =
        editing && editing !== "new"
          ? await call(`/api/admin/accounts/${editing.id}`, "PATCH", payload)
          : await call("/api/admin/accounts", "POST", payload);
      if (!result.success) {
        setError(result.error || "Kaydedilemedi.");
        return;
      }
      setEditing(null);
      onChanged();
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a: Account) {
    if (!window.confirm(`"${a.name}" hesabı silinsin mi? Bu hesaba bağlı ödemeler silinmez, "hesapsız" olarak kalır.`)) return;
    setBusyId(a.id);
    try {
      const result = await call(`/api/admin/accounts/${a.id}`, "DELETE");
      if (result.success) onChanged();
      else setError(result.error || "Silinemedi.");
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className={card}>
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Toplam Varlık (Kasa + Banka)</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">{formatTRY(total)}</p>
        </div>
        <div className={card}>
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Hesap Sayısı</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">{accounts.length}</p>
        </div>
        <div className={card}>
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Hesapsız Hareket (net)</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">{formatTRY(unassigned)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Bakiye = açılış bakiyesi + tahsilatlar − ödemeler. USD ödemeler, ödeme anındaki kurla TL&apos;ye çevrilir.
        </p>
        <button
          type="button"
          onClick={() => {
            setError("");
            setEditing("new");
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
        >
          <Plus className="h-4 w-4" />
          Yeni Hesap
        </button>
      </div>
      {error && !editing && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full min-w-[40rem] text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className={th}>Hesap</th>
              <th className={th}>Tür</th>
              <th className={`${th} text-right`}>Açılış</th>
              <th className={`${th} text-right`}>Giren</th>
              <th className={`${th} text-right`}>Çıkan</th>
              <th className={`${th} text-right`}>Bakiye</th>
              <th className={`${th} text-right`}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                  Hesap yok. Önce <code>supabase/migrations_audit_accounts.sql</code> dosyasını çalıştırın veya yeni hesap ekleyin.
                </td>
              </tr>
            )}
            {accounts.map((a) => {
              const b = balances.get(a.id) ?? { inflow: 0, outflow: 0 };
              const bal = round(a.openingBalance + b.inflow - b.outflow);
              return (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium text-slate-900">{a.name}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                      {a.kind === "banka" ? "Banka" : "Kasa"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-slate-600">{formatTRY(a.openingBalance)}</td>
                  <td className="px-3 py-2 text-right text-emerald-700">{formatTRY(round(b.inflow))}</td>
                  <td className="px-3 py-2 text-right text-amber-700">{formatTRY(round(b.outflow))}</td>
                  <td className={`px-3 py-2 text-right font-bold ${bal < 0 ? "text-red-600" : "text-slate-900"}`}>{formatTRY(bal)}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button
                      type="button"
                      aria-label="Düzenle"
                      title="Düzenle"
                      onClick={() => {
                        setError("");
                        setEditing(a);
                      }}
                      className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Sil"
                      title="Sil"
                      disabled={busyId === a.id}
                      onClick={() => handleDelete(a)}
                      className="rounded-md p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {busyId === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
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
              <h3 className="text-base font-bold text-slate-900">{editing === "new" ? "Yeni Hesap" : "Hesabı Düzenle"}</h3>
              <button type="button" aria-label="Kapat" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <label className="text-xs font-semibold text-slate-500">
                Hesap Adı
                <input name="name" required maxLength={100} defaultValue={editing === "new" ? "" : editing.name} placeholder="Örn: Ziraat Bankası" className={`${inputClass} mt-1`} />
              </label>
              <label className="text-xs font-semibold text-slate-500">
                Tür
                <select name="kind" defaultValue={editing === "new" ? "banka" : editing.kind} className={`${inputClass} mt-1`}>
                  <option value="kasa">Kasa (nakit)</option>
                  <option value="banka">Banka</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-500">
                Açılış Bakiyesi (₺)
                <input name="openingBalance" inputMode="decimal" defaultValue={editing === "new" ? "0" : editing.openingBalance} className={`${inputClass} mt-1`} />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
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

/* ------------------------------------------------------------------ */
/* Raporlar                                                            */
/* ------------------------------------------------------------------ */

const monthOf = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const monthLabel = (key: string) =>
  new Date(`${key}-01T00:00:00`).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

const BUCKETS = ["Vadesi gelmemiş", "0-30 gün", "31-60 gün", "61-90 gün", "90+ gün"] as const;

export function ReportsTab({ items, rate }: { items: Receivable[]; rate: number | null }) {
  const nowMonth = monthOf(new Date().toISOString());
  const [from, setFrom] = useState(`${nowMonth.slice(0, 4)}-01`);
  const [to, setTo] = useState(nowMonth);

  const report = useMemo(() => {
    const inRange = (iso: string) => {
      const m = monthOf(iso);
      return (!from || m >= from) && (!to || m <= to);
    };
    const months = new Map<string, { income: number; expense: number; collected: number; paid: number }>();
    const getM = (m: string) => {
      let row = months.get(m);
      if (!row) {
        row = { income: 0, expense: 0, collected: 0, paid: 0 };
        months.set(m, row);
      }
      return row;
    };
    const cats = new Map<string, { income: number; expense: number }>();
    for (const r of items) {
      if (inRange(r.createdAt)) {
        // Tahakkuk: kayıt anındaki kurla (yoksa güncel kurla)
        const tl = toTRY(r, r.amount, r.rate ?? rate);
        const row = getM(monthOf(r.createdAt));
        const cat = r.category || "Belirtilmemiş";
        const c = cats.get(cat) ?? { income: 0, expense: 0 };
        if (r.type === "alacak") {
          row.income += tl;
          c.income += tl;
        } else {
          row.expense += tl;
          c.expense += tl;
        }
        cats.set(cat, c);
      }
      for (const p of r.payments) {
        if (!inRange(p.paidAt)) continue;
        const row = getM(monthOf(p.paidAt));
        if (r.type === "alacak") row.collected += payTRY(r, p, rate);
        else row.paid += payTRY(r, p, rate);
      }
    }
    const monthRows = [...months.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const sum = monthRows.reduce(
      (t, [, r]) => ({
        income: t.income + r.income,
        expense: t.expense + r.expense,
        collected: t.collected + r.collected,
        paid: t.paid + r.paid,
      }),
      { income: 0, expense: 0, collected: 0, paid: 0 }
    );
    const catRows = [...cats.entries()].sort((a, b) => b[1].income + b[1].expense - (a[1].income + a[1].expense));

    // Cari yaşlandırma: açık alacaklar, vade (yoksa kayıt) tarihine göre
    const today = Date.now();
    const aging = new Map<string, number[]>();
    for (const r of items) {
      if (r.type !== "alacak") continue;
      const left = remaining(r);
      if (left <= 0) continue;
      const tl = toTRY(r, left, rate);
      const base = new Date(r.dueDate ?? r.createdAt).getTime();
      const days = Math.floor((today - base) / 86400000);
      const b = r.dueDate && days <= 0 ? 0 : days <= 30 ? 1 : days <= 60 ? 2 : days <= 90 ? 3 : 4;
      const arr = aging.get(r.customerName) ?? [0, 0, 0, 0, 0];
      arr[b] += tl;
      aging.set(r.customerName, arr);
    }
    const agingRows = [...aging.entries()].sort((a, b) => b[1].reduce((x, y) => x + y, 0) - a[1].reduce((x, y) => x + y, 0));
    const agingTotals = BUCKETS.map((_, i) => agingRows.reduce((t, [, v]) => t + v[i], 0));
    return { monthRows, sum, catRows, agingRows, agingTotals };
  }, [items, rate, from, to]);

  async function exportExcel() {
    const XLSX = await import("xlsx");
    const book = XLSX.utils.book_new();
    const period = `${from ? monthLabel(from) : "Başlangıç"} - ${to ? monthLabel(to) : "Bugün"}`;
    const net = report.sum.income - report.sum.expense;
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.aoa_to_sheet([
        ["Dönem", period],
        ["Gelir (tahakkuk)", round(report.sum.income)],
        ["Gider (tahakkuk)", round(report.sum.expense)],
        ["Net", round(net)],
        ["Tahsil edilen", round(report.sum.collected)],
        ["Ödenen", round(report.sum.paid)],
      ]),
      "Özet"
    );
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.json_to_sheet(
        report.monthRows.map(([m, r]) => ({
          Ay: monthLabel(m),
          Gelir: round(r.income),
          Gider: round(r.expense),
          Net: round(r.income - r.expense),
          "Tahsil Edilen": round(r.collected),
          Ödenen: round(r.paid),
        }))
      ),
      "Aylık"
    );
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.json_to_sheet(
        report.catRows.map(([c, v]) => ({ Kalem: c, Gelir: round(v.income), Gider: round(v.expense), Net: round(v.income - v.expense) }))
      ),
      "Kalem Dağılımı"
    );
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.json_to_sheet(
        report.agingRows.map(([name, v]) => ({
          Cari: name,
          ...Object.fromEntries(BUCKETS.map((b, i) => [b, round(v[i])])),
          Toplam: round(v.reduce((x, y) => x + y, 0)),
        }))
      ),
      "Cari Yaşlandırma"
    );
    XLSX.writeFile(book, `finans-raporu-${from || "baslangic"}_${to || "bugun"}.xlsx`);
  }

  const net = report.sum.income - report.sum.expense;
  const label = "flex items-center gap-2 text-xs font-semibold text-slate-500";

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <label className={label}>
          Başlangıç Ayı
          <input type="month" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={`${inputClass} w-44`} />
        </label>
        <label className={label}>
          Bitiş Ayı
          <input type="month" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={`${inputClass} w-44`} />
        </label>
        <button
          type="button"
          onClick={exportExcel}
          className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
        >
          <Download className="h-4 w-4" />
          Excel&apos;e Aktar
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Printer className="h-4 w-4" />
          PDF / Yazdır
        </button>
      </div>

      <p className="mt-3 hidden text-sm font-semibold text-slate-700 print:block">
        BİS Bilişim Teknolojileri — Finans Raporu: {from ? monthLabel(from) : "Başlangıç"} – {to ? monthLabel(to) : "Bugün"}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { l: "Gelir (tahakkuk)", v: report.sum.income, c: "text-slate-900" },
          { l: "Gider (tahakkuk)", v: report.sum.expense, c: "text-amber-700" },
          { l: "Net", v: net, c: net < 0 ? "text-red-600" : "text-emerald-700" },
          { l: "Tahsil Edilen", v: report.sum.collected, c: "text-emerald-700" },
          { l: "Ödenen", v: report.sum.paid, c: "text-amber-700" },
        ].map((x) => (
          <div key={x.l} className={card}>
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{x.l}</p>
            <p className={`mt-1 text-lg font-extrabold ${x.c}`}>{formatTRY(round(x.v))}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-6 text-sm font-bold text-slate-900">Aylık Dağılım</h3>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full min-w-[36rem] text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className={th}>Ay</th>
              <th className={`${th} text-right`}>Gelir</th>
              <th className={`${th} text-right`}>Gider</th>
              <th className={`${th} text-right`}>Net</th>
              <th className={`${th} text-right`}>Tahsil Edilen</th>
              <th className={`${th} text-right`}>Ödenen</th>
            </tr>
          </thead>
          <tbody>
            {report.monthRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                  Bu dönemde kayıt yok.
                </td>
              </tr>
            )}
            {report.monthRows.map(([m, r]) => (
              <tr key={m} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-900">{monthLabel(m)}</td>
                <td className="px-3 py-2 text-right">{formatTRY(round(r.income))}</td>
                <td className="px-3 py-2 text-right text-amber-700">{formatTRY(round(r.expense))}</td>
                <td className={`px-3 py-2 text-right font-bold ${r.income - r.expense < 0 ? "text-red-600" : "text-emerald-700"}`}>
                  {formatTRY(round(r.income - r.expense))}
                </td>
                <td className="px-3 py-2 text-right text-emerald-700">{formatTRY(round(r.collected))}</td>
                <td className="px-3 py-2 text-right text-amber-700">{formatTRY(round(r.paid))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-6 text-sm font-bold text-slate-900">Kalem (İşlem Nedeni) Dağılımı</h3>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full min-w-[28rem] text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className={th}>Kalem</th>
              <th className={`${th} text-right`}>Gelir</th>
              <th className={`${th} text-right`}>Gider</th>
              <th className={`${th} text-right`}>Net</th>
            </tr>
          </thead>
          <tbody>
            {report.catRows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                  Bu dönemde kayıt yok.
                </td>
              </tr>
            )}
            {report.catRows.map(([c, v]) => (
              <tr key={c} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-900">{c}</td>
                <td className="px-3 py-2 text-right">{formatTRY(round(v.income))}</td>
                <td className="px-3 py-2 text-right text-amber-700">{formatTRY(round(v.expense))}</td>
                <td className={`px-3 py-2 text-right font-bold ${v.income - v.expense < 0 ? "text-red-600" : "text-emerald-700"}`}>
                  {formatTRY(round(v.income - v.expense))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-6 text-sm font-bold text-slate-900">Cari Yaşlandırma (açık alacaklar, bugünkü durum)</h3>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full min-w-[42rem] text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className={th}>Cari</th>
              {BUCKETS.map((b) => (
                <th key={b} className={`${th} text-right`}>
                  {b}
                </th>
              ))}
              <th className={`${th} text-right`}>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {report.agingRows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                  Açık alacak yok.
                </td>
              </tr>
            )}
            {report.agingRows.map(([name, v]) => (
              <tr key={name} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-900">{name}</td>
                {v.map((x, i) => (
                  <td key={i} className={`px-3 py-2 text-right ${i >= 3 && x > 0 ? "font-semibold text-red-600" : ""}`}>
                    {x > 0 ? formatTRY(round(x)) : "—"}
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-bold">{formatTRY(round(v.reduce((a, b) => a + b, 0)))}</td>
              </tr>
            ))}
            {report.agingRows.length > 0 && (
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
                <td className="px-3 py-2">Toplam</td>
                {report.agingTotals.map((x, i) => (
                  <td key={i} className="px-3 py-2 text-right">
                    {formatTRY(round(x))}
                  </td>
                ))}
                <td className="px-3 py-2 text-right">{formatTRY(round(report.agingTotals.reduce((a, b) => a + b, 0)))}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        Gelir/gider, kayıt tarihine (tahakkuk) göre ve USD için kayıt anındaki kurla; tahsilat/ödeme, ödeme tarihine ve ödeme anındaki kurla hesaplanır.
        Yaşlandırma güncel kurla ve vade tarihine (yoksa kayıt tarihine) göredir.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Geçmiş (denetim kaydı)                                              */
/* ------------------------------------------------------------------ */

type AuditEntry = {
  id: string;
  createdAt: string;
  entity: string;
  action: string;
  summary: string;
  restoredAt: string | null;
  restorable: boolean;
};

const ENTITY_LABEL: Record<string, string> = {
  transaction: "Kayıt",
  payment: "Ödeme",
  customer: "Cari",
  account: "Hesap",
  import: "Excel",
};
const ACTION_STYLE: Record<string, { label: string; cls: string }> = {
  create: { label: "Eklendi", cls: "bg-emerald-50 text-emerald-700" },
  update: { label: "Düzenlendi", cls: "bg-sky-50 text-sky-700" },
  delete: { label: "Silindi", cls: "bg-red-50 text-red-700" },
  restore: { label: "Geri getirildi", cls: "bg-violet-50 text-violet-700" },
  import: { label: "Yüklendi", cls: "bg-amber-50 text-amber-700" },
};

export function AuditTab({ onRestored }: { onRestored: () => void }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [onlyDeleted, setOnlyDeleted] = useState(false);

  const reload = useCallback(async () => {
    try {
      const result = await (await fetch("/api/admin/audit")).json();
      if (result.success) {
        setEntries(result.entries);
        setError("");
      } else setError(result.error || "Geçmiş alınamadı.");
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  async function restore(id: string) {
    if (!window.confirm("Silinen kayıt geri getirilsin mi?")) return;
    setBusyId(id);
    setError("");
    try {
      const result = await call("/api/admin/audit", "POST", { id });
      if (!result.success) setError(result.error || "Geri getirilemedi.");
      else {
        await reload();
        onRestored();
      }
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setBusyId(null);
    }
  }

  const shown = onlyDeleted ? entries.filter((e) => e.action === "delete") : entries;

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Son 300 işlem. Silinen kayıtlar buradan geri getirilebilir.</p>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <input type="checkbox" checked={onlyDeleted} onChange={(e) => setOnlyDeleted(e.target.checked)} />
          Sadece silinenler
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {loading && (
        <div className="flex justify-center py-10 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
      {!loading && (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full min-w-[40rem] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className={th}>Zaman</th>
                <th className={th}>Tür</th>
                <th className={th}>İşlem</th>
                <th className={th}>Özet</th>
                <th className={`${th} text-right`}>Geri Al</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                    Kayıt yok. (Önce <code>supabase/migrations_audit_accounts.sql</code> dosyasını çalıştırdığınızdan emin olun.)
                  </td>
                </tr>
              )}
              {shown.map((e) => {
                const a = ACTION_STYLE[e.action] ?? { label: e.action, cls: "bg-slate-100 text-slate-700" };
                return (
                  <tr key={e.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                      {new Date(e.createdAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{ENTITY_LABEL[e.entity] ?? e.entity}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.cls}`}>{a.label}</span>
                    </td>
                    <td className="px-3 py-2 break-words text-slate-800">{e.summary}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      {e.restorable ? (
                        <button
                          type="button"
                          disabled={busyId === e.id}
                          onClick={() => restore(e.id)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-blue-800 hover:bg-blue-50 disabled:opacity-50"
                        >
                          {busyId === e.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                          Geri getir
                        </button>
                      ) : e.restoredAt ? (
                        <span className="text-[11px] text-violet-600">geri getirildi</span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

