import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  ShoppingBag,
  ExternalLink,
  Crown,
  Sparkles,
  Calendar,
  DollarSign,
  UserCheck,
  ChevronRight,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { formatPKR } from "@/lib/catalog";

export const Route = createFileRoute("/admin/customers/")({
  head: () => ({
    meta: [{ title: "Customer CRM & Profiles — FABRICO Admin" }],
  }),
  component: AdminCustomersPage,
});

interface CustomerProfile {
  phone: string;
  name: string;
  city: string;
  totalInquiries: number;
  confirmedOrders: number;
  lifetimeValue: number;
  lastActive: string;
  inquiries: any[];
}

function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "vip" | "repeat" | "leads">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  const { data: rawInquiries = [], isLoading } = useQuery({
    queryKey: ["admin", "customer-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            price_pkr,
            size,
            color,
            image
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const customers: CustomerProfile[] = useMemo(() => {
    const map = new Map<string, CustomerProfile>();

    for (const inq of rawInquiries) {
      const phone = inq.customer_phone?.trim() || "Unknown Phone";
      const name = inq.customer_name?.trim() || "Valued Client";
      const city = inq.customer_city?.trim() || "Pakistan";
      const isConfirmed = inq.status === "confirmed" || inq.status === "shipped" || inq.status === "delivered";
      const val = Number(inq.total_pkr || 0);

      if (!map.has(phone)) {
        map.set(phone, {
          phone,
          name,
          city,
          totalInquiries: 0,
          confirmedOrders: 0,
          lifetimeValue: 0,
          lastActive: inq.created_at,
          inquiries: [],
        });
      }

      const prof = map.get(phone)!;
      prof.totalInquiries += 1;
      if (isConfirmed) {
        prof.confirmedOrders += 1;
        prof.lifetimeValue += val;
      }
      prof.inquiries.push(inq);
      if (name !== "Valued Client" && prof.name === "Valued Client") {
        prof.name = name;
      }
      if (city !== "Pakistan" && prof.city === "Pakistan") {
        prof.city = city;
      }
    }

    return Array.from(map.values());
  }, [rawInquiries]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterTab === "vip") return c.lifetimeValue >= 30000 || c.confirmedOrders >= 2;
      if (filterTab === "repeat") return c.totalInquiries >= 2;
      if (filterTab === "leads") return c.confirmedOrders === 0;
      return true;
    });
  }, [customers, searchQuery, filterTab]);

  const totalLTV = useMemo(() => {
    return customers.reduce((acc, c) => acc + c.lifetimeValue, 0);
  }, [customers]);

  return (
    <AdminLayout title="Customer Relations & VIP Directory">
      <div className="space-y-8">
        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Total Clients</span>
              <Users className="h-4 w-4" />
            </div>
            <p className="font-serif text-3xl font-semibold text-foreground">{customers.length}</p>
          </div>

          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">VIP Spenders</span>
              <Crown className="h-4 w-4 text-gold" />
            </div>
            <p className="font-serif text-3xl font-semibold text-foreground">
              {customers.filter((c) => c.lifetimeValue >= 30000).length}
            </p>
          </div>

          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Active Leads</span>
              <Sparkles className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="font-serif text-3xl font-semibold text-foreground">
              {customers.filter((c) => c.confirmedOrders === 0).length}
            </p>
          </div>

          <div className="bg-card border border-border p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[0.6rem]">Client Lifetime Value</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="font-serif text-2xl font-semibold text-foreground">{formatPKR(totalLTV)}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center bg-muted/50 p-1 border border-border self-start">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                filterTab === "all" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("vip")}
              className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                filterTab === "vip" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              VIP Clients
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("repeat")}
              className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                filterTab === "repeat" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Repeat Inquiries
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("leads")}
              className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                filterTab === "leads" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              New Leads
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-card border border-border focus:border-foreground outline-none"
            />
          </div>
        </div>

        {/* Customer Directory Table */}
        <div className="bg-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border uppercase tracking-wider text-[0.65rem] text-muted-foreground">
                <tr>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">City / Region</th>
                  <th className="p-4 text-center">Inquiries</th>
                  <th className="p-4 text-center">Orders</th>
                  <th className="p-4 text-right">Lifetime Value</th>
                  <th className="p-4">Last Activity</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground">
                      Loading customer registry...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground">
                      No matching customer profiles found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    const isVIP = c.lifetimeValue >= 30000;
                    const cleanPhone = c.phone.replace(/[^0-9]/g, "");

                    return (
                      <tr key={c.phone} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center font-serif text-sm font-semibold shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-foreground">{c.name}</span>
                                {isVIP && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[0.55rem] uppercase font-bold tracking-widest bg-gold/15 text-gold border border-gold/30">
                                    VIP
                                  </span>
                                )}
                              </div>
                              <span className="text-muted-foreground font-mono text-[0.65rem]">{c.phone}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-muted-foreground">{c.city}</td>

                        <td className="p-4 text-center font-semibold">{c.totalInquiries}</td>

                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-[0.65rem] font-bold ${
                              c.confirmedOrders > 0
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {c.confirmedOrders}
                          </span>
                        </td>

                        <td className="p-4 text-right font-serif font-semibold text-foreground">
                          {c.lifetimeValue > 0 ? formatPKR(c.lifetimeValue) : "—"}
                        </td>

                        <td className="p-4 text-muted-foreground text-[0.7rem]">
                          {new Date(c.lastActive).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                              `Assalam-o-Alaikum ${c.name}, FABRICO Client Concierge is at your service.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors text-[0.7rem] font-medium"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 border border-border hover:bg-muted text-[0.7rem] font-medium transition-colors"
                          >
                            <span>History</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer History Slideout Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-lg bg-card border-l border-border h-full flex flex-col p-6 space-y-6 overflow-y-auto shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-serif text-xl font-medium text-foreground">{selectedCustomer.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{selectedCustomer.phone} • {selectedCustomer.city}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Customer summary */}
              <div className="grid grid-cols-3 gap-2 text-center bg-muted/30 p-4 border border-border">
                <div>
                  <span className="eyebrow text-[0.6rem] text-muted-foreground">Inquiries</span>
                  <p className="font-serif text-lg font-semibold">{selectedCustomer.totalInquiries}</p>
                </div>
                <div>
                  <span className="eyebrow text-[0.6rem] text-muted-foreground">Orders</span>
                  <p className="font-serif text-lg font-semibold text-emerald-600">{selectedCustomer.confirmedOrders}</p>
                </div>
                <div>
                  <span className="eyebrow text-[0.6rem] text-muted-foreground">Lifetime Spend</span>
                  <p className="font-serif text-sm font-semibold">{formatPKR(selectedCustomer.lifetimeValue)}</p>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-4 flex-1">
                <h4 className="eyebrow text-xs text-muted-foreground">Inquiry & Order History</h4>

                <div className="space-y-3">
                  {selectedCustomer.inquiries.map((inq: any) => (
                    <div key={inq.id} className="border border-border p-3.5 space-y-2 bg-background">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-muted-foreground">#{inq.id.slice(0, 8)}</span>
                        <span
                          className={`px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                            inq.status === "confirmed"
                              ? "bg-emerald-500/15 text-emerald-600"
                              : inq.status === "pending"
                              ? "bg-gold/15 text-gold"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      {inq.order_items && inq.order_items.length > 0 && (
                        <div className="space-y-1.5 pt-1 border-t border-border/50">
                          {inq.order_items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between text-xs">
                              <span className="text-foreground line-clamp-1">
                                {item.product_name} ({item.size})
                              </span>
                              <span className="font-mono text-muted-foreground shrink-0 ml-2">
                                {item.quantity} × {formatPKR(item.price_pkr)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground pt-1 border-t border-border/50">
                        <span>{new Date(inq.created_at).toLocaleString("en-PK")}</span>
                        <span className="font-serif font-semibold text-foreground">{formatPKR(inq.total_pkr || 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer WhatsApp Button */}
              <div className="pt-4 border-t border-border">
                <a
                  href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Assalam-o-Alaikum ${selectedCustomer.name}, thank you for your patronage with FABRICO.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-medium text-xs uppercase tracking-widest hover:brightness-105 transition-all shadow-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Start WhatsApp Concierge Chat</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
