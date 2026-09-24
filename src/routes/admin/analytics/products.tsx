import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  TrendingUp,
  Eye,
  Heart,
  ShoppingBag,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_FIELDS, formatPKR, type Product } from "@/lib/catalog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AnalyticsSubNav } from "@/components/admin/AnalyticsSubNav";

export const Route = createFileRoute("/admin/analytics/products")({
  head: () => ({
    meta: [{ title: "Product Performance Analytics — FABRICO Admin" }],
  }),
  component: AdminAnalyticsProductsPage,
});

function AdminAnalyticsProductsPage() {
  const [sortField, setSortField] = useState<"views" | "wishlist" | "bag" | "inquiries">("views");

  const { data: products = [], isLoading: prodsLoading } = useQuery({
    queryKey: ["admin", "all-products-analytics"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select(PRODUCT_FIELDS).eq("is_active", true);
      return (data || []) as unknown as Product[];
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["admin", "analytics-events-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("analytics_events")
        .select("event_type, product_id")
        .not("product_id", "is", null);
      return data || [];
    },
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ["admin", "analytics-product-inquiries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_items")
        .select("product_id");
      return data || [];
    },
  });

  // Build product-level metrics
  const productMetrics = products.map((product) => {
    const prodEvents = events.filter((e) => e.product_id === product.id);
    const views = prodEvents.filter((e) => e.event_type === "product_view").length;
    const wishlistAdds = prodEvents.filter((e) => e.event_type === "wishlist_add").length;
    const bagAdds = prodEvents.filter((e) => e.event_type === "bag_add").length;
    const inqCount = inquiries.filter((i) => i.product_id === product.id).length;
    const conversionRate = views > 0 ? ((inqCount / views) * 100) : 0;

    return {
      product,
      views,
      wishlistAdds,
      bagAdds,
      inqCount,
      conversionRate,
    };
  });

  const sorted = [...productMetrics].sort((a, b) => {
    if (sortField === "views") return b.views - a.views;
    if (sortField === "wishlist") return b.wishlistAdds - a.wishlistAdds;
    if (sortField === "bag") return b.bagAdds - a.bagAdds;
    return b.inqCount - a.inqCount;
  });

  const totalViews = productMetrics.reduce((acc, m) => acc + m.views, 0);
  const totalWishlist = productMetrics.reduce((acc, m) => acc + m.wishlistAdds, 0);
  const avgConversion = productMetrics.length > 0
    ? productMetrics.reduce((acc, m) => acc + m.conversionRate, 0) / productMetrics.length
    : 0;

  return (
    <AdminLayout title="Product Performance Analytics">
      <div className="space-y-8">
        <AnalyticsSubNav />

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Active Products</span>
              <Package className="h-4 w-4" />
            </div>
            <p className="font-serif text-3xl font-semibold text-foreground">{products.length}</p>
          </div>

          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Total Product Views</span>
              <Eye className="h-4 w-4" />
            </div>
            <p className="font-serif text-3xl font-semibold text-foreground">{totalViews}</p>
          </div>

          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Wishlist Saves</span>
              <Heart className="h-4 w-4 text-destructive" />
            </div>
            <p className="font-serif text-3xl font-semibold text-foreground">{totalWishlist}</p>
          </div>

          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Avg. Conversion Rate</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="font-serif text-3xl font-semibold text-foreground">{avgConversion.toFixed(1)}%</p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <span className="text-xs text-muted-foreground mr-2">Sort by:</span>
          {(["views", "wishlist", "bag", "inquiries"] as const).map((field) => (
            <button
              key={field}
              type="button"
              onClick={() => setSortField(field)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors border ${
                sortField === field
                  ? "bg-foreground text-background border-foreground font-semibold"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {field === "views" ? "Views" : field === "wishlist" ? "Wishlist" : field === "bag" ? "Bag Adds" : "Inquiries"}
            </button>
          ))}
        </div>

        {/* Product Performance Table */}
        <div className="bg-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border uppercase tracking-wider text-[0.65rem] text-muted-foreground">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4 text-center">Views</th>
                  <th className="p-4 text-center">Wishlist</th>
                  <th className="p-4 text-center">Bag Adds</th>
                  <th className="p-4 text-center">Inquiries</th>
                  <th className="p-4 text-right">Conversion</th>
                  <th className="p-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {prodsLoading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground">Loading product analytics...</td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground">No active products found.</td>
                  </tr>
                ) : (
                  sorted.map(({ product, views, wishlistAdds, bagAdds, inqCount, conversionRate }) => (
                    <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-8 bg-muted overflow-hidden shrink-0">
                            {product.images?.[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground line-clamp-1">{product.name}</span>
                            <span className="text-[0.65rem] text-muted-foreground">{product.category_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center font-semibold">{views}</td>
                      <td className="p-4 text-center">{wishlistAdds}</td>
                      <td className="p-4 text-center">{bagAdds}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[0.65rem] font-bold ${
                          inqCount > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                        }`}>
                          {inqCount}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-[0.65rem] font-bold ${
                          conversionRate > 5 ? "text-emerald-600" : conversionRate > 0 ? "text-gold" : "text-muted-foreground"
                        }`}>
                          {conversionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-4 text-right font-serif font-semibold text-foreground">{formatPKR(product.price)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
