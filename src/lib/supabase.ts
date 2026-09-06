import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Yalnızca sunucu tarafında (API route handler'ları) kullanılmalıdır.
// service_role anahtarı RLS'yi bypass eder; tarayıcıya asla gönderilmemelidir.
let cachedClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase yapılandırması eksik: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY ortam değişkenlerini tanımlayın."
    );
  }

  cachedClient = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  return cachedClient;
}
