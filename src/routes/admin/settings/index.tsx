import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, MessageCircle, Save, Loader2, ShieldCheck, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { mergeSettings, saveStoredSetting, safeDbMutation } from "@/lib/studio-persistence";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings/")({
  head: () => ({
    meta: [{ title: "Studio & WhatsApp Settings — FABRICO Admin" }],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["admin", "site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      const map: Record<string, any> = {};
      (data || []).forEach((row) => {
        map[row.key] = row.value;
      });
      return mergeSettings(map);
    },
  });

  const [whatsappNumber, setWhatsappNumber] = useState("923000000000");
  const [whatsappLabel, setWhatsappLabel] = useState("Chat with FABRICO");
  const [seoTitle, setSeoTitle] = useState("FABRICO — Modern Pakistani Fashion");
  const [seoDesc, setSeoDesc] = useState("Contemporary Pakistani women's fashion: ready to wear, unstitched, festive and formal. Order easily on WhatsApp.");
  const [trustItems, setTrustItems] = useState("Secure Ordering, WhatsApp Support, Pakistan-Wide Delivery, Easy Returns");

  useEffect(() => {
    if (settings['whatsapp']) {
      setWhatsappNumber(settings['whatsapp'].number || "923000000000");
      setWhatsappLabel(settings['whatsapp'].label || "Chat with FABRICO");
    }
    if (settings['seo']) {
      setSeoTitle(settings['seo'].site_title || "FABRICO — Modern Pakistani Fashion");
      setSeoDesc(settings['seo'].site_description || "");
    }
    if (settings['trust']?.items) {
      setTrustItems(settings['trust'].items.join(", "));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = [
        {
          key: "whatsapp",
          value: { number: whatsappNumber.trim(), label: whatsappLabel.trim() },
        },
        {
          key: "seo",
          value: { site_title: seoTitle.trim(), site_description: seoDesc.trim() },
        },
        {
          key: "trust",
          value: {
            items: trustItems
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          },
        },
      ];

      for (const u of updates) {
        await safeDbMutation(
          () => supabase.from("site_settings").upsert({ key: u.key, value: u.value }),
          () => saveStoredSetting(u.key, u.value)
        );
      }
    },
    onSuccess: () => {
      toast.success("Studio settings updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["layout"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update settings.");
    },
  });

  return (
    <AdminLayout title="Studio & WhatsApp Configuration">
      <div className="max-w-4xl space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="eyebrow text-xs">Loading Settings...</span>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
            className="space-y-8 text-xs"
          >
            {/* WhatsApp Integration */}
            <div className="bg-card border border-border p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <MessageCircle className="h-5 w-5 text-[#25D366] fill-[#25D366]" />
                <h3 className="font-serif text-2xl text-foreground font-normal">
                  WhatsApp Commerce Configuration
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    WhatsApp Business Number (with country code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="923000000000"
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none font-mono"
                  />
                  <p className="text-[0.68rem] text-muted-foreground">
                    All storefront CTAs, bag checkouts, and styling inquiries connect directly to this number.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Concierge Button Label</label>
                  <input
                    type="text"
                    value={whatsappLabel}
                    onChange={(e) => setWhatsappLabel(e.target.value)}
                    placeholder="Chat with FABRICO"
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Global Trust Badges */}
            <div className="bg-card border border-border p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <h3 className="font-serif text-2xl text-foreground font-normal">
                  Service & Trust Assurances
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Trust Strip Highlights (comma separated)
                </label>
                <input
                  type="text"
                  value={trustItems}
                  onChange={(e) => setTrustItems(e.target.value)}
                  className="w-full bg-muted/40 border border-border p-2.5 outline-none"
                />
                <p className="text-[0.68rem] text-muted-foreground">
                  Displayed below hero and throughout important conversion touchpoints.
                </p>
              </div>
            </div>

            {/* Global SEO */}
            <div className="bg-card border border-border p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Globe className="h-5 w-5 text-gold" />
                <h3 className="font-serif text-2xl text-foreground font-normal">
                  Default Storefront SEO
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Meta Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Meta Description</label>
                  <textarea
                    rows={2}
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="btn-lux flex items-center gap-2"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Save Studio Settings</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
