import type { BagItem } from "./store";
import { formatPKR } from "./catalog";

export type WaSettings = { number?: string; label?: string; default_message?: string };
export type WaTemplate = { greeting: string; item: string; total: string; closing: string };

const DEFAULT_TPL: WaTemplate = {
  greeting: "Hello FABRICO,\nI would like to place an order for:",
  item: "{{index}}. {{product_name}}\nSKU: {{sku}}\nSize: {{size}}\nColor: {{color}}\nQty: {{quantity}}\nPrice: PKR {{price}}\n{{product_url}}",
  total: "Total: PKR {{total}}",
  closing: "Please confirm availability and delivery details.",
};

/** Safe {{var}} substitution — unknown vars become empty, values are stringified only. */
function fill(tpl: string, vars: Record<string, string | number>) {
  return tpl.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (_, k) => (k in vars ? String(vars[k]) : ""));
}

export function buildOrderMessage(items: BagItem[], tpl?: Partial<WaTemplate>, origin = "") {
  const t = { ...DEFAULT_TPL, ...(tpl ?? {}) };
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const lines = items.map((i, idx) =>
    fill(t.item, {
      index: idx + 1,
      product_name: i.name,
      sku: i.sku,
      size: i.size || "-",
      color: i.color || "-",
      quantity: i.qty,
      price: (i.price * i.qty).toLocaleString("en-PK"),
      product_url: `${origin}/product/${i.slug}`,
    }),
  );
  return [t.greeting, "", lines.join("\n\n"), "", fill(t.total, { total: total.toLocaleString("en-PK") }), "", t.closing].join("\n");
}

export function waLink(number: string | undefined, message: string) {
  const digits = (number ?? "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export { formatPKR };
