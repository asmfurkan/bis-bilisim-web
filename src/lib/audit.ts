import { getSupabaseAdmin } from "@/lib/supabase";

export type AuditEntity = "transaction" | "payment" | "customer" | "account" | "import";
export type AuditAction = "create" | "update" | "delete" | "restore" | "import";

/** Denetim kaydı yazar. Hata olursa asıl işlemi bozmaz. */
export async function logAudit(entry: {
  entity: AuditEntity;
  entityId?: string | null;
  action: AuditAction;
  summary: string;
  snapshot?: unknown;
}) {
  try {
    const { error } = await getSupabaseAdmin()
      .from("audit_log")
      .insert({
        entity: entry.entity,
        entity_id: entry.entityId ?? null,
        action: entry.action,
        summary: entry.summary.slice(0, 500),
        snapshot: entry.snapshot ?? null,
      });
    if (error) console.error("Denetim kaydı yazılamadı:", error);
  } catch (error) {
    console.error("Denetim kaydı yazılamadı:", error);
  }
}
