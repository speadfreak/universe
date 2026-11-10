import { createHmac } from "crypto";

/**
 * Outgoing webhooks, signed with HMAC-SHA256.
 * Header: x-umc-signature = hex(hmac_sha256(WEBHOOK_SECRET, rawBody))
 */
export async function emitWebhook(event: string, payload: Record<string, unknown>): Promise<void> {
  const url = process.env.WEBHOOK_URL;
  const secret = process.env.WEBHOOK_SECRET;
  if (!url || !secret) return; // not configured — silently skip

  const body = JSON.stringify({ event, sentAt: new Date().toISOString(), data: payload });
  const signature = createHmac("sha256", secret).update(body).digest("hex");

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-umc-event": event,
        "x-umc-signature": signature,
      },
      body,
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Webhook delivery failures must never break the user flow.
  }
}
