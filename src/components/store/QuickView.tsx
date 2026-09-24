import { useSyncExternalStore } from "react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatPKR, STOCK_LABEL, type Product } from "@/lib/catalog";

let current: Product | null = null;
const ls = new Set<() => void>();
export function openQuickView(p: Product | null) {
  current = p;
  ls.forEach((l) => l());
}

export function QuickView() {
  const p = useSyncExternalStore(
    (l) => (ls.add(l), () => ls.delete(l)),
    () => current,
    () => null,
  );
  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && openQuickView(null)}>
      <DialogContent className="max-w-3xl rounded-none p-0">
        {p && (
          <div className="grid md:grid-cols-2">
            <img src={p.images[0]} alt={p.image_alts[0] ?? p.name} className="aspect-[2/3] w-full object-cover" />
            <div className="space-y-4 p-6">
              <DialogTitle className="font-serif text-3xl font-normal">{p.name}</DialogTitle>
              <p className="text-sm">{formatPKR(p.sale_price ?? p.price)}</p>
              <p className="text-sm text-muted-foreground">{p.short_description}</p>
              <p className="eyebrow">{STOCK_LABEL[p.stock_status]}</p>
              <Link to="/product/$slug" params={{ slug: p.slug }} onClick={() => openQuickView(null)} className="btn-lux w-full">
                View Full Details
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
