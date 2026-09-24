import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Sparkles, Loader2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/campaigns/")({
  head: () => ({
    meta: [{ title: "Campaigns CMS — FABRICO Admin" }],
  }),
  component: AdminCampaignsPage,
});

function AdminCampaignsPage() {
  const queryClient = useQueryClient();
  const [editingCamp, setEditingCamp] = useState<any | null>(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["admin", "campaigns-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (c: any) => {
      if (!c.name || !c.slug) throw new Error("Name and slug are required.");
      if (c.id) {
        const { error } = await supabase
          .from("campaigns")
          .update({
            name: c.name,
            slug: c.slug,
            type: c.type || "seasonal",
            headline: c.headline || null,
            description: c.description || null,
            hero_image: c.hero_image || null,
            banner: c.banner || null,
            cta_label: c.cta_label || null,
            cta_url: c.cta_url || null,
            show_countdown: !!c.show_countdown,
            countdown_message: c.countdown_message || null,
          })
          .eq("id", c.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("campaigns").insert({
          name: c.name,
          slug: c.slug,
          type: c.type || "seasonal",
          headline: c.headline || null,
          description: c.description || null,
          hero_image: c.hero_image || "/images/hero-1.jpg",
          banner: c.banner || "/images/look-2.jpg",
          cta_label: c.cta_label || "Explore Campaign",
          cta_url: c.cta_url || `/campaign/${c.slug}`,
          show_countdown: !!c.show_countdown,
          countdown_message: c.countdown_message || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Campaign saved.");
      setEditingCamp(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns-all"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save campaign.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Campaign deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns-all"] });
    },
  });

  return (
    <AdminLayout title="Campaigns & Seasonal Drops">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif text-2xl text-foreground">Promotional Campaigns</h3>
            <p className="text-xs text-muted-foreground">Manage seasonal drops, limited sales, and countdown timers</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setEditingCamp({
                name: "The Winter Edit",
                slug: "winter-edit",
                type: "seasonal",
                headline: "The Winter & Festive Edit",
                description: "Layered khaddar, karandi and velvet for cooler days.",
                hero_image: "/images/hero-1.jpg",
                banner: "/images/look-2.jpg",
                cta_label: "Shop Winter",
                cta_url: "/collections/winter",
                show_countdown: false,
              })
            }
            className="btn-lux text-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>New Campaign</span>
          </button>
        </div>

        {/* Modal for Create/Edit */}
        {editingCamp && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-serif text-xl text-foreground">
                  {editingCamp.id ? "Edit Campaign" : "New Campaign"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCamp(null)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate(editingCamp);
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Campaign Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCamp.name || ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      setEditingCamp({ ...editingCamp, name, slug });
                    }}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Slug *</label>
                  <input
                    type="text"
                    required
                    value={editingCamp.slug || ""}
                    onChange={(e) => setEditingCamp({ ...editingCamp, slug: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Headline</label>
                  <input
                    type="text"
                    value={editingCamp.headline || ""}
                    onChange={(e) => setEditingCamp({ ...editingCamp, headline: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Description</label>
                  <textarea
                    rows={2}
                    value={editingCamp.description || ""}
                    onChange={(e) =>
                      setEditingCamp({ ...editingCamp, description: e.target.value })
                    }
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Hero Image URL</label>
                    <input
                      type="text"
                      value={editingCamp.hero_image || ""}
                      onChange={(e) =>
                        setEditingCamp({ ...editingCamp, hero_image: e.target.value })
                      }
                      className="w-full bg-muted/40 border border-border p-2 text-[0.65rem] font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Banner Image URL</label>
                    <input
                      type="text"
                      value={editingCamp.banner || ""}
                      onChange={(e) => setEditingCamp({ ...editingCamp, banner: e.target.value })}
                      className="w-full bg-muted/40 border border-border p-2 text-[0.65rem] font-mono"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={!!editingCamp.show_countdown}
                    onChange={(e) =>
                      setEditingCamp({ ...editingCamp, show_countdown: e.target.checked })
                    }
                  />
                  <span>Show Countdown Timer on Campaign Page</span>
                </label>

                <div className="pt-4 border-t border-border flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCamp(null)}
                    className="btn-outline text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="btn-lux text-xs py-2 px-4"
                  >
                    Save Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2 flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="eyebrow text-xs">Loading Campaigns...</span>
            </div>
          ) : (
            campaigns.map((camp) => (
              <div key={camp.id} className="bg-card border border-border overflow-hidden space-y-3">
                <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                  <img
                    src={camp.hero_image || camp.banner || "/images/hero-1.jpg"}
                    alt={camp.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent p-6 flex flex-col justify-end text-ivory">
                    <span className="eyebrow text-[0.6rem] text-gold mb-1">
                      {camp.type?.toUpperCase()} CAMPAIGN
                    </span>
                    <h4 className="font-serif text-2xl leading-tight">{camp.name}</h4>
                    <p className="text-xs text-ivory/80 line-clamp-1 mt-1">{camp.headline}</p>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between border-t border-border text-xs">
                  <span className="font-mono text-muted-foreground">/campaign/{camp.slug}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingCamp(camp)}
                      className="p-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete campaign "${camp.name}"?`)) {
                          deleteMutation.mutate(camp.id);
                        }
                      }}
                      className="p-1.5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
