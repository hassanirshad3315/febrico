import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  Clock,
  ArrowUpRight,
  Plus,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR, PRODUCT_FIELDS, type Product } from "@/lib/catalog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — FABRICO Studio Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboardPage,
});

const STATUS_COLORS: Record<string, string> = {
  whatsapp_opened: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  contacted: "bg-purple-500/10 text-purple-700 border-purple-500/30",
  confirmed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  processing: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  shipped: "bg-indigo-500/10 text-indigo-700 border-indigo-500/30",
  delivered: "bg-teal-500/10 text-teal-700 border-teal-500/30",
  cancelled: "bg-rose-500/10 text-rose-700 border-rose-500/30",
};

function AdminDashboardPage() {
  const queryClient = useQueryClient();

  // Fetch metrics data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: async () => {
      const [ordersRes, productsRes, topProdsRes] = await Promise.all([
        supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false }).limit(20),
        supabase.from("products").select("id, stock_status, status", { count: "exact" }),
        supabase.from("products").select(PRODUCT_FIELDS).limit(5),
      ]);

      const orders = ordersRes.data || [];
      const totalInquiries = orders.length;
      const confirmedOrders = orders.filter((o) =>
        ["confirmed", "processing", "shipped", "delivered"].includes(o.status)
      );
      const totalRevenue = confirmedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const conversionRate = totalInquiries > 0 ? Math.round((confirmedOrders.length / totalInquiries) * 100) : 0;

      return {
        orders,
        totalInquiries,
        confirmedOrdersCount: confirmedOrders.length,
        totalRevenue,
        conversionRate,
        totalProducts: productsRes.count || 0,
        topProducts: (topProdsRes.data as unknown as Product[]) || [],
      };
    },
  });

  // Status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);
      if (error) throw error;

      await supabase.from("order_events").insert({
        order_id: orderId,
        status,
        note: `Status updated to ${status} via Admin Dashboard`,
      });
    },
    onSuccess: () => {
      toast.success("Order status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update order status.");
    },
  });

  return (
    <AdminLayout title="Operations Overview">
      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="eyebrow text-xs">Loading studio intelligence...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-5 space-y-3">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="eyebrow text-[0.62rem]">Confirmed Orders</span>
                <ShoppingBag className="h-4 w-4 text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-3xl text-foreground">
                  {dashboardData?.confirmedOrdersCount || 0}
                </h3>
                <p className="text-[0.65rem] text-muted-foreground mt-1">
                  From {dashboardData?.totalInquiries || 0} WhatsApp inquiries
                </p>
              </div>
            </div>

            <div className="bg-card border border-border p-5 space-y-3">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="eyebrow text-[0.62rem]">Estimated Revenue</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-serif text-3xl text-foreground font-normal">
                  {formatPKR(dashboardData?.totalRevenue || 0)}
                </h3>
                <p className="text-[0.65rem] text-emerald-700 mt-1">
                  Confirmed sales pipeline
                </p>
              </div>
            </div>

            <div className="bg-card border border-border p-5 space-y-3">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="eyebrow text-[0.62rem]">Conversion Rate</span>
                <CheckCircle2 className="h-4 w-4 text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-3xl text-foreground font-normal">
                  {dashboardData?.conversionRate || 0}%
                </h3>
                <p className="text-[0.65rem] text-muted-foreground mt-1">
                  Inquiries → Verified Orders
                </p>
              </div>
            </div>

            <div className="bg-card border border-border p-5 space-y-3">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="eyebrow text-[0.62rem]">Live Catalog</span>
                <Package className="h-4 w-4 text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-3xl text-foreground font-normal">
                  {dashboardData?.totalProducts || 0}
                </h3>
                <p className="text-[0.65rem] text-muted-foreground mt-1">
                  Active studio silhouettes
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-card border border-border p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <h4 className="font-semibold text-foreground">Studio Quick Actions</h4>
              <p className="text-muted-foreground text-[0.7rem]">Directly manage inventory, lookbooks, and site announcements</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/admin/products/new" className="btn-lux text-xs px-3 py-2 h-9 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span>New Product</span>
              </Link>
              <Link to="/admin/collections" className="btn-outline text-xs px-3 py-2 h-9 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                <span>Collections</span>
              </Link>
              <Link to="/admin/hero" className="btn-outline text-xs px-3 py-2 h-9 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Hero CMS</span>
              </Link>
            </div>
          </div>

          {/* Recent Inquiries and Orders Pipeline */}
          <div className="bg-card border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl text-foreground">Recent Inquiries & Orders</h3>
                <p className="text-xs text-muted-foreground">Real-time inquiries captured from WhatsApp storefront interactions</p>
              </div>
              <Link to="/admin/orders" className="text-xs text-foreground font-medium underline underline-offset-4 hover:text-gold">
                View All Orders →
              </Link>
            </div>

            <div className="overflow-x-auto border border-border/80">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground uppercase tracking-wider text-[0.65rem] border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Order / ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {dashboardData?.orders.slice(0, 8).map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono font-medium">
                        #{order.order_number || order.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-foreground block">
                          {order.customer_name || "WhatsApp Client"}
                        </span>
                        <span className="text-[0.68rem] text-muted-foreground">
                          {order.phone || "Direct Chat"} · {order.city || "Pakistan"}
                        </span>
                      </td>
                      <td className="px-4 py-3 uppercase text-[0.65rem] tracking-wider text-muted-foreground">
                        {order.source}
                      </td>
                      <td className="px-4 py-3 font-semibold font-sans">
                        {formatPKR(order.total || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatusMutation.mutate({
                              orderId: order.id,
                              status: e.target.value,
                            })
                          }
                          className={`px-2 py-1 border text-[0.65rem] uppercase font-semibold outline-none cursor-pointer ${
                            STATUS_COLORS[order.status] || "bg-muted text-foreground border-border"
                          }`}
                        >
                          <option value="whatsapp_opened">WhatsApp Opened</option>
                          <option value="contacted">Contacted</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to="/admin/orders"
                          className="text-xs text-muted-foreground hover:text-foreground underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
