import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Navigation,
  Plus,
  Save,
  Trash2,
  GripVertical,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Link2,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { mergeSettings, saveStoredSetting, safeDbMutation } from "@/lib/studio-persistence";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/navigation/")({
  head: () => ({
    meta: [{ title: "Navigation & Menu Structure — FABRICO Admin" }],
  }),
  component: AdminNavigationPage,
});

interface NavLink {
  id: string;
  label: string;
  path: string;
  visible: boolean;
  children: NavLink[];
}

const DEFAULT_NAV: NavLink[] = [
  {
    id: "shop",
    label: "Shop",
    path: "/shop",
    visible: true,
    children: [
      { id: "shop-pret", label: "Ready to Wear Pret", path: "/category/pret", visible: true, children: [] },
      { id: "shop-unstitched", label: "Unstitched", path: "/category/unstitched", visible: true, children: [] },
      { id: "shop-festive", label: "Festive Edit", path: "/category/festive", visible: true, children: [] },
      { id: "shop-formals", label: "Luxury Formals", path: "/category/luxury-formals", visible: true, children: [] },
    ],
  },
  {
    id: "new-in",
    label: "New In",
    path: "/new-in",
    visible: true,
    children: [],
  },
  {
    id: "collections",
    label: "Collections",
    path: "/collections",
    visible: true,
    children: [],
  },
  {
    id: "lookbook",
    label: "Lookbook",
    path: "/lookbook",
    visible: true,
    children: [],
  },
  {
    id: "about",
    label: "Our Story",
    path: "/about",
    visible: true,
    children: [],
  },
];

const FOOTER_SECTIONS = [
  {
    id: "customer-care",
    label: "Customer Care",
    links: [
      { label: "Shipping & Delivery", path: "/shipping" },
      { label: "Returns & Exchanges", path: "/returns" },
      { label: "Size & Fit Guide", path: "/size-guide" },
      { label: "FAQs", path: "/faqs" },
    ],
  },
  {
    id: "company",
    label: "Company",
    links: [
      { label: "About FABRICO", path: "/about" },
      { label: "Contact & Concierge", path: "/contact" },
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms & Conditions", path: "/terms" },
    ],
  },
];

