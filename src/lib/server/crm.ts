import type { Lead } from "@/lib/admin-store";

// Server-only: this file is imported only from server code (content-repository),
// so CRM_API_URL / CRM_API_TOKEN never reach the browser bundle.

const TIMEOUT_MS = 5000;

export function isCrmConfigured(): boolean {
  // Token is optional: some CRM endpoints accept requests without it.
  return Boolean(process.env.CRM_API_URL?.trim());
}

function buildPayload(lead: Lead) {
  return {
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    interest: lead.interest,
    message: lead.message,
    site_name: lead.site_name,
    lead_id: lead.id,
    created_at: lead.createdAt,
  };
}

/**
 * Best-effort: never throws, never blocks saving the lead on our side.
 * Returns true when the CRM accepted the lead.
 */
export async function sendLeadToCrm(lead: Lead): Promise<boolean> {
  if (!isCrmConfigured()) return false;
  try {
    const res = await fetch(process.env.CRM_API_URL!.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Sent only if a token is set.
        ...(process.env.CRM_API_TOKEN?.trim()
          ? { Authorization: `Bearer ${process.env.CRM_API_TOKEN.trim()}` }
          : {}),
      },
      body: JSON.stringify(buildPayload(lead)),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[crm] lead ${lead.id} rejected: HTTP ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    // Log only the message: never the token or the lead's personal data.
    console.error(`[crm] lead ${lead.id} failed:`, err instanceof Error ? err.message : "unknown");
    return false;
  }
}
