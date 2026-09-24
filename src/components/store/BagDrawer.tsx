import { useState, useTransition } from "react";
import { Link } from "@tanstack/react-router";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircle, ShieldCheck, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { store, useStore, getSessionId } from "@/lib/store";
import { formatPKR } from "@/lib/catalog";
import { buildOrderMessage, waLink } from "@/lib/whatsapp";
import { createInquiry } from "@/lib/orders.functions";
import { track } from "@/lib/analytics";
import { toast } from "sonner";

export function BagDrawer({ whatsappNumber = "923000000000" }: { whatsappNumber?: string }) {
  const bag = useStore((s) => s.bag);
  const isOpen = useStore((s) => s.bagOpen);
  const [isPending, startTransition] = useTransition();

  const total = bag.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = bag.reduce((sum, item) => sum + item.qty, 0);
  const freeShippingThreshold = 5000;
  const progressToFreeShipping = Math.min(100, (total / freeShippingThreshold) * 100);

  const handleWhatsAppCheckout = async () => {
    if (bag.length === 0) return;

    startTransition(async () => {
      try {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const message = buildOrderMessage(bag, undefined, origin);

        // Record inquiry in DB
        await createInquiry({
          data: {
            source: "bag",
            session_id: getSessionId(),
            items: bag.map((b) => ({
              productId: b.productId,
              size: b.size || "Standard",
              color: b.color || "Standard",
              qty: b.qty,
            })),
          },
        });

        track("whatsapp_click", { source: "bag" });
        toast.success("Connecting to FABRICO Concierge on WhatsApp...");

        const url = waLink(whatsappNumber, message);
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (err) {
        console.error("Failed to process WhatsApp checkout", err);
        // Still open WhatsApp as fallback
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const message = buildOrderMessage(bag, undefined, origin);
        const url = waLink(whatsappNumber, message);
        window.open(url, "_blank", "noopener,noreferrer");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => store.setBagOpen(open)}>
      <DialogContent className="fixed right-0 top-0 h-full w-full sm:max-w-md p-0 gap-0 border-l border-border bg-card shadow-2xl rounded-none flex flex-col data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300">
        <DialogTitle className="sr-only">Shopping Bag</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-foreground" />
            <h2 className="eyebrow text-xs tracking-[0.2em] font-semibold text-foreground">
              Shopping Bag ({itemCount})
            </h2>
          </div>
          <button
            onClick={() => store.setBagOpen(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close bag"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Free Shipping Indicator */}
        <div className="bg-muted/50 px-6 py-3 border-b border-border/60 text-xs">
          {total >= freeShippingThreshold ? (
            <p className="text-foreground font-medium flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-600"></span>
              You have unlocked complimentary nationwide shipping!
            </p>
          ) : (
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-[0.72rem]">
                Add <span className="font-semibold text-foreground">{formatPKR(freeShippingThreshold - total)}</span> more for free delivery.
              </p>
              <div className="h-1 w-full bg-border overflow-hidden">
                <div
                  className="h-full bg-foreground transition-all duration-500"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bag Content */}
        {bag.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-7 w-7 stroke-1" />
            </div>
            <div className="space-y-1">
              <p className="font-serif text-2xl text-foreground">Your bag is empty</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Explore our latest luxury collections, festive pieces, and ready-to-wear essentials.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2 w-full max-w-xs">
              <Link
                to="/new-in"
                onClick={() => store.setBagOpen(false)}
                className="btn-lux w-full text-center"
              >
                Shop New Arrivals
              </Link>
              <Link
                to="/collections"
                onClick={() => store.setBagOpen(false)}
                className="btn-outline w-full text-center"
              >
                Explore Collections
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Scrollable Item List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/60 px-6">
              {bag.map((item, idx) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="py-4 flex gap-4">
                  <Link
                    to="/product/$slug"
                    params={{ slug: item.slug }}
                    onClick={() => store.setBagOpen(false)}
                    className="shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-18 object-cover bg-muted border border-border"
                    />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          to="/product/$slug"
                          params={{ slug: item.slug }}
                          onClick={() => store.setBagOpen(false)}
                          className="text-xs font-medium text-foreground hover:text-gold transition-colors truncate"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => store.setQty(idx, 0)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="eyebrow text-[0.55rem] text-muted-foreground mt-0.5">
                        SKU: {item.sku}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[0.68rem] text-muted-foreground">
                        {item.size && <span className="bg-muted px-1.5 py-0.5 border border-border/50">{item.size}</span>}
                        {item.color && <span className="bg-muted px-1.5 py-0.5 border border-border/50">{item.color}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => store.setQty(idx, item.qty - 1)}
                          className="h-6 w-6 grid place-items-center text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </button>
                        <span className="h-6 px-2 text-xs font-medium grid place-items-center min-w-6">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => store.setQty(idx, item.qty + 1)}
                          className="h-6 w-6 grid place-items-center text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      </div>

                      <p className="text-xs font-semibold text-foreground">
                        {formatPKR(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / Checkout */}
            <div className="border-t border-border p-6 bg-card space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Estimated Total</span>
                  <span className="font-semibold text-foreground text-sm">{formatPKR(total)}</span>
                </div>
                <p className="text-[0.65rem] text-muted-foreground">
                  Final pricing, customizations, and doorstep delivery are confirmed on WhatsApp before dispatch.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleWhatsAppCheckout}
                  disabled={isPending}
                  className="btn-lux w-full flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#1EBE5D] border-none shadow-md"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 fill-white" />
                      <span>Proceed To WhatsApp Order</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => store.setBagOpen(false)}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-1 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2 border-t border-border/40 text-[0.62rem] text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-gold" /> Authentic Craft
                </span>
                <span>•</span>
                <span>Verified WhatsApp Support</span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
