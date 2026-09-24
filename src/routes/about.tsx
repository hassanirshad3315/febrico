import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story & Heritage — FABRICO Style Studio" },
      {
        name: "description",
        content:
          "Discover the ethos of FABRICO: modern Pakistani women's fashion rooted in heritage craftsmanship, refined textiles, and contemporary luxury.",
      },
      { property: "og:title", content: "About FABRICO" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const waUrl = waLink(
    "923000000000",
    "Hello FABRICO, I'd like to learn more about your studio craftsmanship and bespoke services."
  );

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <p className="eyebrow text-gold text-[0.68rem] tracking-[0.25em]">
          THE STUDIO PHILOSOPHY
        </p>
        <h1 className="font-serif text-4xl sm:text-6xl text-foreground font-normal leading-tight">
          Modern Pakistani Classics
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          FABRICO was founded with a singular purpose: to craft timeless, contemporary Pakistani fashion that celebrates heritage artistry with quiet luxury.
        </p>
      </div>

      {/* Hero Image */}
      <div className="aspect-[16/9] overflow-hidden bg-muted border border-border">
        <img
          src="/images/hero-1.jpg"
          alt="FABRICO Studio"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Narrative Section */}
      <div className="space-y-8 text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans">
        <div className="space-y-3">
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground font-normal">
            Rooted in Craft, Styled for Today
          </h2>
          <p>
            In an era of fleeting trends, FABRICO stands for considered silhouettes, heirloom-quality fabrics, and meticulous hand-embellishment. From pure raw silks and breathable cambric lawns to lush winter velvets and sheer organzas, every textile is selected for its drape, feel, and longevity.
          </p>
          <p>
            Our master artisans in Lahore and across Punjab preserve traditional techniques — including intricate marori work, delicate gota patti, shadow work, and resham thread embroidery — while refining them for the modern woman's lifestyle.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div className="space-y-2 p-6 bg-muted/30 border border-border/60">
            <h3 className="font-serif text-xl text-foreground">Effortless WhatsApp Commerce</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We believe luxury is personal. Our WhatsApp concierge allows you to discuss customizations, sizing, measurements, and delivery with a dedicated stylist before confirming your order.
            </p>
          </div>

          <div className="space-y-2 p-6 bg-muted/30 border border-border/60">
            <h3 className="font-serif text-xl text-foreground">Nationwide Reach</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              With doorstep delivery across Lahore, Karachi, Islamabad, Peshawar, Multan, and every city in Pakistan, your bespoke pieces arrive carefully packaged and ready to wear.
            </p>
          </div>
        </div>

        <div className="pt-8 text-center space-y-4">
          <p className="font-serif text-2xl text-foreground">
            Have questions about our collections or bespoke orders?
          </p>
          <div className="flex justify-center gap-4">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-lux bg-[#25D366] text-white hover:bg-[#1EBE5D] border-none flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4 fill-white" />
              <span>Speak with Our Concierge</span>
            </a>
            <Link to="/shop" className="btn-outline">
              Explore The Catalog
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
