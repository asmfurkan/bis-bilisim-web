import type { DeviceStatus } from "@/lib/devices";

export interface Database {
  public: {
    Tables: {
      devices: {
        Relationships: [];
        Row: {
          id: string;
          tracking_code: string;
          customer_name: string;
          phone: string;
          phone_digits: string;
          model: string;
          serial_no: string | null;
          complaint: string;
          service_note: string | null;
          status: DeviceStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tracking_code: string;
          customer_name: string;
          phone: string;
          model: string;
          serial_no?: string | null;
          complaint: string;
          service_note?: string | null;
          status?: DeviceStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tracking_code?: string;
          customer_name?: string;
          phone?: string;
          model?: string;
          serial_no?: string | null;
          complaint?: string;
          service_note?: string | null;
          status?: DeviceStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
