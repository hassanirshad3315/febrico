import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | FABRICO" },
      { name: "description", content: "Terms of service and conditions for purchasing from the FABRICO studio." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-8">
      <div className="border-b border-border pb-6 space-y-2">
        <p className="eyebrow text-gold text-[0.65rem] tracking-[0.25em]">LEGAL</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-foreground font-normal">
          Terms of Service
        </h1>
        <p className="text-xs text-muted-foreground">Last updated: September 2026</p>
      </div>

      <div className="space-y-6 text-xs text-foreground/80 leading-relaxed font-sans bg-card border border-border p-8">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl text-foreground">1. Order Formation & Confirmation</h2>
          <p>
            Placing an inquiry or sending an order message through WhatsApp does not constitute an automatically confirmed sale until stock availability, measurements, and delivery timeline are verified and confirmed by the FABRICO concierge team.
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <h2 className="font-serif text-2xl text-foreground">2. Pricing & Currency</h2>
          <p>
            All prices listed on the FABRICO website are denominated in Pakistani Rupees (PKR) inclusive of applicable domestic taxes unless otherwise indicated.
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <h2 className="font-serif text-2xl text-foreground">3. Handcrafted Product Variations</h2>
          <p>
            Because our garments utilize artisanal hand-embroidery, block prints, and natural dyeing methods, subtle variations in thread tension, motif placement, and color hue reflect genuine handmade craftsmanship.
          </p>
        </div>
      </div>
    </main>
  );
}
