import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag,
  Search,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/catalog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { mergeOrders, saveStoredOrder, safeDbMutation } from "@/lib/studio-persistence";
import { toast } from "sonner";
import { waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/admin/orders/")({
  head: () => ({
    meta: [{ title: "Orders & Inquiries — FABRICO Admin" }],
  }),
  component: AdminOrdersPage,
});

const STATUS_FILTERS = [
  { label: "All Inquiries", value: "all" },
  { label: "WhatsApp Opened", value: "whatsapp_opened" },
  { label: "Contacted", value: "contacted" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_BADGE: Record<string, string> = {
  whatsapp_opened: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  contacted: "bg-purple-500/10 text-purple-700 border-purple-500/30",
  confirmed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  processing: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  shipped: "bg-indigo-500/10 text-indigo-700 border-indigo-500/30",
  delivered: "bg-teal-500/10 text-teal-700 border-teal-500/30",
  cancelled: "bg-rose-500/10 text-rose-700 border-rose-500/30",
};

function AdminOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "orders-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, items:order_items(*), events:order_events(*)")
        .order("created_at", { ascending: false });

      return mergeOrders(data || []);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const existing = orders.find((o) => o.id === orderId);
      const updated = existing ? { ...existing, status } : { id: orderId, status };

      await safeDbMutation(
        async () => {
          const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
          if (error) throw error;
          await supabase.from("order_events").insert({
            order_id: orderId,
            status,
            note: `Status updated to ${status} by admin`,
          });
          return { error: null };
        },
        () => saveStoredOrder(updated)
      );
    },
    onSuccess: () => {
      toast.success("Order status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not update status.");
    },
  });

  const filteredOrders = orders.filter((o) => {
    const matchStatus = selectedStatus === "all" || o.status === selectedStatus;
    const matchSearch =
      !searchTerm ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.phone && o.phone.includes(searchTerm)) ||
      (o.order_number && String(o.order_number).includes(searchTerm)) ||
      (o.city && o.city.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <AdminLayout title="Orders & WhatsApp Inquiries">
      <div className="space-y-6">
        {/* Controls & Filter Tabs */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by customer name, phone, order number, city..."
                className="w-full bg-card border border-border pl-9 pr-4 py-2 text-xs outline-none focus:border-foreground transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
            {STATUS_FILTERS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  selectedStatus === tab.value
                    ? "bg-foreground text-background font-semibold"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-card border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="eyebrow text-xs">Loading orders and inquiries...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <p className="font-serif text-2xl text-foreground">No orders found</p>
              <p className="text-xs text-muted-foreground">Try adjusting status filters or search term.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground uppercase tracking-wider text-[0.65rem] border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Order #</th>
                    <th className="px-4 py-3">Customer & Location</th>
                    <th className="px-4 py-3">Items Requested</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Source Channel</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredOrders.map((order) => {
                    const items = order.items || [];
                    return (
                      <tr key={order.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <span className="font-mono font-semibold block">
                            #{order.order_number || order.id.slice(0, 8)}
                          </span>
                          <span className="text-[0.65rem] text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("en-PK", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-foreground block">
                            {order.customer_name || "WhatsApp Customer"}
                          </span>
                          <span className="text-[0.68rem] text-muted-foreground">
                            {order.phone || "No phone logged"} {order.city && `· ${order.city}`}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          {items.length > 0 ? (
                            <div className="space-y-0.5">
                              <span className="font-medium text-foreground block truncate">
                                {items[0]?.product_name}
                              </span>
                              <span className="text-[0.68rem] text-muted-foreground">
                                {items[0]?.size && `Size: ${items[0].size} · `}Qty: {items[0]?.qty}
                                {items.length > 1 && ` (+${items.length - 1} more)`}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">No items listed</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold font-sans">
                          {formatPKR(order.total || 0)}
                        </td>
                        <td className="px-4 py-3 uppercase text-[0.65rem] tracking-wider text-muted-foreground">
                          {order.source}
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
                              STATUS_BADGE[order.status] || "bg-muted text-foreground"
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
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="text-xs text-foreground underline underline-offset-4 hover:text-gold"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Drawer / Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <span className="eyebrow text-gold text-[0.62rem]">ORDER DETAILS</span>
                  <h3 className="font-serif text-2xl text-foreground mt-0.5">
                    Order #{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}
                  </h3>
                  <p className="text-[0.68rem] text-muted-foreground">
                    Placed on {new Date(selectedOrder.created_at).toLocaleString("en-PK")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Customer summary */}
              <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 border border-border text-xs">
                <div>
                  <p className="eyebrow text-[0.58rem] text-muted-foreground">Customer</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedOrder.customer_name || "WhatsApp Client"}
                  </p>
                  <p className="text-muted-foreground">{selectedOrder.phone || "No phone"}</p>
                </div>
                <div>
                  <p className="eyebrow text-[0.58rem] text-muted-foreground">Delivery City</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedOrder.city || "Pakistan"}
                  </p>
                  <p className="text-muted-foreground uppercase text-[0.65rem]">
                    Source: {selectedOrder.source}
                  </p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2">
                <h4 className="eyebrow text-foreground font-semibold">Pieces in this Order</h4>
                <div className="divide-y divide-border border border-border text-xs">
                  {(selectedOrder.items || []).map((item: any) => (
                    <div key={item.id} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-foreground">{item.product_name}</p>
                        <p className="text-[0.68rem] text-muted-foreground">
                          SKU: {item.sku} · Size: {item.size || "Standard"} · Color:{" "}
                          {item.color || "Standard"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold font-sans">{formatPKR(item.unit_price * item.qty)}</p>
                        <p className="text-[0.65rem] text-muted-foreground">
                          {item.qty} × {formatPKR(item.unit_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 font-semibold text-sm">
                  <span>Total Amount</span>
                  <span className="font-sans">{formatPKR(selectedOrder.total || 0)}</span>
                </div>
              </div>

              {/* Status Updater */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="eyebrow text-foreground font-semibold block">Change Status</label>
                <div className="flex gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setSelectedOrder({ ...selectedOrder, status: newStatus });
                      updateStatusMutation.mutate({
                        orderId: selectedOrder.id,
                        status: newStatus,
                      });
                    }}
                    className="flex-1 bg-muted/40 border border-border p-2 text-xs outline-none uppercase font-semibold"
                  >
                    <option value="whatsapp_opened">WhatsApp Opened</option>
                    <option value="contacted">Contacted</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Direct WhatsApp button if phone exists */}
              {selectedOrder.phone && (
                <div className="pt-2">
                  <a
                    href={waLink(
                      selectedOrder.phone,
                      `Hello ${selectedOrder.customer_name || ""}, this is FABRICO Concierge regarding your order #${selectedOrder.order_number || selectedOrder.id.slice(0, 8)}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-lux w-full bg-[#25D366] text-white hover:bg-[#1EBE5D] border-none text-xs flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4 fill-white" />
                    <span>Contact Customer on WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
