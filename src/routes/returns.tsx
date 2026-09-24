import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, MessageCircle, ShieldAlert } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Exchanges Policy | FABRICO" },
      { name: "description", content: "Details on returns, size exchanges, and quality guarantees for FABRICO orders." },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  const waUrl = waLink(
    "923000000000",
    "Hello FABRICO, I would like to request an exchange or return for my order."
  );

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <p className="eyebrow text-gold text-[0.65rem] tracking-[0.25em]">ASSURANCE & CARE</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-foreground font-normal">
          Returns & Exchanges
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          We stand behind the craft and quality of every FABRICO piece. Read our transparent exchange guidelines below.
        </p>
      </div>

      <div className="bg-card border border-border p-8 space-y-6 text-xs text-foreground/80 leading-relaxed font-sans">
        <div className="space-y-2">
          <h3 className="font-serif text-2xl text-foreground font-normal">7-Day Exchange Window</h3>
          <p>
            If you need a different size or if an item does not meet your expectations, you may initiate an exchange within 7 calendar days of receiving your package.
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <h3 className="font-serif text-2xl text-foreground font-normal">Exchange Conditions</h3>
          <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
            <li>Item must be in original unworn, unwashed condition with all brand tags and seal intact.</li>
            <li>Unstitched items must include complete fabric components (shirt, dupatta, trousers).</li>
            <li>Customized or altered garments are eligible for alteration support but not complete return.</li>
            <li>Sale or promotional items are exchangeable for store credit or alternate sizes subject to stock availability.</li>
          </ul>
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <h3 className="font-serif text-2xl text-foreground font-normal">How to Initiate an Exchange</h3>
          <p>
            1. Contact our concierge team on WhatsApp with your Order ID and photo of the garment.
          </p>
          <p>
            2. Our team will verify and dispatch the replacement parcel or schedule a return pickup.
          </p>
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">Need to request an exchange?</p>
            <p className="text-muted-foreground text-[0.7rem]">Our team will assist you on WhatsApp immediately.</p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-lux bg-[#25D366] text-white hover:bg-[#1EBE5D] border-none text-xs flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4 fill-white" />
            <span>Initiate on WhatsApp</span>
          </a>
        </div>
      </div>
    </main>
  );
}