function AdminNavigationPage() {
  const queryClient = useQueryClient();

  const { data: settings = {} } = useQuery({
    queryKey: ["admin", "site-settings-nav"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      const map: Record<string, any> = {};
      (data || []).forEach((row) => {
        map[row.key] = row.value;
      });
      return mergeSettings(map);
    },
  });

  const [navLinks, setNavLinks] = useState<NavLink[]>(DEFAULT_NAV);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["shop"]));
  const [editingLink, setEditingLink] = useState<NavLink | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newPath, setNewPath] = useState("/");

  useEffect(() => {
    if (settings['navigation']?.mainNav) {
      setNavLinks(settings['navigation'].mainNav);
    }
  }, [settings]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleVisibility = (id: string) => {
    setNavLinks((prev) =>
      prev.map((link) =>
        link.id === id
          ? { ...link, visible: !link.visible }
          : {
              ...link,
              children: link.children.map((child) =>
                child.id === id ? { ...child, visible: !child.visible } : child
              ),
            }
      )
    );
  };

  const removeLink = (id: string) => {
    setNavLinks((prev) =>
      prev
        .filter((link) => link.id !== id)
        .map((link) => ({
          ...link,
          children: link.children.filter((child) => child.id !== id),
        }))
    );
  };

  const addTopLevel = () => {
    if (!newLabel.trim()) {
      toast.error("Label is required.");
      return;
    }
    const id = newLabel.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    setNavLinks((prev) => [
      ...prev,
      { id, label: newLabel.trim(), path: newPath.trim() || "/", visible: true, children: [] },
    ]);
    setNewLabel("");
    setNewPath("/");
    setIsAddOpen(false);
    toast.success("Navigation link added.");
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        mainNav: navLinks,
        footer: FOOTER_SECTIONS,
      };

      await safeDbMutation(
        () =>
          supabase.from("site_settings").upsert({
            key: "navigation",
            value: payload,
          }),
        () => saveStoredSetting("navigation", payload)
      );
    },
    onSuccess: () => {
      toast.success("Navigation structure saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "site-settings-nav"] });
      queryClient.invalidateQueries({ queryKey: ["layout"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save navigation.");
    },
  });

  return (
    <AdminLayout title="Navigation & Menu Architecture">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h3 className="font-serif text-2xl text-foreground">Storefront Navigation Structure</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Configure the main header mega menu and footer link architecture for customer-facing navigation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 border border-border text-xs uppercase tracking-widest font-medium hover:bg-muted transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Link</span>
            </button>

            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 px-5 py-2 bg-foreground text-background text-xs uppercase tracking-widest font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saveMutation.isPending ? "Saving..." : "Save Navigation"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Main Nav Tree */}
          <div className="lg:col-span-7 space-y-4">
            <span className="eyebrow text-[0.65rem] text-muted-foreground block">Header Mega Menu Links</span>

            <div className="bg-card border border-border divide-y divide-border">
              {navLinks.map((link) => {
                const hasChildren = link.children.length > 0;
                const isExpanded = expandedIds.has(link.id);

                return (
                  <div key={link.id}>
                    {/* Top-Level Item */}
                    <div
                      className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${
                        link.visible ? "" : "opacity-40"
                      }`}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 cursor-grab" />

                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(link.id)}
                          className="p-0.5 text-muted-foreground hover:text-foreground"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>
                      ) : (
                        <div className="w-4" />
                      )}

                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground">{link.label}</span>
                        <span className="text-[0.65rem] text-muted-foreground font-mono ml-2">{link.path}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleVisibility(link.id)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                          title={link.visible ? "Hide" : "Show"}
                        >
                          {link.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeLink(link.id)}
                          className="p-1 text-muted-foreground hover:text-destructive"
                          title="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    {hasChildren && isExpanded && (
                      <div className="bg-muted/20 border-t border-border divide-y divide-border/50">
                        {link.children.map((child) => (
                          <div
                            key={child.id}
                            className={`flex items-center gap-3 px-4 py-2.5 pl-14 transition-colors ${
                              child.visible ? "" : "opacity-40"
                            }`}
                          >
                            <Link2 className="h-3 w-3 text-muted-foreground/60 shrink-0" />

                            <div className="flex-1 min-w-0">
                              <span className="text-xs text-foreground">{child.label}</span>
                              <span className="text-[0.6rem] text-muted-foreground font-mono ml-2">
                                {child.path}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleVisibility(child.id)}
                                className="p-1 text-muted-foreground hover:text-foreground"
                              >
                                {child.visible ? (
                                  <Eye className="h-3 w-3" />
                                ) : (
                                  <EyeOff className="h-3 w-3" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => removeLink(child.id)}
                                className="p-1 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {navLinks.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No navigation links defined. Add your first link above.
                </div>
              )}
            </div>
          </div>

          {/* Right: Footer Link Preview */}
          <div className="lg:col-span-5 space-y-4">
            <span className="eyebrow text-[0.65rem] text-muted-foreground block">Footer Link Columns (preview)</span>

            <div className="bg-card border border-border p-5 space-y-5">
              {FOOTER_SECTIONS.map((section) => (
                <div key={section.id} className="space-y-2">
                  <h5 className="eyebrow text-[0.6rem] text-gold">{section.label}</h5>
                  <div className="space-y-1">
                    {section.links.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Link2 className="h-2.5 w-2.5" />
                        <span>{link.label}</span>
                        <span className="font-mono text-[0.6rem] opacity-50">{link.path}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-border">
                <p className="text-[0.65rem] text-muted-foreground">
                  Footer columns are auto-generated from client service pages. Edit content in the Pages CMS.
                </p>
              </div>
            </div>

            {/* Live Visual Preview */}
            <div className="bg-card border border-border p-5 space-y-3">
              <span className="eyebrow text-[0.65rem] text-muted-foreground">Header Preview</span>

              <div className="bg-foreground text-background p-3 flex items-center justify-center gap-6 text-xs uppercase tracking-[0.15em]">
                {navLinks
                  .filter((l) => l.visible)
                  .map((link) => (
                    <span key={link.id} className="cursor-default hover:opacity-70 transition-opacity">
                      {link.label}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add Link Modal */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border max-w-sm w-full p-6 space-y-4 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="font-serif text-lg font-medium text-foreground">Add Navigation Link</h4>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Menu Label</label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g. Sale"
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Link Path</label>
                  <input
                    type="text"
                    value={newPath}
                    onChange={(e) => setNewPath(e.target.value)}
                    placeholder="/shop?sale=true"
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-border text-xs uppercase tracking-wider font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addTopLevel}
                  className="px-4 py-2 bg-foreground text-background text-xs uppercase tracking-wider font-semibold"
                >
                  Add Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
