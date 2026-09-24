import { useState, useSyncExternalStore, useTransition } from "react";
import { Link } from "@tanstack/react-router";
import { X, ShoppingBag, MessageCircle, Heart, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatPKR, STOCK_LABEL, type Product } from "@/lib/catalog";
import { store, useStore, getSessionId } from "@/lib/store";
import { track } from "@/lib/analytics";
import { buildOrderMessage, waLink } from "@/lib/whatsapp";
import { createInquiry } from "@/lib/orders.functions";
import { toast } from "sonner";

let current: Product | null = null;
const ls = new Set<() => void>();

export function openQuickView(p: Product | null) {
  current = p;
  ls.forEach((l) => l());
}

export function QuickView({ whatsappNumber = "923000000000" }: { whatsappNumber?: string }) {
  const p = useSyncExternalStore(
    (l) => (ls.add(l), () => ls.delete(l)),
    () => current,
    () => null,
  );

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [isPending, startTransition] = useTransition();

  const isWishlisted = useStore((s) => (p ? s.wishlist.includes(p.id) : false));

  // Reset variant selections when product changes
  const activeProduct = p;
  if (activeProduct && !selectedSize && activeProduct.sizes?.length && activeProduct.sizes[0]) {
    setSelectedSize(activeProduct.sizes[0]);
  }
  if (activeProduct && !selectedColor && activeProduct.colors?.length && activeProduct.colors[0]) {
    setSelectedColor(activeProduct.colors[0]);
  }

  if (!p) return null;

  const handleAddToBag = () => {
    store.addToBag({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      sku: p.sku,
      image: p.images[0] || "/images/look-1.jpg",
      price: p.sale_price ?? p.price,
      size: selectedSize || (p.sizes[0] ?? "Standard"),
      color: selectedColor || (p.colors[0] ?? "Standard"),
      qty,
    });
    track("bag_add", { product_id: p.id, collection_id: p.collection_id });
    toast.success(`${p.name} added to your bag.`);
    openQuickView(null);
  };

  const handleDirectWhatsApp = () => {
    startTransition(async () => {
      const size = selectedSize || (p.sizes[0] ?? "Standard");
      const color = selectedColor || (p.colors[0] ?? "Standard");
      const price = p.sale_price ?? p.price;

      await createInquiry({
        data: {
          source: "quick_view",
          session_id: getSessionId(),
          items: [{ productId: p.id, size, color, qty }],
        },
      });

      track("whatsapp_click", { product_id: p.id, source: "quick_view" });

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const message = buildOrderMessage(
        [
          {
            productId: p.id,
            slug: p.slug,
            name: p.name,
            sku: p.sku,
            image: p.images[0] || "/images/look-1.jpg",
            price,
            size,
            color,
            qty,
          },
        ],
        undefined,
        origin
      );

      const url = waLink(whatsappNumber, message);
      window.open(url, "_blank", "noopener,noreferrer");
      openQuickView(null);
    });
  };

  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && openQuickView(null)}>
      <DialogContent className="max-w-3xl rounded-none p-0 overflow-hidden border border-border bg-card shadow-2xl">
        <DialogTitle className="sr-only">{p.name} Quick View</DialogTitle>
        <div className="grid md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Image */}
          <div className="relative bg-muted aspect-[3/4] md:aspect-auto">
            <img
              src={p.images[0]}
              alt={p.image_alts[0] ?? p.name}
              className="h-full w-full object-cover"
              style={{ objectPosition: p.focal }}
            />
            {p.is_new && (
              <span className="eyebrow absolute top-3 left-3 bg-background/90 text-foreground px-2 py-1 text-[0.6rem]">
                New Arrival
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              {p.collection && (
                <p className="eyebrow text-[0.6rem] text-muted-foreground">
                  {p.collection.name}
                </p>
              )}
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground font-normal leading-tight">
                {p.name}
              </h2>

              <div className="flex items-baseline gap-3">
                {p.sale_price ? (
                  <>
                    <span className="text-base font-semibold text-destructive">
                      {formatPKR(p.sale_price)}
                    </span>
                    <s className="text-xs text-muted-foreground">{formatPKR(p.price)}</s>
                  </>
                ) : (
                  <span className="text-base font-medium text-foreground">{formatPKR(p.price)}</span>
                )}
                <span className="eyebrow text-[0.58rem] text-muted-foreground">
                  SKU: {p.sku}
                </span>
              </div>

              <div className="pt-1">
                <span className="inline-block px-2 py-0.5 text-[0.6rem] font-medium bg-muted border border-border text-foreground uppercase tracking-wider">
                  {STOCK_LABEL[p.stock_status]}
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {p.short_description || p.description}
              </p>

              {/* Sizes */}
              {p.sizes?.length > 0 && p.sizes[0] !== "One Size" && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="eyebrow text-[0.6rem] text-foreground">Select Size</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`h-8 min-w-8 px-2.5 text-xs uppercase tracking-wider border transition-colors ${
                          selectedSize === s
                            ? "border-foreground bg-foreground text-background font-semibold"
                            : "border-border text-foreground hover:border-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {p.colors?.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="eyebrow text-[0.6rem] text-foreground">Color: {selectedColor}</span>
                  <div className="flex flex-wrap gap-2">
                    {p.colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`px-2.5 py-1 text-xs border transition-colors ${
                          selectedColor === c
                            ? "border-foreground bg-muted font-medium"
                            : "border-border text-muted-foreground hover:border-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAddToBag}
                  disabled={p.stock_status === "sold_out"}
                  className="btn-lux w-full flex items-center justify-center gap-1.5 text-xs py-3"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add To Bag</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectWhatsApp}
                  disabled={isPending}
                  className="btn-lux w-full flex items-center justify-center gap-1.5 bg-[#25D366] text-white hover:bg-[#1EBE5D] border-none text-xs py-3"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4 fill-white" />
                  )}
                  <span>Order Now</span>
                </button>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const added = store.toggleWishlist(p.id);
                    track(added ? "wishlist_add" : "wishlist_remove", { product_id: p.id });
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-current text-destructive" : ""}`} />
                  <span>{isWishlisted ? "Saved to Wishlist" : "Save to Wishlist"}</span>
                </button>

                <Link
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  onClick={() => openQuickView(null)}
                  className="text-xs font-medium underline underline-offset-4 hover:text-gold transition-colors"
                >
                  View Full Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
