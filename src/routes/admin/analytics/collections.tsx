import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Layers,
  TrendingUp,
  Eye,
  ShoppingBag,
  Package,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_FIELDS, formatPKR, type Product } from "@/lib/catalog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AnalyticsSubNav } from "@/components/admin/AnalyticsSubNav";

export const Route = createFileRoute("/admin/analytics/collections")({
  head: () => ({
    meta: [{ title: "Collection Performance Analytics — FABRICO Admin" }],
  }),
  component: AdminAnalyticsCollectionsPage,
});

function AdminAnalyticsCollectionsPage() {
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["admin", "analytics-collections"],
    queryFn: async () => {
      const { data } = await supabase
        .from("collections")
        .select("id, title, slug, hero_image, is_active");
      return data || [];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin", "analytics-collection-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select(PRODUCT_FIELDS).eq("is_active", true);
      return (data || []) as unknown as Product[];
    },
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ["admin", "analytics-collection-inquiries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("inquiries")
        .select("id, status, total_pkr, order_items(product_id)");
      return data || [];
    },
  });

  const { data: rankedCollections = [] } = useQuery({
    queryKey: ["admin", "ranked-collections-all"],
    queryFn: async () => {
      const { data } = await supabase.rpc("ranked_collections", { _limit: 20 });
      return data || [];
    },
  });

  // Build collection-level metrics
  const collectionMetrics = collections.map((col: any) => {
    const colProducts = products.filter((p) => p.collection_id === col.id);
    const productIds = new Set(colProducts.map((p) => p.id));
    const totalValue = colProducts.reduce((acc, p) => acc + p.price, 0);
    const avgPrice = colProducts.length > 0 ? totalValue / colProducts.length : 0;

    // Count inquiries containing products from this collection
    let inqCount = 0;
    let confirmedRevenue = 0;
    for (const inq of inquiries) {
      const items = (inq as any).order_items || [];
      const hasColProduct = items.some((item: any) => productIds.has(item.product_id));
      if (hasColProduct) {
        inqCount++;
        if ((inq as any).status === "confirmed" || (inq as any).status === "shipped" || (inq as any).status === "delivered") {
          confirmedRevenue += Number((inq as any).total_pkr || 0);
        }
      }
    }

    // Find ranking score
    const rankRow = rankedCollections.find((r: any) => r.collection_id === col.id);
    const score = rankRow ? Number((rankRow as any).score || 0) : 0;

    return {
      collection: col,
      productCount: colProducts.length,
      avgPrice,
      inqCount,
      confirmedRevenue,
      score,
    };
  });

  const sortedMetrics = [...collectionMetrics].sort((a, b) => b.score - a.score);

  return (
    <AdminLayout title="Collection Performance Analytics">
      <div className="space-y-8">
        <AnalyticsSubNav />

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Total Collections</span>
              <Layers className="h-4 w-4" />
            </div>
            <p className="font-serif text-3xl font-semibold text-foreground">{collections.length}</p>
          </div>

          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Active Collections</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="font-serif text-3xl font-semibold text-foreground">
              {collections.filter((c: any) => c.is_active).length}
            </p>
          </div>

          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Collection Inquiries</span>
              <ShoppingBag className="h-4 w-4 text-gold" />
            </div>
            <p className="font-serif text-3xl font-semibold text-foreground">
              {collectionMetrics.reduce((acc, m) => acc + m.inqCount, 0)}
            </p>
          </div>

          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Collection Revenue</span>
              <BarChart3 className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="font-serif text-2xl font-semibold text-foreground">
              {formatPKR(collectionMetrics.reduce((acc, m) => acc + m.confirmedRevenue, 0))}
            </p>
          </div>
        </div>

        {/* Collection Performance Table */}
        <div className="bg-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border uppercase tracking-wider text-[0.65rem] text-muted-foreground">
                <tr>
                  <th className="p-4">Rank</th>
                  <th className="p-4">Collection</th>
                  <th className="p-4 text-center">Products</th>
                  <th className="p-4 text-right">Avg. Price</th>
                  <th className="p-4 text-center">Inquiries</th>
                  <th className="p-4 text-right">Revenue</th>
                  <th className="p-4 text-right">Algorithm Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground">Loading collection analytics...</td>
                  </tr>
                ) : sortedMetrics.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground">No collections found.</td>
                  </tr>
                ) : (
                  sortedMetrics.map((m, idx) => (
                    <tr key={m.collection.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 text-[0.65rem] font-bold ${
                          idx < 3 ? "bg-gold/15 text-gold" : "bg-muted text-muted-foreground"
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {m.collection.hero_image && (
                            <div className="h-9 w-12 bg-muted overflow-hidden shrink-0">
                              <img
                                src={m.collection.hero_image}
                                alt={m.collection.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-foreground">{m.collection.title}</span>
                            <span className={`ml-2 text-[0.55rem] px-1.5 py-0.5 uppercase font-bold ${
                              m.collection.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                            }`}>
                              {m.collection.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center font-semibold">{m.productCount}</td>
                      <td className="p-4 text-right font-serif">{formatPKR(m.avgPrice)}</td>
                      <td className="p-4 text-center">{m.inqCount}</td>
                      <td className="p-4 text-right font-serif font-semibold">
                        {m.confirmedRevenue > 0 ? formatPKR(m.confirmedRevenue) : "—"}
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono text-foreground font-semibold">{m.score.toFixed(1)}</span>
                      </td>
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
