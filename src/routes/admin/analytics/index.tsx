import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Award,
  Sparkles,
  ShoppingBag,
  Eye,
  Heart,
  MessageCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_FIELDS, formatPKR, type Product } from "@/lib/catalog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AnalyticsSubNav } from "@/components/admin/AnalyticsSubNav";

export const Route = createFileRoute("/admin/analytics/")({
  head: () => ({
    meta: [{ title: "Merchandising Intelligence — FABRICO Admin" }],
  }),
  component: AdminAnalyticsPage,
});

function AdminAnalyticsPage() {
  const [metric, setMetric] = useState<"top_week" | "most_loved" | "trending" | "best_sellers">("top_week");

  // Fetch Ranked Products based on selected metric
  const { data: rankedProducts = [], isLoading: rankedLoading } = useQuery({
    queryKey: ["admin", "ranked-products", metric],
    queryFn: async () => {
      const { data: rankRows } = await supabase.rpc("ranked_products", {
        _metric: metric,
        _limit: 10,
      });

      if (!rankRows?.length) return [];
      const ids = rankRows.map((r: any) => r.product_id);
      const { data: prods } = await supabase.from("products").select(PRODUCT_FIELDS).in("id", ids);

      const map = new Map((prods as unknown as Product[] || []).map((p) => [p.id, p]));
      return rankRows
        .map((r: any) => ({ product: map.get(r.product_id), score: r.score }))
        .filter((item: any) => Boolean(item.product));
    },
  });

  // Fetch telemetry event counts
  const { data: eventCounts, isLoading: eventsLoading } = useQuery({
    queryKey: ["admin", "analytics-events-summary"],
    queryFn: async () => {
      const { data } = await supabase
        .from("analytics_events")
        .select("event_type");

      const counts: Record<string, number> = {
        page_view: 0,
        product_view: 0,
        wishlist_add: 0,
        bag_add: 0,
        whatsapp_click: 0,
        whatsapp_inquiry: 0,
      };

      (data || []).forEach((e) => {
        const et = e.event_type;
        if (et && et in counts) {
          counts[et] = (counts[et] ?? 0) + 1;
        }
      });

      return counts;
    },
  });

  return (
    <AdminLayout title="Merchandising Intelligence">
      <div className="space-y-8">
        <AnalyticsSubNav />

        {/* Header note */}
        <div className="bg-card border border-border p-6 space-y-2">
          <h3 className="font-serif text-2xl text-foreground">Data-Driven Merchandising Engine</h3>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            FABRICO combines browsing telemetry, wishlist intent, WhatsApp interest, and verified confirmed orders to dynamically power storefront rails without exposing private sales figures to customers.
          </p>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-card border border-border p-4 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Store Views</span>
              <Eye className="h-3.5 w-3.5" />
            </div>
            <p className="font-serif text-2xl text-foreground font-semibold">
              {(eventCounts?.['page_view'] || 0) + (eventCounts?.['product_view'] || 0)}
            </p>
          </div>

          <div className="bg-card border border-border p-4 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Product Views</span>
              <Sparkles className="h-3.5 w-3.5 text-gold" />
            </div>
            <p className="font-serif text-2xl text-foreground font-semibold">
              {eventCounts?.['product_view'] || 0}
            </p>
          </div>

          <div className="bg-card border border-border p-4 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Wishlist Intent</span>
              <Heart className="h-3.5 w-3.5 text-destructive" />
            </div>
            <p className="font-serif text-2xl text-foreground font-semibold">
              {eventCounts?.['wishlist_add'] || 0}
            </p>
          </div>

          <div className="bg-card border border-border p-4 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Bag Additions</span>
              <ShoppingBag className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <p className="font-serif text-2xl text-foreground font-semibold">
              {eventCounts?.['bag_add'] || 0}
            </p>
          </div>

          <div className="bg-card border border-border p-4 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">WhatsApp Clicks</span>
              <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
            </div>
            <p className="font-serif text-2xl text-foreground font-semibold">
              {(eventCounts?.['whatsapp_click'] || 0) + (eventCounts?.['whatsapp_inquiry'] || 0)}
            </p>
          </div>
        </div>

        {/* Algorithm Rankings Selector */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="font-serif text-2xl text-foreground">Ranked Studio Products</h3>
              <p className="text-xs text-muted-foreground">Inspect how pieces rank under each customer-facing merchandising algorithm</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMetric("top_week")}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  metric === "top_week"
                    ? "bg-foreground text-background font-semibold"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Top This Week
              </button>
              <button
                type="button"
                onClick={() => setMetric("most_loved")}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  metric === "most_loved"
                    ? "bg-foreground text-background font-semibold"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Most Loved (Month)
              </button>
              <button
                type="button"
                onClick={() => setMetric("trending")}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  metric === "trending"
                    ? "bg-foreground text-background font-semibold"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Trending Momentum
              </button>
              <button
                type="button"
                onClick={() => setMetric("best_sellers")}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  metric === "best_sellers"
                    ? "bg-foreground text-background font-semibold"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Best Sellers (Confirmed)
              </button>
            </div>
          </div>

          {/* Rankings Table */}
          <div className="bg-card border border-border overflow-hidden">
            {rankedLoading ? (
              <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="eyebrow text-xs">Computing algorithm scores...</span>
              </div>
            ) : rankedProducts.length === 0 ? (
              <div className="py-20 text-center space-y-2">
                <p className="font-serif text-2xl text-foreground">No ranking data yet</p>
                <p className="text-xs text-muted-foreground">Browse the store to generate engagement telemetry.</p>
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground uppercase tracking-wider text-[0.65rem] border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Piece</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3 text-right">Computed Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {rankedProducts.map((item: any, idx: number) => {
                    const p = item.product;
                    return (
                      <tr key={p.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono font-bold text-foreground">
                          0{idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="h-10 w-8 object-cover bg-muted border border-border"
                            />
                            <span className="font-semibold text-foreground">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[0.7rem]">{p.sku}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.category?.name || "—"}</td>
                        <td className="px-4 py-3 font-semibold font-sans">{formatPKR(p.sale_price ?? p.price)}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-gold">
                          {Number(item.score).toFixed(1)} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
