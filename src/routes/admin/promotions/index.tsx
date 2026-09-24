import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Megaphone, Loader2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { mergeAnnouncements, saveStoredAnnouncement, safeDbMutation } from "@/lib/studio-persistence";
import { toast } from "sonner";
import type { Announcement } from "@/components/store/AnnouncementBar";

export const Route = createFileRoute("/admin/promotions/")({
  head: () => ({
    meta: [{ title: "Announcements & Promotions — FABRICO Admin" }],
  }),
  component: AdminPromotionsPage,
});

function AdminPromotionsPage() {
  const queryClient = useQueryClient();
  const [editingAnn, setEditingAnn] = useState<Partial<Announcement> | null>(null);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["admin", "announcements-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .order("priority", { ascending: false });
      return mergeAnnouncements((data as unknown as Announcement[]) || []);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (ann: Partial<Announcement>) => {
      if (!ann.text) throw new Error("Announcement text is required.");
      const payload = {
        id: ann.id || crypto.randomUUID(),
        text: ann.text,
        mobile_text: ann.mobile_text || null,
        link: ann.link || "/shop",
        priority: ann.priority || 1,
        active: ann.active ?? true,
      };

      if (ann.id) {
        await safeDbMutation(
          () =>
            supabase
              .from("announcements")
              .update({
                text: ann.text,
                mobile_text: ann.mobile_text || null,
                link: ann.link || null,
                priority: ann.priority || 0,
                active: ann.active ?? true,
              })
              .eq("id", ann.id),
          () => saveStoredAnnouncement(payload)
        );
      } else {
        await safeDbMutation(
          () =>
            supabase.from("announcements").insert({
              id: payload.id,
              text: ann.text,
              mobile_text: ann.mobile_text || null,
              link: ann.link || "/shop",
              priority: ann.priority || 1,
              active: true,
            }),
          () => saveStoredAnnouncement(payload)
        );
      }
    },
    onSuccess: () => {
      toast.success("Announcement saved.");
      setEditingAnn(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements-all"] });
      queryClient.invalidateQueries({ queryKey: ["layout"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save announcement.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await safeDbMutation(
        () => supabase.from("announcements").delete().eq("id", id),
        () => {}
      );
    },
    onSuccess: () => {
      toast.success("Announcement deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements-all"] });
      queryClient.invalidateQueries({ queryKey: ["layout"] });
    },
  });

  return (
    <AdminLayout title="Global Announcement Bar CMS">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif text-2xl text-foreground">Top Announcement Tickers</h3>
            <p className="text-xs text-muted-foreground">Manage promo notices, shipping alerts, and seasonal countdown messages</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setEditingAnn({
                text: "UP TO 50% OFF SELECTED STYLES — SHOP NOW",
                mobile_text: "SALE NOW ON — SHOP NOW",
                link: "/shop",
                priority: 1,
                active: true,
              })
            }
            className="btn-lux text-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>New Announcement</span>
          </button>
        </div>

        {/* Modal for Create/Edit */}
        {editingAnn && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-serif text-xl text-foreground">
                  {editingAnn.id ? "Edit Announcement" : "New Announcement"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingAnn(null)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate(editingAnn);
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Desktop Notice Text *</label>
                  <input
                    type="text"
                    required
                    value={editingAnn.text || ""}
                    onChange={(e) => setEditingAnn({ ...editingAnn, text: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none font-sans"
                    placeholder="e.g. COMPLIMENTARY NATIONWIDE DELIVERY ON ORDERS OVER PKR 5,000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Mobile Short Text</label>
                  <input
                    type="text"
                    value={editingAnn.mobile_text || ""}
                    onChange={(e) => setEditingAnn({ ...editingAnn, mobile_text: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none font-sans"
                    placeholder="FREE DELIVERY ABOVE PKR 5,000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Destination Link</label>
                    <input
                      type="text"
                      value={editingAnn.link || ""}
                      onChange={(e) => setEditingAnn({ ...editingAnn, link: e.target.value })}
                      className="w-full bg-muted/40 border border-border p-2 font-mono text-[0.65rem]"
                      placeholder="/shop"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Priority Order</label>
                    <input
                      type="number"
                      value={editingAnn.priority ?? 1}
                      onChange={(e) =>
                        setEditingAnn({ ...editingAnn, priority: Number(e.target.value) })
                      }
                      className="w-full bg-muted/40 border border-border p-2"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAnn(null)}
                    className="btn-outline text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="btn-lux text-xs py-2 px-4"
                  >
                    Save Notice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-card border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="eyebrow text-xs">Loading Announcements...</span>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-muted text-muted-foreground uppercase tracking-wider text-[0.65rem] border-b border-border">
                <tr>
                  <th className="px-4 py-3">Announcement Text</th>
                  <th className="px-4 py-3">Mobile Text</th>
                  <th className="px-4 py-3">Link</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {announcements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold text-foreground max-w-md truncate">
                      {ann.text}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ann.mobile_text || "Same as desktop"}
                    </td>
                    <td className="px-4 py-3 font-mono text-[0.7rem]">{ann.link || "—"}</td>
                    <td className="px-4 py-3 font-mono">{ann.priority || 0}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingAnn(ann)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Delete this announcement?")) {
                              deleteMutation.mutate(ann.id);
                            }
                          }}
                          className="p-1 text-muted-foreground hover:text-destructive"
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
