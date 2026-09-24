import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  source: z.enum(["bag", "product_page", "quick_view", "campaign", "lookbook", "shop_the_look", "floating"]),
  session_id: z.string().max(64).optional(),
  campaign_slug: z.string().max(80).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        size: z.string().max(20).default(""),
        color: z.string().max(40).default(""),
        qty: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(30),
});

/** Records a WhatsApp inquiry (NOT a confirmed sale). Prices are re-read from the database. */
export const createInquiry = createServerFn({ method: "POST" })
  .inputValidator((d) => schema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ids = [...new Set(data.items.map((i) => i.productId))];
    const { data: prods, error } = await supabaseAdmin
      .from("products")
      .select("id,name,sku,price,sale_price,collection_id,status")
      .in("id", ids)
      .eq("status", "published");
    if (error || !prods?.length) return { ok: false };
    const rows = data.items
      .map((i) => {
        const p = prods.find((x) => x.id === i.productId);
        if (!p) return null;
        return { product_id: p.id, product_name: p.name, sku: p.sku, size: i.size, color: i.color, qty: i.qty, unit_price: p.sale_price ?? p.price };
      })
      .filter(Boolean) as any[];
    const total = rows.reduce((s, r) => s + r.qty * r.unit_price, 0);
    const { data: order, error: oe } = await supabaseAdmin
      .from("orders")
      .insert({ source: data.source, status: "whatsapp_opened", total, session_id: data.session_id ?? null, campaign_slug: data.campaign_slug ?? null })
      .select("id")
      .single();
    if (oe || !order) return { ok: false };
    await supabaseAdmin.from("order_items").insert(rows.map((r) => ({ ...r, order_id: order.id })));
    await supabaseAdmin.from("order_events").insert({ order_id: order.id, status: "whatsapp_opened", note: `WhatsApp opened from ${data.source}` });
    await supabaseAdmin.from("analytics_events").insert(
      rows.map((r) => ({
        event_type: "whatsapp_inquiry",
        product_id: r.product_id,
        collection_id: prods.find((p) => p.id === r.product_id)?.collection_id ?? null,
        source: data.source,
        session_id: data.session_id ?? null,
        campaign_slug: data.campaign_slug ?? null,
      })),
    );
    return { ok: true };
  });
