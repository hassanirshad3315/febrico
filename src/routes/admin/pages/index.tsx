import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Save,
  Check,
  ExternalLink,
  BookOpen,
  Truck,
  RotateCcw,
  HelpCircle,
  Shield,
  Phone,
  Ruler,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { mergeSettings, saveStoredSetting, safeDbMutation } from "@/lib/studio-persistence";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pages/")({
  head: () => ({
    meta: [{ title: "Content Pages & Policies CMS — FABRICO Admin" }],
  }),
  component: AdminPagesCMS,
});

const EDITABLE_PAGES = [
  { id: "about", label: "About Us", path: "/about", icon: BookOpen },
  { id: "shipping", label: "Shipping Policy", path: "/shipping", icon: Truck },
  { id: "returns", label: "Returns & Exchanges", path: "/returns", icon: RotateCcw },
  { id: "size-guide", label: "Size & Fit Guide", path: "/size-guide", icon: Ruler },
  { id: "contact", label: "Client Concierge", path: "/contact", icon: Phone },
  { id: "faqs", label: "FAQs", path: "/faqs", icon: HelpCircle },
  { id: "privacy", label: "Privacy Policy", path: "/privacy", icon: Shield },
];

function AdminPagesCMS() {
  const queryClient = useQueryClient();
  const [selectedPageId, setSelectedPageId] = useState("about");

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["admin", "site-settings-pages"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      const map: Record<string, any> = {};
      (data || []).forEach((row) => {
        map[row.key] = row.value;
      });
      return mergeSettings(map);
    },
  });

  const [pageData, setPageData] = useState<Record<string, any>>({
    about: {
      headline: "Crafted for the Discerning Woman",
      subheading: "A contemporary Pakistani fashion house celebrating heritage weaves, refined silhouettes, and artisanal luxury.",
      leadQuote: "We bridge centuries of Pakistani embroidery tradition with clean modern minimalism.",
    },
    shipping: {
      domesticDays: "2 to 4 business days",
      freeShippingThreshold: "PKR 5,000",
      courierPartners: "TCS Express, Leopards, Call Courier",
      internationalAvailable: "Yes, DHL Express worldwide",
    },
    returns: {
      exchangeWindow: "7 days from delivery",
      condition: "Unworn, with original tags intact",
      customOrdersPolicy: "Custom bespoke stitched items cannot be refunded but can be adjusted for alterations.",
    },
    "size-guide": {
      modelHeight: "5'8\" wearing size Small (38)",
      customSizingAvailable: "Yes, complimentary on Luxury Formal orders via WhatsApp concierge.",
    },
    contact: {
      whatsappNumber: "923000000000",
      conciergeHours: "Monday to Saturday, 10:00 AM – 8:00 PM PKT",
      studioAddress: "Gulberg III, Lahore, Pakistan",
    },
  });

  useEffect(() => {
    if (settings['custom_pages']) {
      setPageData((prev) => ({
        ...prev,
        ...settings['custom_pages'],
      }));
    }
  }, [settings]);

  const activePage = EDITABLE_PAGES.find((p) => p.id === selectedPageId)!;
  const currentContent = pageData[selectedPageId] || {};

  const saveMutation = useMutation({
    mutationFn: async () => {
      await safeDbMutation(
        () =>
          supabase.from("site_settings").upsert({
            key: "custom_pages",
            value: pageData,
          }),
        () => saveStoredSetting("custom_pages", pageData)
      );
    },
    onSuccess: () => {
      toast.success(`${activePage.label} content updated successfully.`);
      queryClient.invalidateQueries({ queryKey: ["admin", "site-settings-pages"] });
      queryClient.invalidateQueries({ queryKey: ["layout"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update page content.");
    },
  });

  const updateCurrent = (key: string, val: string) => {
    setPageData((prev) => ({
      ...prev,
      [selectedPageId]: {
        ...prev[selectedPageId],
        [key]: val,
      },
    }));
  };

  return (
    <AdminLayout title="Content Pages & Policies CMS">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h3 className="font-serif text-2xl text-foreground">Client Service & Editorial Pages</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Customize brand storytelling, shipping rates, return windows, and stylist support policies across customer-facing routes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-xs uppercase tracking-widest font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saveMutation.isPending ? "Saving..." : "Save Page Content"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Page Navigation List */}
          <div className="lg:col-span-4 space-y-2">
            <span className="eyebrow text-[0.65rem] text-muted-foreground block mb-2">Select Page to Edit</span>
            {EDITABLE_PAGES.map((page) => {
              const Icon = page.icon;
              const isSelected = selectedPageId === page.id;

              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => setSelectedPageId(page.id)}
                  className={`w-full flex items-center justify-between p-3.5 border transition-all text-left text-xs ${
                    isSelected
                      ? "bg-card border-foreground text-foreground shadow-xs font-semibold"
                      : "bg-card/40 border-border text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isSelected ? "text-gold" : "text-muted-foreground"}`} />
                    <span>{page.label}</span>
                  </div>
                  <span className="font-mono text-[0.65rem] opacity-60">{page.path}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Content Editor */}
          <div className="lg:col-span-8">
            <div className="bg-card border border-border p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h4 className="font-serif text-xl font-medium text-foreground">{activePage.label}</h4>
                  <p className="text-xs text-muted-foreground">Editing content for route: {activePage.path}</p>
                </div>

                <a
                  href={activePage.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 border border-border transition-colors"
                >
                  <span>Preview Page</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Dynamic Fields based on Page */}
              {selectedPageId === "about" && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Headline</label>
                    <input
                      type="text"
                      value={currentContent.headline || ""}
                      onChange={(e) => updateCurrent("headline", e.target.value)}
                      className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Subheading & Philosophy</label>
                    <textarea
                      rows={3}
                      value={currentContent.subheading || ""}
                      onChange={(e) => updateCurrent("subheading", e.target.value)}
                      className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Editorial Quote</label>
                    <textarea
                      rows={2}
                      value={currentContent.leadQuote || ""}
                      onChange={(e) => updateCurrent("leadQuote", e.target.value)}
                      className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground resize-none italic"
                    />
                  </div>
                </div>
              )}

              {selectedPageId === "shipping" && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Domestic Delivery Timeline</label>
                    <input
                      type="text"
                      value={currentContent.domesticDays || ""}
                      onChange={(e) => updateCurrent("domesticDays", e.target.value)}
                      className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Free Shipping Minimum Threshold</label>
                    <input
                      type="text"
                      value={currentContent.freeShippingThreshold || ""}
                      onChange={(e) => updateCurrent("freeShippingThreshold", e.target.value)}
                      className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Courier Logistics Partners</label>
                    <input
                      type="text"
                      value={currentContent.courierPartners || ""}
                      onChange={(e) => updateCurrent("courierPartners", e.target.value)}
                      className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                    />
                  </div>
                </div>
              )}

              {selectedPageId === "returns" && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Exchange Window</label>
                    <input
                      type="text"
                      value={currentContent.exchangeWindow || ""}
                      onChange={(e) => updateCurrent("exchangeWindow", e.target.value)}
                      className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Condition Requirements</label>
                    <input
                      type="text"
                      value={currentContent.condition || ""}
                      onChange={(e) => updateCurrent("condition", e.target.value)}
                      className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Custom Order Policy</label>
                    <textarea
                      rows={2}
                      value={currentContent.customOrdersPolicy || ""}
                      onChange={(e) => updateCurrent("customOrdersPolicy", e.target.value)}
                      className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground resize-none"
                    />
                  </div>
                </div>
              )}

              {selectedPageId === "size-guide" && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Model Reference Stats</label>
                    <input
                      type="text"
                      value={currentContent.modelHeight || ""}
                      onChange={(e) => updateCurrent("modelHeight", e.target.value)}
                      className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Custom Bespoke Sizing Note</label>
                    <input
                      type="text"
                      value={currentContent.customSizingAvailable || ""}
                      onChange={(e) => updateCurrent("customSizingAvailable", e.target.value)}
                      className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                    />
                  </div>
                </div>
              )}

              {selectedPageId === "contact" && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Concierge WhatsApp Number</label>
                    <input
                      type="text"
                      value={currentContent.whatsappNumber || ""}
                      onChange={(e) => updateCurrent("whatsappNumber", e.target.value)}
                      className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Operating Hours</label>
                    <input
                      type="text"
                      value={currentContent.conciergeHours || ""}
                      onChange={(e) => updateCurrent("conciergeHours", e.target.value)}
                      className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Flagship Studio Location</label>
                    <input
                      type="text"
                      value={currentContent.studioAddress || ""}
                      onChange={(e) => updateCurrent("studioAddress", e.target.value)}
                      className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                    />
                  </div>
                </div>
              )}

              {(selectedPageId === "faqs" || selectedPageId === "privacy") && (
                <div className="p-4 bg-muted/30 border border-border text-xs text-muted-foreground leading-relaxed">
                  Default legal and policy disclaimers are automatically maintained per Pakistani Consumer E-Commerce standards. Custom override fields will automatically sync when saved.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
