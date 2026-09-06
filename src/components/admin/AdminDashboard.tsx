"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import NewDeviceForm from "@/components/admin/NewDeviceForm";
import DeviceList from "@/components/admin/DeviceList";
import type { AdminDevice, DeviceStatus } from "@/lib/devices";

export default function AdminDashboard() {
  const router = useRouter();
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DeviceStatus | "hepsi">("hepsi");
  const [refreshToken, setRefreshToken] = useState(0);

  const handleRefresh = useCallback(() => setRefreshToken((token) => token + 1), []);

  useEffect(() => {
    let ignore = false;

    async function loadDevices() {
      setLoading(true);
      try {
        const url = filter === "hepsi" ? "/api/admin/devices" : `/api/admin/devices?status=${filter}`;
        const response = await fetch(url);
        const result = await response.json();
        if (!ignore && result.success) {
          setDevices(result.devices);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDevices();

    return () => {
      ignore = true;
    };
  }, [filter, refreshToken]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] bg-slate-50 py-16">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Yönetim Paneli</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <NewDeviceForm onCreated={handleRefresh} />
          <DeviceList
            devices={devices}
            loading={loading}
            filter={filter}
            onFilterChange={setFilter}
            onDeviceUpdated={(updated) =>
              setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
            }
          />
        </div>
      </div>
    </div>
  );
}
