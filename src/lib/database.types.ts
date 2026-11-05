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
      transactions: {
        Relationships: [];
        Row: {
          id: string;
          type: string;
          customer_name: string | null;
          customer_phone: string | null;
          contact_name: string | null;
          title: string | null;
          notes: string | null;
          description: string | null;
          device_info: string | null;
          amount: number;
          paid_amount: number | null;
          status: string | null;
          category: string | null;
          due_date: string | null;
          created_at: string;
        };
        Insert: {
          type: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          contact_name?: string | null;
          title?: string | null;
          notes?: string | null;
          description?: string | null;
          device_info?: string | null;
          amount: number;
          paid_amount?: number | null;
          status?: string | null;
          category?: string | null;
          due_date?: string | null;
        };
        Update: {
          customer_name?: string | null;
          customer_phone?: string | null;
          notes?: string | null;
          description?: string | null;
          amount?: number;
          paid_amount?: number | null;
          status?: string | null;
          due_date?: string | null;
        };
      };
      payment_logs: {
        Relationships: [];
        Row: {
          id: string;
          transaction_id: string;
          amount: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          transaction_id: string;
          amount: number;
          note?: string | null;
        };
        Update: {
          amount?: number;
          note?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
