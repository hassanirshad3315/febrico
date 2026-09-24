import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Sliders, Loader2, Save, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { mergeHeroSlides, saveStoredHeroSlide, deleteStoredHeroSlide, safeDbMutation } from "@/lib/studio-persistence";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/hero/")({
  head: () => ({
    meta: [{ title: "Hero Slides CMS — FABRICO Admin" }],
  }),
  component: AdminHeroPage,
});

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_url: string | null;
  cta2_label: string | null;
  cta2_url: string | null;
  image: string;
  align: string;
  overlay: number;
  focal: string;
  sort_order: number;
  status: string;
};

function AdminHeroPage() {
  const queryClient = useQueryClient();
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["admin", "hero-slides-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("hero_slides")
        .select("*")
        .order("sort_order");
      return mergeHeroSlides((data as unknown as HeroSlide[]) || []);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (s: Partial<HeroSlide>) => {
      if (!s.title || !s.image) throw new Error("Title and image URL are required.");
      const payload = {
        id: s.id || crypto.randomUUID(),
        title: s.title,
        subtitle: s.subtitle || null,
        cta_label: s.cta_label || "Shop Now",
        cta_url: s.cta_url || "/new-in",
        cta2_label: s.cta2_label || "Explore Story",
        cta2_url: s.cta2_url || "/collections",
        image: s.image,
        overlay: s.overlay ?? 30,
        align: s.align || "left",
        focal: s.focal || "center",
        sort_order: s.id ? undefined : slides.length + 1,
        status: s.status || "published",
      };

      if (s.id) {
        await safeDbMutation(
          () =>
            supabase
              .from("hero_slides")
              .update({
                title: s.title,
                subtitle: s.subtitle || null,
                cta_label: s.cta_label || null,
                cta_url: s.cta_url || null,
                cta2_label: s.cta2_label || null,
                cta2_url: s.cta2_url || null,
                image: s.image,
                overlay: s.overlay ?? 30,
                align: s.align || "left",
                focal: s.focal || "center",
              })
              .eq("id", s.id),
          () => saveStoredHeroSlide(payload)
        );
      } else {
        await safeDbMutation(
          () =>
            supabase.from("hero_slides").insert({
              id: payload.id,
              title: s.title,
              subtitle: s.subtitle || null,
              cta_label: s.cta_label || "Shop Now",
              cta_url: s.cta_url || "/new-in",
              cta2_label: s.cta2_label || "Explore Story",
              cta2_url: s.cta2_url || "/collections",
              image: s.image,
              overlay: s.overlay ?? 30,
              align: s.align || "left",
              focal: s.focal || "center",
              sort_order: slides.length + 1,
            }),
          () => saveStoredHeroSlide(payload)
        );
      }
    },
    onSuccess: () => {
      toast.success("Hero slide saved.");
      setEditingSlide(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "hero-slides-all"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not save hero slide.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await safeDbMutation(
        () => supabase.from("hero_slides").delete().eq("id", id),
        () => deleteStoredHeroSlide(id)
      );
    },
    onSuccess: () => {
      toast.success("Slide deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin", "hero-slides-all"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
    },
  });

  return (
    <AdminLayout title="Hero Slider CMS">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif text-2xl text-foreground">Cinematic Hero Slides</h3>
            <p className="text-xs text-muted-foreground">Manage full-screen fashion hero imagery, headlines, and calls to action</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setEditingSlide({
                title: "The Art of Modern Elegance",
                subtitle: "Discover the latest FABRICO collection.",
                cta_label: "Shop New Arrivals",
                cta_url: "/new-in",
                cta2_label: "Explore Story",
                cta2_url: "/collections",
                image: "/images/hero-1.jpg",
                overlay: 30,
                align: "left",
                focal: "center",
              })
            }
            className="btn-lux text-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>New Slide</span>
          </button>
        </div>

        {/* Modal for Create/Edit */}
        {editingSlide && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-serif text-xl text-foreground">
                  {editingSlide.id ? "Edit Slide" : "New Slide"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate(editingSlide);
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Headline *</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.title || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Subheadline</label>
                  <input
                    type="text"
                    value={editingSlide.subtitle || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Image URL *</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.image || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Primary CTA Label</label>
                    <input
                      type="text"
                      value={editingSlide.cta_label || ""}
                      onChange={(e) => setEditingSlide({ ...editingSlide, cta_label: e.target.value })}
                      className="w-full bg-muted/40 border border-border p-2"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Primary CTA URL</label>
                    <input
                      type="text"
                      value={editingSlide.cta_url || ""}
                      onChange={(e) => setEditingSlide({ ...editingSlide, cta_url: e.target.value })}
                      className="w-full bg-muted/40 border border-border p-2 font-mono text-[0.65rem]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Overlay Darkness (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      value={editingSlide.overlay ?? 30}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, overlay: Number(e.target.value) })
                      }
                      className="w-full bg-muted/40 border border-border p-2"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Text Alignment</label>
                    <select
                      value={editingSlide.align || "left"}
                      onChange={(e) => setEditingSlide({ ...editingSlide, align: e.target.value })}
                      className="w-full bg-muted/40 border border-border p-2"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSlide(null)}
                    className="btn-outline text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="btn-lux text-xs py-2 px-4"
                  >
                    Save Slide
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Slides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2 flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="eyebrow text-xs">Loading Slides...</span>
            </div>
          ) : (
            slides.map((s, i) => (
              <div key={s.id} className="bg-card border border-border overflow-hidden space-y-3">
                <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                  <img src={s.image} alt={s.title} className="h-full w-full object-cover" />
                  <div
                    className="absolute inset-0 bg-ink"
                    style={{ opacity: (s.overlay || 30) / 100 }}
                  />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-ivory">
                    <p className="eyebrow text-[0.6rem] text-gold mb-1">SLIDE 0{i + 1}</p>
                    <h4 className="font-serif text-2xl leading-tight">{s.title}</h4>
                    <p className="text-xs text-ivory/80 line-clamp-1 mt-1">{s.subtitle}</p>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between border-t border-border text-xs">
                  <div>
                    <span className="font-medium text-foreground">CTA: {s.cta_label}</span>
                    <span className="text-muted-foreground text-[0.7rem] block">→ {s.cta_url}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSlide(s)}
                      className="p-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete slide "${s.title}"?`)) {
                          deleteMutation.mutate(s.id);
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
