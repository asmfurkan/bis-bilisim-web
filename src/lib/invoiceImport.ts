export interface ImportRow {
  customerName: string;
  amount: number;
  title: string;
  dueDate: string | null;
  notes: string | null;
}

export interface ParseResult {
  rows: ImportRow[];
  skipped: number;
  missingColumns: string[];
}

const ALIASES = {
  customer: ["musteri", "musteriadi", "cari", "cariadi", "unvan", "contactname", "customername"],
  amount: ["tutar", "genelToplam", "toplam", "nettutar", "amount"],
  title: ["faturano", "belgeno", "fatura", "title", "description"],
  date: ["tarih", "faturatarihi", "duedate", "createdat"],
  notes: ["aciklama", "not", "notes"],
} as const;

/** Büyük/küçük harf, Türkçe karakter, boşluk ve noktalama farkını yok sayar. */
function normalize(value: unknown) {
  return String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const NORMALIZED_ALIASES = Object.fromEntries(
  Object.entries(ALIASES).map(([key, list]) => [key, list.map(normalize)])
) as Record<keyof typeof ALIASES, string[]>;

function findHeader(headers: string[], key: keyof typeof ALIASES) {
  const aliases = NORMALIZED_ALIASES[key];
  // Alias sırası öncelik belirler (örn. "Fatura No", "description"den önce gelir).
  for (const alias of aliases) {
    const found = headers.find((h) => normalize(h) === alias);
    if (found !== undefined) return found;
  }
  return undefined;
}

export function parseAmount(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null;
  let s = String(value ?? "").replace(/[^\d.,-]/g, "");
  if (!s) return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    // Son ayraç ondalık ayraçtır: 1.234,56 (TR) veya 1,234.56 (EN)
    s = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lastComma > -1) {
    s = /,\d{1,2}$/.test(s) ? s.replace(",", ".") : s.replace(/,/g, "");
  } else if (lastDot > -1 && !/\.\d{1,2}$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function parseDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  if (typeof value === "number") {
    // Excel seri tarihi (1900 sistemi)
    if (value < 1 || value > 80000) return null;
    const d = new Date(Math.round((value - 25569) * 86400 * 1000));
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  const s = String(value).trim();
  let m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (m) return `${m[3]}-${pad(Number(m[2]))}-${pad(Number(m[1]))}`;
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${pad(Number(m[2]))}-${pad(Number(m[3]))}`;
  return null;
}

export async function parseInvoiceFile(file: File): Promise<ParseResult> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: true });

  const headers = Array.from(new Set(records.flatMap((r) => Object.keys(r))));
  const customerKey = findHeader(headers, "customer");
  const amountKey = findHeader(headers, "amount");
  const titleKey = findHeader(headers, "title");
  const dateKey = findHeader(headers, "date");
  const notesKey = findHeader(headers, "notes");

  const missingColumns: string[] = [];
  if (!customerKey) missingColumns.push("Müşteri / Cari Adı");
  if (!amountKey) missingColumns.push("Tutar");
  if (missingColumns.length > 0) return { rows: [], skipped: 0, missingColumns };

  const rows: ImportRow[] = [];
  let skipped = 0;
  for (const record of records) {
    const customerName = String(record[customerKey!] ?? "").trim();
    const amount = parseAmount(record[amountKey!]);
    if (!customerName || amount === null) {
      skipped += 1;
      continue;
    }
    const notes = notesKey ? String(record[notesKey] ?? "").trim() : "";
    rows.push({
      customerName,
      amount,
      title: titleKey ? String(record[titleKey] ?? "").trim() : "",
      dueDate: dateKey ? parseDate(record[dateKey]) : null,
      notes: notes || null,
    });
  }
  return { rows, skipped, missingColumns };
}

export async function downloadTemplate() {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.aoa_to_sheet([
    ["Müşteri", "Fatura No", "Tutar", "Tarih", "Açıklama"],
    ["Örnek Müşteri A.Ş.", "BMY2026000000100", 12500.5, "30.11.2026", "Yazıcı onarımı"],
    ["Örnek Müşteri 2", "BMY2026000000101", 3000, "15.12.2026", ""],
  ]);
  sheet["!cols"] = [{ wch: 28 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 30 }];
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Faturalar");
  XLSX.writeFile(book, "fatura-sablonu.xlsx");
}
