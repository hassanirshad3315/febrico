import { createFileRoute } from "@tanstack/react-router";
import { Truck, Clock, ShieldCheck, MapPin } from "lucide-react";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping & Nationwide Delivery | FABRICO" },
      { name: "description", content: "Details on delivery timelines, shipping charges, and nationwide coverage across Pakistan." },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <p className="eyebrow text-gold text-[0.65rem] tracking-[0.25em]">LOGISTICS & FULFILLMENT</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-foreground font-normal">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          We ensure every handcrafted order is safely packaged and delivered across Pakistan with trackable courier services.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border space-y-2 text-center">
          <Truck className="h-6 w-6 text-gold mx-auto" />
          <h3 className="font-serif text-lg text-foreground">Free Delivery</h3>
          <p className="text-xs text-muted-foreground">Complimentary shipping on all orders over PKR 5,000.</p>
        </div>
        <div className="p-6 bg-card border border-border space-y-2 text-center">
          <Clock className="h-6 w-6 text-gold mx-auto" />
          <h3 className="font-serif text-lg text-foreground">2–4 Business Days</h3>
          <p className="text-xs text-muted-foreground">Standard transit time for major metropolitan cities across Pakistan.</p>
        </div>
        <div className="p-6 bg-card border border-border space-y-2 text-center">
          <ShieldCheck className="h-6 w-6 text-gold mx-auto" />
          <h3 className="font-serif text-lg text-foreground">Trackable Couriers</h3>
          <p className="text-xs text-muted-foreground">Dispatched via TCS, Call Courier, and Leopards with real-time SMS tracking.</p>
        </div>
      </div>

      <div className="space-y-6 text-xs text-foreground/80 leading-relaxed font-sans bg-card border border-border p-8">
        <div className="space-y-2">
          <h3 className="font-serif text-xl text-foreground">Delivery Timelines</h3>
          <p>
            • <strong>Ready to Wear:</strong> Dispatched within 24–48 hours. Estimated delivery 2–4 working days.
          </p>
          <p>
            • <strong>Unstitched Collections:</strong> Dispatched within 24 hours. Estimated delivery 2–3 working days.
          </p>
          <p>
            • <strong>Custom Stitched & Formal Orders:</strong> Dispatched in 7–14 working days depending on hand-embellishment details confirmed on WhatsApp.
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <h3 className="font-serif text-xl text-foreground">Standard Shipping Charges</h3>
          <p>
            For orders under PKR 5,000, a flat shipping fee of PKR 250 is applied nationwide. Orders above PKR 5,000 enjoy 100% complimentary delivery.
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <h3 className="font-serif text-xl text-foreground">Order Confirmation on WhatsApp</h3>
          <p>
            Before dispatching any parcel, our concierge team will reach out via WhatsApp to confirm the delivery address, contact number, and selected sizes to prevent delays.
          </p>
        </div>
      </div>
    </main>
  );
}
