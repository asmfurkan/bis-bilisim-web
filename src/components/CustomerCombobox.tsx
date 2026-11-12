"use client";

import { useRef, useState } from "react";

type Customer = { name: string; phone: string | null };

let cache: Customer[] | null = null;

/**
 * customers tablosuna bağlı aranabilir müşteri alanı. Listede olmayan isim serbestçe yazılabilir
 * (kayıt sırasında sunucu otomatik olarak customers tablosuna ekler).
 * Kayıtlı müşteri seçilince aynı formdaki telefon alanı (phoneField) doldurulur.
 */
export default function CustomerCombobox({
  name = "customerName",
  phoneField = "phone",
  defaultValue = "",
  placeholder = "Müşteri adı",
  className,
  maxLength = 80,
}: {
  name?: string;
  phoneField?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(cache ?? []);
  const inputRef = useRef<HTMLInputElement>(null);

  async function ensureLoaded() {
    if (cache) return;
    try {
      const response = await fetch("/api/admin/customers");
      const result = await response.json();
      if (result.success) {
        cache = result.customers;
        setCustomers(result.customers);
      }
    } catch {
      /* liste yüklenemezse serbest metin olarak çalışır */
    }
  }

  const q = value.trim().toLocaleLowerCase("tr-TR");
  const matches = customers.filter((c) => !q || c.name.toLocaleLowerCase("tr-TR").includes(q)).slice(0, 8);
  const exact = customers.some((c) => c.name.toLocaleLowerCase("tr-TR") === q);

  function pick(customer: Customer) {
    setValue(customer.name);
    setOpen(false);
    const phone = inputRef.current?.form?.elements.namedItem(phoneField);
    if (phone instanceof HTMLInputElement && customer.phone) phone.value = customer.phone;
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        name={name}
        type="text"
        required
        autoComplete="off"
        maxLength={maxLength}
        value={value}
        placeholder={placeholder}
        className={className}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          void ensureLoaded();
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && (matches.length > 0 || (q && !exact)) && (
        <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg">
          {matches.map((c) => (
            <li key={c.name}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(c)}
                className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left hover:bg-blue-50"
              >
                <span className="truncate text-slate-900">{c.name}</span>
                {c.phone && <span className="shrink-0 text-xs text-slate-400">{c.phone}</span>}
              </button>
            </li>
          ))}
          {q && !exact && (
            <li className="px-3 py-1.5 text-xs text-slate-500">
              &ldquo;{value.trim()}&rdquo; yeni müşteri olarak kaydedilecek
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
