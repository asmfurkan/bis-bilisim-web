"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { formatMoney, formatTRY, toTRY, type Receivable } from "@/lib/finance";

type Movement = {
  key: string;
  date: string;
  label: string;
  detail: string;
  kind: "borc" | "odeme";
  amount: number;
  currency: Receivable["currency"];
  tl: number;
};

/** Seçilen müşteriye ait tüm borç/alacak ve tahsilat hareketleri + özet (cari ekstre). */
export default function CustomerStatementDrawer({
  customerName,
  items,
  rate,
  onClose,
}: {
  customerName: string;
  items: Receivable[];
  rate: number | null;
  onClose: () => void;
}) {
  const { movements, totalDebt, totalPaid, ourDebt, net, hasUsd } = useMemo(() => {
    const key = customerName.trim().toLocaleLowerCase("tr-TR");
    const own = items.filter((r) => r.customerName.trim().toLocaleLowerCase("tr-TR") === key);
    const list: Movement[] = [];
    let debt = 0;
    let paid = 0;
    let ours = 0;
    for (const r of own) {
      const what = [r.title, r.description].filter(Boolean).join(" · ") || "—";
      const tlAmount = toTRY(r, r.amount, rate);
      const tlPaid = toTRY(r, r.paid, rate);
      if (r.type === "alacak") {
        debt += tlAmount;
        paid += tlPaid;
      } else {
        // "borc": bizim müşteriye olan borcumuz; ödenen kısmı düşülür
        ours += tlAmount - tlPaid;
      }
      list.push({
        key: r.id,
        date: r.createdAt,
        label: r.type === "alacak" ? "Borçlandırma" : "Bizim borcumuz",
        detail: what,
        kind: "borc",
        amount: r.amount,
        currency: r.currency,
        tl: tlAmount,
      });
      for (const p of r.payments) {
        list.push({
          key: `${r.id}-${p.id}`,
          date: p.paidAt,
          label: "Tahsilat",
          detail: [what, p.note].filter(Boolean).join(" · "),
          kind: "odeme",
          amount: p.amount,
          currency: r.currency,
          tl: toTRY(r, p.amount, rate),
        });
      }
    }
    list.sort((a, b) => a.date.localeCompare(b.date));
    const round = (n: number) => Math.round(n * 100) / 100;
    return {
      movements: list,
      totalDebt: round(debt),
      totalPaid: round(paid),
      ourDebt: round(ours),
      net: round(debt - paid - ours),
      hasUsd: own.some((r) => r.currency === "USD"),
    };
  }, [customerName, items, rate]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Cari ekstre">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Cari Ekstre</p>
            <h2 className="text-lg font-extrabold text-slate-900">{customerName}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {movements.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">Bu müşteriye ait hareket bulunamadı.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {movements.map((m) => (
                <li key={m.key} className="flex items-start justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">
                      {new Date(m.date).toLocaleDateString("tr-TR")} ·{" "}
                      <span className={m.kind === "odeme" ? "text-emerald-700" : "text-slate-600"}>{m.label}</span>
                    </p>
                    <p className="truncate text-slate-700" title={m.detail}>
                      {m.detail}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`font-semibold ${m.kind === "odeme" ? "text-emerald-700" : "text-slate-900"}`}>
                      {m.kind === "odeme" ? "−" : "+"}
                      {formatMoney(m.amount, m.currency)}
                    </p>
                    {m.currency === "USD" && (
                      <p className="text-[11px] text-slate-400">≈ {formatTRY(m.tl)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="space-y-1.5 border-t border-slate-100 bg-slate-50 px-5 py-4 text-sm">
          {hasUsd && (
            <p className="text-[11px] text-slate-500">
              {rate ? "USD kayıtlar güncel kurla TL’ye çevrilmiştir." : "USD kuru girilmediği için USD kayıtlar 0 ₺ sayıldı."}
            </p>
          )}
          <div className="flex justify-between">
            <span className="text-slate-600">Toplam Borcu</span>
            <span className="font-semibold text-slate-900">{formatTRY(totalDebt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Toplam Ödemesi</span>
            <span className="font-semibold text-emerald-700">{formatTRY(totalPaid)}</span>
          </div>
          {ourDebt !== 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Bizim Borcumuz</span>
              <span className="font-semibold text-amber-700">{formatTRY(ourDebt)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
            <span className="font-bold text-slate-900">Net Güncel Bakiye</span>
            <span className={`font-extrabold ${net > 0 ? "text-red-600" : net < 0 ? "text-sky-700" : "text-emerald-700"}`}>
              {formatTRY(net)}
              <span className="ml-1.5 text-xs font-medium">
                {net > 0 ? "(borçlu)" : net < 0 ? "(alacaklı)" : ""}
              </span>
            </span>
          </div>
        </footer>
      </aside>
    </div>
  );
}
