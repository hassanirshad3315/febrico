import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, BookOpen, Loader2, Save, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/lookbook/")({
  head: () => ({
    meta: [{ title: "Lookbook CMS — FABRICO Admin" }],
  }),
  component: AdminLookbookPage,
});

function AdminLookbookPage() {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const { data: lookbooks = [], isLoading } = useQuery({
    queryKey: ["admin", "lookbooks-cms"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lookbooks")
        .select("*, items:lookbook_items(*)")
        .order("sort_order");
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: any) => {
      if (!item.image) throw new Error("Image URL is required.");
      if (item.id) {
        const { error } = await supabase
          .from("lookbook_items")
          .update({
            image: item.image,
            caption: item.caption || null,
          })
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const defaultLookbookId = lookbooks[0]?.id;
        if (!defaultLookbookId) throw new Error("No lookbook found. Please create a lookbook first.");
        const { error } = await supabase.from("lookbook_items").insert({
          lookbook_id: defaultLookbookId,
          image: item.image,
          caption: item.caption || null,
          sort_order: 10,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Lookbook item saved.");
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "lookbooks-cms"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save item.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lookbook_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lookbook piece deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin", "lookbooks-cms"] });
    },
  });

  const allItems = lookbooks.flatMap((lb) => lb.items || []);

  return (
    <AdminLayout title="Lookbook & Styling CMS">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif text-2xl text-foreground">Lookbook Ensembles</h3>
            <p className="text-xs text-muted-foreground">Manage styled editorial photography and interactive lookbook stories</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setEditingItem({
                image: "/images/look-1.jpg",
                caption: "Ivory raw silk, hand-finished.",
              })
            }
            className="btn-lux text-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Look</span>
          </button>
        </div>

        {/* Modal for Edit */}
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-serif text-xl text-foreground">
                  {editingItem.id ? "Edit Look" : "Add Look"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate(editingItem);
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Look Image URL *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.image || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Editorial Caption</label>
                  <input
                    type="text"
                    value={editingItem.caption || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none"
                    placeholder="e.g. Velvet after dark."
                  />
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="btn-outline text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="btn-lux text-xs py-2 px-4"
                  >
                    Save Look
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lookbook Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="eyebrow text-xs">Loading Lookbook...</span>
            </div>
          ) : (
            allItems.map((item, idx) => (
              <div key={item.id} className="bg-card border border-border p-3 space-y-3">
                <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                  <img src={item.image} alt={item.caption || ""} className="h-full w-full object-cover" />
                  <span className="eyebrow absolute top-2 left-2 bg-background/90 text-foreground px-1.5 py-0.5 text-[0.55rem]">
                    LOOK 0{idx + 1}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-foreground truncate">{item.caption || "Look Image"}</p>
                  <div className="flex justify-end gap-2 pt-1 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Delete this look?")) deleteMutation.mutate(item.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
