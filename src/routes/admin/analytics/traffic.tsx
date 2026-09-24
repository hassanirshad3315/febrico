import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  Eye,
  ShoppingBag,
  Smartphone,
  Monitor,
  Compass,
  Clock,
  TrendingUp,
  BarChart3,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AnalyticsSubNav } from "@/components/admin/AnalyticsSubNav";

export const Route = createFileRoute("/admin/analytics/traffic")({
  head: () => ({
    meta: [{ title: "Traffic & Engagement Analytics — FABRICO Admin" }],
  }),
  component: AdminAnalyticsTrafficPage,
});

function AdminAnalyticsTrafficPage() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin", "analytics-events-traffic"],
    queryFn: async () => {
      const { data } = await supabase
        .from("analytics_events")
        .select("event_type, created_at, metadata")
        .order("created_at", { ascending: false })
        .limit(2000);
      return data || [];
    },
  });

  // Summary metrics derived from event data
  const metrics = useMemo(() => {
    const pageViews = events.filter((e) => e.event_type === "page_view").length;
    const productViews = events.filter((e) => e.event_type === "product_view").length;
    const wishlistAdds = events.filter((e) => e.event_type === "wishlist_add").length;
    const bagAdds = events.filter((e) => e.event_type === "bag_add").length;
    const whatsappClicks = events.filter((e) => e.event_type === "whatsapp_click").length;
    const whatsappInquiries = events.filter((e) => e.event_type === "whatsapp_inquiry").length;
    const searchEvents = events.filter((e) => e.event_type === "search").length;
    const totalSessions = pageViews; // approximation

    return {
      pageViews,
      productViews,
      wishlistAdds,
      bagAdds,
      whatsappClicks,
      whatsappInquiries,
      searchEvents,
      totalSessions,
      engagementRate: totalSessions > 0 ? ((productViews / totalSessions) * 100) : 0,
      conversionFunnel: {
        viewToWishlist: productViews > 0 ? ((wishlistAdds / productViews) * 100) : 0,
        viewToBag: productViews > 0 ? ((bagAdds / productViews) * 100) : 0,
        viewToWhatsApp: productViews > 0 ? (((whatsappClicks + whatsappInquiries) / productViews) * 100) : 0,
      },
    };
  }, [events]);

  // Daily breakdown (last 7 days)
  const dailyBreakdown = useMemo(() => {
    const days: Record<string, Record<string, number>> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      days[key] = { page_view: 0, product_view: 0, wishlist_add: 0, bag_add: 0, whatsapp_click: 0 };
    }

    for (const ev of events) {
      const key = ev.created_at?.split("T")[0];
      if (key && days[key] && ev.event_type in days[key]) {
        days[key][ev.event_type]++;
      }
    }

    return Object.entries(days).map(([date, counts]) => ({ date, ...counts }));
  }, [events]);

  // Top pages from page_view metadata
  const topPages = useMemo(() => {
    const counts: Record<string, number> = {};
    events
      .filter((e) => e.event_type === "page_view")
      .forEach((e) => {
        const path = (e.metadata as any)?.path || "/";
        counts[path] = (counts[path] || 0) + 1;
      });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [events]);

  return (
    <AdminLayout title="Traffic & Engagement Intelligence">
      <div className="space-y-8">
        <AnalyticsSubNav />

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Page Views</span>
              <Eye className="h-4 w-4" />
            </div>
            <p className="font-serif text-3xl font-semibold text-foreground">{metrics.pageViews}</p>
          </div>

          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Product Detail Views</span>
              <Compass className="h-4 w-4 text-gold" />
            </div>
            <p className="font-serif text-3xl font-semibold text-foreground">{metrics.productViews}</p>
          </div>

          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Browse → Engagement</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="font-serif text-3xl font-semibold text-foreground">{metrics.engagementRate.toFixed(1)}%</p>
          </div>

          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Tracked Events</span>
              <BarChart3 className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="font-serif text-3xl font-semibold text-foreground">{events.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Conversion Funnel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border border-border p-6 space-y-5">
              <h4 className="font-serif text-lg text-foreground">Conversion Funnel</h4>
              <p className="text-xs text-muted-foreground -mt-3">
                From product detail view to customer intent signal
              </p>

              <div className="space-y-4">
                {/* Funnel Steps */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium">Product Views</span>
                    <span className="font-mono font-semibold">{metrics.productViews}</span>
                  </div>
                  <div className="h-3 bg-muted overflow-hidden">
                    <div className="h-full bg-foreground" style={{ width: "100%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium">→ Wishlist Saves</span>
                    <span className="font-mono">{metrics.wishlistAdds} ({metrics.conversionFunnel.viewToWishlist.toFixed(1)}%)</span>
                  </div>
                  <div className="h-3 bg-muted overflow-hidden">
                    <div className="h-full bg-destructive/60" style={{ width: `${Math.min(100, metrics.conversionFunnel.viewToWishlist * 3)}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium">→ Added to Bag</span>
                    <span className="font-mono">{metrics.bagAdds} ({metrics.conversionFunnel.viewToBag.toFixed(1)}%)</span>
                  </div>
                  <div className="h-3 bg-muted overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, metrics.conversionFunnel.viewToBag * 3)}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium">→ WhatsApp Intent</span>
                    <span className="font-mono">{metrics.whatsappClicks + metrics.whatsappInquiries} ({metrics.conversionFunnel.viewToWhatsApp.toFixed(1)}%)</span>
                  </div>
                  <div className="h-3 bg-muted overflow-hidden">
                    <div className="h-full bg-[#25D366]" style={{ width: `${Math.min(100, metrics.conversionFunnel.viewToWhatsApp * 3)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-card border border-border p-6 space-y-4">
              <h4 className="font-serif text-lg text-foreground">Top Viewed Pages</h4>
              <div className="divide-y divide-border">
                {topPages.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-3">No page view data yet.</p>
                ) : (
                  topPages.map(([path, count], idx) => (
                    <div key={path} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[0.65rem] font-mono text-muted-foreground w-5">{idx + 1}.</span>
                        <span className="font-mono text-foreground">{path}</span>
                      </div>
                      <span className="font-semibold text-foreground">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Daily Breakdown */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-lg text-foreground">7-Day Traffic Breakdown</h4>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border uppercase tracking-wider text-[0.6rem] text-muted-foreground">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-center">Page Views</th>
                      <th className="p-3 text-center">Product Views</th>
                      <th className="p-3 text-center">Wishlist</th>
                      <th className="p-3 text-center">Bag Adds</th>
                      <th className="p-3 text-center">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {dailyBreakdown.map((day: any) => (
                      <tr key={day.date} className="hover:bg-muted/20">
                        <td className="p-3 font-mono text-muted-foreground">
                          {new Date(day.date + "T00:00").toLocaleDateString("en-PK", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-3 text-center font-semibold">{day['page_view']}</td>
                        <td className="p-3 text-center">{day['product_view']}</td>
                        <td className="p-3 text-center">{day['wishlist_add']}</td>
                        <td className="p-3 text-center">{day['bag_add']}</td>
                        <td className="p-3 text-center">{day['whatsapp_click']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
