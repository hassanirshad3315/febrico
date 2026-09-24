import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ArrowRight, Eye, ShoppingBag, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_FIELDS, formatPKR, type Product } from "@/lib/catalog";
import { openQuickView } from "@/components/store/QuickView";

export const Route = createFileRoute("/lookbook")({
  head: () => ({
    meta: [
      { title: "Editorial Lookbook — FABRICO Style Studio" },
      {
        name: "description",
        content:
          "Discover our editorial lookbook: curated Pakistani fashion stories exploring craft, silhouette, and quiet luxury.",
      },
      { property: "og:title", content: "The Editorial Lookbook | FABRICO" },
    ],
  }),
  component: LookbookPage,
});

type LookbookItem = {
  id: string;
  image: string;
  caption: string | null;
  hotspots: { x: number; y: number; product_id: string }[];
  sort_order: number;
};

type Lookbook = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover: string | null;
  items: LookbookItem[];
};

function LookbookPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: lookbooks = [], isLoading } = useQuery({
    queryKey: ["lookbooks", "all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lookbooks")
        .select("*, items:lookbook_items(*)")
        .order("sort_order");

      return (data as unknown as Lookbook[]) || [];
    },
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ["all-products-for-lookbook"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select(PRODUCT_FIELDS);
      return (data as unknown as Product[]) || [];
    },
  });

  const productMap = new Map(allProducts.map((p) => [p.id, p]));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <p className="eyebrow text-gold text-[0.65rem] tracking-[0.25em]">
          EDITORIAL NARRATIVE
        </p>
        <h1 className="font-serif text-4xl sm:text-6xl text-foreground font-normal leading-tight">
          Modern Pakistani Classics
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
          Six styled looks exploring raw silk craftsmanship, deep velvet hues, and easy printed lawn co-ords. Tap any look to shop the ensemble.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="eyebrow text-xs">Loading Lookbook...</span>
        </div>
      ) : (
        <div className="space-y-24">
          {lookbooks.map((lb) => (
            <div key={lb.id} className="space-y-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {lb.items.map((item, idx) => {
                  const itemProducts = (item.hotspots || [])
                    .map((h) => productMap.get(h.product_id))
                    .filter(Boolean) as Product[];

                  return (
                    <article
                      key={item.id || idx}
                      className="group relative space-y-4 bg-card border border-border/80 p-4 sm:p-6 shadow-sm"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                        <img
                          src={item.image}
                          alt={item.caption || `Look ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Interactive Hotspot pins */}
                        {item.hotspots?.map((h, hIdx) => {
                          const hpProduct = productMap.get(h.product_id);
                          return (
                            <button
                              key={hIdx}
                              type="button"
                              onClick={() => hpProduct && openQuickView(hpProduct)}
                              style={{ left: `${h.x}%`, top: `${h.y}%` }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-ivory/90 text-ink shadow-lg flex items-center justify-center hover:scale-125 transition-transform animate-pulse cursor-pointer group/pin"
                              aria-label={`View ${hpProduct?.name || "piece"}`}
                            >
                              <span className="h-2 w-2 rounded-full bg-ink" />
                            </button>
                          );
                        })}
                      </div>

                      {/* Caption & Linked Items */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <p className="eyebrow text-[0.62rem] text-gold font-semibold">
                            LOOK 0{idx + 1}
                          </p>
                          <span className="text-[0.65rem] text-muted-foreground">
                            {itemProducts.length} Styled Pieces
                          </span>
                        </div>
                        {item.caption && (
                          <h3 className="font-serif text-2xl text-foreground font-normal">
                            {item.caption}
                          </h3>
                        )}

                        {/* Products in this look */}
                        {itemProducts.length > 0 && (
                          <div className="pt-3 border-t border-border/60 space-y-2">
                            <p className="eyebrow text-[0.58rem] text-muted-foreground uppercase">
                              Pieces in this ensemble:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {itemProducts.map((p) => (
                                <div
                                  key={p.id}
                                  className="flex items-center justify-between p-2 bg-muted/40 border border-border/50 text-xs"
                                >
                                  <div className="min-w-0 pr-2">
                                    <Link
                                      to="/product/$slug"
                                      params={{ slug: p.slug }}
                                      className="font-medium text-foreground hover:text-gold truncate block"
                                    >
                                      {p.name}
                                    </Link>
                                    <p className="text-[0.65rem] text-muted-foreground">
                                      {formatPKR(p.sale_price ?? p.price)}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => openQuickView(p)}
                                    className="p-1.5 text-muted-foreground hover:text-foreground shrink-0"
                                    aria-label="Quick View"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
