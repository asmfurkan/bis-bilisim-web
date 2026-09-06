export const DEVICE_STATUSES = [
  "kayit_alindi",
  "ariza_tespiti",
  "onarimda",
  "hazir",
  "teslim_edildi",
] as const;

export type DeviceStatus = (typeof DEVICE_STATUSES)[number];

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  kayit_alindi: "Kayıt Alındı",
  ariza_tespiti: "Arıza Tespiti",
  onarimda: "Onarımda",
  hazir: "Hazır / Teslim Bekliyor",
  teslim_edildi: "Teslim Edildi",
};

export function isDeviceStatus(value: unknown): value is DeviceStatus {
  return typeof value === "string" && (DEVICE_STATUSES as readonly string[]).includes(value);
}

export const POPULAR_EPSON_MODELS = [
  "Epson L3110",
  "Epson L3150",
  "Epson L3160",
  "Epson L3210",
  "Epson L3250",
  "Epson L3260",
  "Epson L4150",
  "Epson L4260",
  "Epson L5190",
  "Epson L6170",
  "Epson L6190",
  "Epson EcoTank ET-2810",
  "Epson EcoTank ET-4800",
  "Epson WorkForce WF-2830",
  "Epson WorkForce WF-2865",
  "Epson WorkForce Pro WF-3820",
];

export function normalizePhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function generateTrackingCode() {
  const number = Math.floor(1000 + Math.random() * 9000);
  return `BIS-${number}`;
}

export interface PublicDeviceResult {
  trackingCode: string;
  model: string;
  complaint: string;
  serviceNote: string | null;
  status: DeviceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDevice {
  id: string;
  trackingCode: string;
  customerName: string;
  phone: string;
  model: string;
  serialNo: string | null;
  complaint: string;
  serviceNote: string | null;
  status: DeviceStatus;
  createdAt: string;
  updatedAt: string;
}
