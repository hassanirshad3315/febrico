import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "./store";

export type EventType =
  | "page_view"
  | "product_view"
  | "collection_view"
  | "campaign_view"
  | "search"
  | "wishlist_add"
  | "wishlist_remove"
  | "quick_view"
  | "product_click"
  | "whatsapp_click"
  | "whatsapp_inquiry"
  | "bag_add"
  | "cta_click";

const seen = new Set<string>();

/** Fire-and-forget event. Views are de-duplicated per session in memory. */
export function track(
  event_type: EventType,
  meta: { product_id?: string | null; collection_id?: string | null; campaign_slug?: string; source?: string; query?: string } = {},
) {
  if (typeof window === "undefined") return;
  if (/bot|crawl|spider|headless/i.test(navigator.userAgent)) return;
  if (event_type.endsWith("_view")) {
    const key = `${event_type}:${meta.product_id ?? meta.collection_id ?? meta.campaign_slug ?? location.pathname}`;
    if (seen.has(key)) return;
    seen.add(key);
  }
  void supabase
    .from("analytics_events")
    .insert({
      event_type,
      product_id: meta.product_id ?? null,
      collection_id: meta.collection_id ?? null,
      campaign_slug: meta.campaign_slug?.slice(0, 80) ?? null,
      source: meta.source?.slice(0, 40) ?? null,
      query: meta.query?.slice(0, 120) ?? null,
      session_id: getSessionId().slice(0, 64),
      path: location.pathname.slice(0, 300),
    })
    .then(() => {});
}
