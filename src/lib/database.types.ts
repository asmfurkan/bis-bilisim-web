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
          customer_address: string | null;
          delivery_type: string;
          cargo_tracking_no: string | null;
          cargo_fee: number | null;
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
          customer_address?: string | null;
          delivery_type?: string;
          cargo_tracking_no?: string | null;
          cargo_fee?: number | null;
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
          customer_address?: string | null;
          delivery_type?: string;
          cargo_tracking_no?: string | null;
          cargo_fee?: number | null;
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
          currency: string | null;
          usd_amount: number | null;
          created_at: string;
        };
        Insert: {
          currency?: string | null;
          usd_amount?: number | null;
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
          title?: string | null;
          currency?: string | null;
          usd_amount?: number | null;
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
      customers: {
        Relationships: [];
        Row: { id: string; name: string; phone: string | null; created_at: string };
        Insert: { name: string; phone?: string | null };
        Update: { name?: string; phone?: string | null };
      };
      exchange_rates: {
        Relationships: [];
        Row: { currency: string; rate: number; updated_at: string };
        Insert: { currency: string; rate: number; updated_at?: string };
        Update: { rate?: number; updated_at?: string };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
