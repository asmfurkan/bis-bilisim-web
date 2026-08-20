"use client";

import { useState, useSyncExternalStore } from "react";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "bis-cookie-consent";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return "accepted";
}

export default function CookieConsent() {
  const [dismissed, setDismissed] = useState(false);
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const visible = !dismissed && consent === null;

  function handleChoice(choice: "accepted" | "rejected") {
    window.localStorage.setItem(STORAGE_KEY, choice);
    setDismissed(true);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Çerez onayı"
      className="animate-fade-in-up fixed inset-x-0 bottom-0 z-[60] p-4 sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-md sm:p-0"
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-lg sm:flex-row sm:items-start">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
          <Cookie className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">
            Çerezleri Kullanıyoruz
          </p>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">
            Size daha iyi bir deneyim sunmak için çerezlerden faydalanıyoruz.
            Detaylı bilgi için{" "}
            <a
              href="/gizlilik-politikasi"
              className="font-semibold text-blue-800 hover:underline"
            >
              Gizlilik Politikası
            </a>{" "}
            sayfamızı inceleyebilirsiniz.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleChoice("accepted")}
              className="rounded-full bg-blue-800 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-900/30 transition-all hover:-translate-y-0.5 hover:bg-blue-900 hover:shadow-lg hover:shadow-amber-400/40 active:translate-y-0 active:scale-[0.98]"
            >
              Kabul Et
            </button>
            <button
              type="button"
              onClick={() => handleChoice("rejected")}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Reddet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
