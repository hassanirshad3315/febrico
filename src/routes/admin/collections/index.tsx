import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Layers, Loader2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { mergeCollections, saveStoredCollection, safeDbMutation } from "@/lib/studio-persistence";
import { toast } from "sonner";
import type { Collection } from "@/lib/catalog";

export const Route = createFileRoute("/admin/collections/")({
  head: () => ({
    meta: [{ title: "Collections CMS — FABRICO Admin" }],
  }),
  component: AdminCollectionsPage,
});

function AdminCollectionsPage() {
  const queryClient = useQueryClient();
  const [editingCollection, setEditingCollection] = useState<Partial<Collection> | null>(null);

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["admin", "collections-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("collections")
        .select("*")
        .order("sort_order");
      return mergeCollections((data as unknown as Collection[]) || []);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (col: Partial<Collection>) => {
      if (!col.name || !col.slug) throw new Error("Name and slug are required.");
      const payload = {
        id: col.id || crypto.randomUUID(),
        name: col.name,
        slug: col.slug,
        description: col.description || null,
        banner: col.banner || null,
        thumbnail: col.thumbnail || null,
        featured: !!col.featured,
        sort_order: col.id ? undefined : collections.length + 1,
      };

      if (col.id) {
        await safeDbMutation(
          () =>
            supabase
              .from("collections")
              .update({
                name: col.name,
                slug: col.slug,
                description: col.description || null,
                banner: col.banner || null,
                thumbnail: col.thumbnail || null,
                featured: !!col.featured,
              })
              .eq("id", col.id),
          () => saveStoredCollection(payload)
        );
      } else {
        await safeDbMutation(
          () =>
            supabase.from("collections").insert({
              id: payload.id,
              name: col.name,
              slug: col.slug,
              description: col.description || null,
              banner: col.banner || null,
              thumbnail: col.thumbnail || null,
              featured: !!col.featured,
              sort_order: collections.length + 1,
            }),
          () => saveStoredCollection(payload)
        );
      }
    },
    onSuccess: () => {
      toast.success("Collection saved successfully.");
      setEditingCollection(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "collections-all"] });
      queryClient.invalidateQueries({ queryKey: ["layout"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save collection.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await safeDbMutation(
        () => supabase.from("collections").delete().eq("id", id),
        () => {
          // handled by query invalidation
        }
      );
    },
    onSuccess: () => {
      toast.success("Collection deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin", "collections-all"] });
      queryClient.invalidateQueries({ queryKey: ["layout"] });
    },
  });

  return (
    <AdminLayout title="Collections Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif text-2xl text-foreground">Studio Collections</h3>
            <p className="text-xs text-muted-foreground">Manage seasonal drops, signature edits, and collection banners</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setEditingCollection({
                name: "",
                slug: "",
                description: "",
                banner: "/images/hero-1.jpg",
                thumbnail: "/images/look-1.jpg",
                featured: false,
              })
            }
            className="btn-lux text-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>New Collection</span>
          </button>
        </div>

        {/* Modal/Drawer for Create / Edit */}
        {editingCollection && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-serif text-xl text-foreground">
                  {editingCollection.id ? "Edit Collection" : "New Collection"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCollection(null)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate(editingCollection);
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Collection Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCollection.name || ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      setEditingCollection({ ...editingCollection, name, slug });
                    }}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Slug *</label>
                  <input
                    type="text"
                    required
                    value={editingCollection.slug || ""}
                    onChange={(e) =>
                      setEditingCollection({ ...editingCollection, slug: e.target.value })
                    }
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Editorial Description</label>
                  <textarea
                    rows={2}
                    value={editingCollection.description || ""}
                    onChange={(e) =>
                      setEditingCollection({ ...editingCollection, description: e.target.value })
                    }
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Banner Image URL</label>
                    <input
                      type="text"
                      value={editingCollection.banner || ""}
                      onChange={(e) =>
                        setEditingCollection({ ...editingCollection, banner: e.target.value })
                      }
                      className="w-full bg-muted/40 border border-border p-2 outline-none font-mono text-[0.65rem]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Thumbnail Image URL</label>
                    <input
                      type="text"
                      value={editingCollection.thumbnail || ""}
                      onChange={(e) =>
                        setEditingCollection({ ...editingCollection, thumbnail: e.target.value })
                      }
                      className="w-full bg-muted/40 border border-border p-2 outline-none font-mono text-[0.65rem]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={!!editingCollection.featured}
                    onChange={(e) =>
                      setEditingCollection({ ...editingCollection, featured: e.target.checked })
                    }
                  />
                  <span>Feature in Mega Menu & Storefront</span>
                </label>

                <div className="pt-4 border-t border-border flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCollection(null)}
                    className="btn-outline text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="btn-lux text-xs py-2 px-4"
                  >
                    Save Collection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Collections Table */}
        <div className="bg-card border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="eyebrow text-xs">Loading Collections...</span>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-muted text-muted-foreground uppercase tracking-wider text-[0.65rem] border-b border-border">
                <tr>
                  <th className="px-4 py-3">Collection</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={col.thumbnail || col.banner || "/images/look-1.jpg"}
                          alt={col.name}
                          className="h-10 w-8 object-cover bg-muted border border-border"
                        />
                        <span className="font-semibold text-foreground">{col.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[0.7rem]">{col.slug}</td>
                    <td className="px-4 py-3 max-w-xs text-muted-foreground truncate">
                      {col.description || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {col.featured ? (
                        <span className="text-[0.6rem] bg-gold/10 text-gold px-1.5 py-0.5 border border-gold/20 font-medium">
                          FEATURED
                        </span>
                      ) : (
                        <span className="text-[0.6rem] text-muted-foreground">Standard</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCollection(col)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                          aria-label="Edit collection"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete collection "${col.name}"?`)) {
                              deleteMutation.mutate(col.id);
                            }
                          }}
                          className="p-1 text-muted-foreground hover:text-destructive"
                          aria-label="Delete collection"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
