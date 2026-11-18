"use client";

import { useRef, useState } from "react";
import { AlertCircle, Download, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { formatTRY } from "@/lib/finance";
import { downloadTemplate, parseInvoiceFile, type ParseResult } from "@/lib/invoiceImport";

export default function InvoiceImportModal({
  onClose,
  onImported,
  type = "alacak",
}: {
  type?: "alacak" | "borc";
  onClose: () => void;
  onImported: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [dup, setDup] = useState<{ count: number; samples: { customerName: string; title: string; amount: number }[] } | null>(null);

  async function handleFile(file: File) {
    setDup(null);
    setParsing(true);
    setError("");
    setResult(null);
    setDone(null);
    setFileName(file.name);
    try {
      setResult(await parseInvoiceFile(file));
    } catch {
      setError("Dosya okunamadı. Geçerli bir .xlsx veya .csv dosyası seçin.");
    } finally {
      setParsing(false);
    }
  }

  async function handleConfirm(onDuplicate: "ask" | "skip" | "force" = "ask") {
    if (!result || result.rows.length === 0) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/finance/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: result.rows, type, onDuplicate }),
      });
      const data = await response.json();
      if (data.duplicate) {
        setDup({ count: data.duplicates, samples: data.samples ?? [] });
        return;
      }
      if (!data.success) {
        setError(data.error || "Kaydedilemedi.");
        return;
      }
      setDup(null);
      setDone(
        `${data.inserted} kayıt eklendi` +
          (onDuplicate === "skip" && data.duplicates ? `, ${data.duplicates} mükerrer kayıt atlandı` : "") +
          (onDuplicate === "force" && data.duplicates ? ` (${data.duplicates} mükerrer kayıt dahil)` : "") +
          "."
      );
      setResult(null);
      onImported();
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setSaving(false);
    }
  }

  const total = result?.rows.reduce((sum, r) => sum + r.amount, 0) ?? 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <FileSpreadsheet className="h-5 w-5 text-blue-800" />
            {type === "borc" ? "Excel'den Gider/Borç Yükle" : "Excel'den Gelir/Alacak Yükle"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Kapat" className="text-slate-400 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="text-sm text-slate-600">
            Dosyada en az <b>Müşteri / Cari</b> ve <b>Tutar</b> sütunları olmalı. Fatura No, Tarih (vade) ve Açıklama isteğe bağlıdır.
            Sütun adlarında büyük/küçük harf ve Türkçe karakter farkı önemsenmez.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
            >
              <Upload className="h-4 w-4" />
              Dosya Seç
            </button>
            <button
              type="button"
              onClick={() => downloadTemplate()}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              <Download className="h-4 w-4" />
              Örnek Şablon İndir
            </button>
            {fileName && <span className="self-center text-xs text-slate-500">{fileName}</span>}
          </div>

          {parsing && (
            <div className="flex justify-center py-8 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          {result && result.missingColumns.length > 0 && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Şu sütun(lar) bulunamadı: {result.missingColumns.join(", ")}. Şablonu indirip başlıkları kontrol edin.</p>
            </div>
          )}

          {result && result.missingColumns.length === 0 && (
            <div className="mt-5">
              <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
                {result.rows.length} adet fatura bulundu, Toplam: {formatTRY(total)}
                {result.skipped > 0 && (
                  <span className="ml-2 font-normal text-amber-700">({result.skipped} geçersiz satır atlanacak)</span>
                )}
              </p>
              {result.rows.length > 0 && (
                <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-slate-100">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Müşteri</th>
                        <th className="px-3 py-2">Fatura No</th>
                        <th className="px-3 py-2">Vade</th>
                        <th className="px-3 py-2 text-right">Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.rows.map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-medium text-slate-900">{r.customerName}</td>
                          <td className="px-3 py-2 text-slate-600">{r.title || "—"}</td>
                          <td className="px-3 py-2 text-slate-600">
                            {r.dueDate ? new Date(r.dueDate).toLocaleDateString("tr-TR") : "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatTRY(r.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {done && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{done}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            {done ? "Kapat" : "Vazgeç"}
          </button>
          {result && result.rows.length > 0 && result.missingColumns.length === 0 && (
            <button
              type="button"
              onClick={() => handleConfirm("ask")}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Onayla ve Kaydet
            </button>
          )}
        </div>
      </div>
      {dup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4" role="alertdialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="flex items-center gap-2 text-base font-bold text-red-700">
              <AlertCircle className="h-5 w-5" />
              Dikkat: Bu belge numarasına ait kayıt zaten mevcut!
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {dup.count} kayıt daha önce eklenmiş (aynı belge no veya aynı cari + tutar). Hiçbir kayıt henüz eklenmedi.
            </p>
            <ul className="mt-3 max-h-40 space-y-1 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
              {dup.samples.map((s, i) => (
                <li key={i}>
                  <b>{s.customerName}</b> · {s.title || "belge no yok"} · {formatTRY(s.amount)}
                </li>
              ))}
              {dup.count > dup.samples.length && <li className="text-slate-400">… ve {dup.count - dup.samples.length} kayıt daha</li>}
            </ul>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setDup(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                İptal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleConfirm("force")}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                Yine de Hepsini Ekle
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleConfirm("skip")}
                className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
              >
                Mükerrerleri Atla, Kalanı Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
