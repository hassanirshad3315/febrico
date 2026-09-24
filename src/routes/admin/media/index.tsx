import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Images,
  Search,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Filter,
  Eye,
  Trash2,
  Sparkles,
  BookOpen,
  Package,
  Layers,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/media/")({
  head: () => ({
    meta: [{ title: "Media Library & Brand Assets — FABRICO Admin" }],
  }),
  component: AdminMediaPage,
});

interface MediaAsset {
  id: string;
  url: string;
  title: string;
  source: "product" | "lookbook" | "campaign" | "hero";
  usageDetails?: string;
}

function AdminMediaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "product" | "lookbook" | "campaign" | "hero">("all");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageTitle, setNewImageTitle] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Fetch all media assets across models
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["admin", "media-assets"],
    queryFn: async () => {
      const list: MediaAsset[] = [];

      // 1. Product Images
      const { data: products } = await supabase.from("products").select("id, name, images");
      (products || []).forEach((p) => {
        (p.images || []).forEach((img: string, idx: number) => {
          if (img) {
            list.push({
              id: `prod-${p.id}-${idx}`,
              url: img,
              title: `${p.name} (Image ${idx + 1})`,
              source: "product",
              usageDetails: `Product: ${p.name}`,
            });
          }
        });
      });

      // 2. Hero slides
      const { data: slides } = await supabase.from("hero_slides").select("id, title, image");
      (slides || []).forEach((s) => {
        if (s.image) {
          list.push({
            id: `hero-${s.id}`,
            url: s.image,
            title: s.title || "Hero Banner",
            source: "hero",
            usageDetails: "Homepage Carousel",
          });
        }
      });

      // 3. Lookbook items
      const { data: lookbooks } = await supabase.from("lookbooks").select(`
        id, title,
        lookbook_items (id, image, caption)
      `);
      (lookbooks || []).forEach((lb) => {
        (lb.lookbook_items || []).forEach((item: any) => {
          if (item.image) {
            list.push({
              id: `look-${item.id}`,
              url: item.image,
              title: item.caption || lb.title || "Lookbook Item",
              source: "lookbook",
              usageDetails: `Lookbook: ${lb.title}`,
            });
          }
        });
      });

      // 4. Campaigns
      const { data: campaigns } = await supabase.from("campaigns").select("id, title, hero_image");
      (campaigns || []).forEach((c) => {
        if (c.hero_image) {
          list.push({
            id: `camp-${c.id}`,
            url: c.hero_image,
            title: c.title,
            source: "campaign",
            usageDetails: `Campaign: ${c.title}`,
          });
        }
      });

      return list;
    },
  });

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.usageDetails && a.usageDetails.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (sourceFilter !== "all" && a.source !== sourceFilter) return false;
      return true;
    });
  }, [assets, searchQuery, sourceFilter]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("Image URL copied to clipboard");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <AdminLayout title="Media Asset Library">
      <div className="space-y-8">
        {/* Header summary & actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h3 className="font-serif text-2xl text-foreground">Digital Brand Media</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Access and reference all photography across luxury editorial lookbooks, product studio shoots, and campaigns.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs uppercase tracking-widest font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Reference New Media</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center bg-muted/50 p-1 border border-border">
            <button
              type="button"
              onClick={() => setSourceFilter("all")}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                sourceFilter === "all" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Assets ({assets.length})
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("product")}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                sourceFilter === "product" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Products
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("lookbook")}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                sourceFilter === "lookbook" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Lookbook Shoots
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("hero")}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                sourceFilter === "hero" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Hero Banners
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("campaign")}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                sourceFilter === "campaign" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Campaigns
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-card border border-border focus:border-foreground outline-none"
            />
          </div>
        </div>

        {/* Media Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">Loading brand media...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground bg-card border border-border">
            No media assets found matching the filter.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredAssets.map((asset) => {
              const isCopied = copiedUrl === asset.url;

              return (
                <div
                  key={asset.id}
                  className="group bg-card border border-border overflow-hidden flex flex-col hover:border-foreground/40 transition-all shadow-xs"
                >
                  {/* Image container */}
                  <div className="relative aspect-3/4 bg-muted overflow-hidden">
                    <img
                      src={asset.url}
                      alt={asset.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Source badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[0.55rem] uppercase font-bold tracking-wider backdrop-blur-xs ${
                          asset.source === "product"
                            ? "bg-black/70 text-white"
                            : asset.source === "lookbook"
                            ? "bg-gold/80 text-black"
                            : asset.source === "campaign"
                            ? "bg-indigo-900/80 text-white"
                            : "bg-emerald-900/80 text-white"
                        }`}
                      >
                        {asset.source}
                      </span>
                    </div>

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => setPreviewAsset(asset)}
                        className="p-2 bg-card text-foreground hover:bg-foreground hover:text-background transition-colors"
                        title="View Full Resolution"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(asset.url)}
                        className="p-2 bg-card text-foreground hover:bg-foreground hover:text-background transition-colors"
                        title="Copy Image URL"
                      >
                        {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Asset details */}
                  <div className="p-2.5 space-y-1 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground line-clamp-1">{asset.title}</p>
                      {asset.usageDetails && (
                        <p className="text-[0.65rem] text-muted-foreground line-clamp-1">{asset.usageDetails}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-[0.65rem]">
                      <span className="font-mono text-muted-foreground truncate max-w-[100px]">
                        {asset.url.split("/").pop()?.split("?")[0]}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(asset.url)}
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                      >
                        <Copy className="h-2.5 w-2.5" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lightbox / Preview Modal */}
        {previewAsset && (
          <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border max-w-2xl w-full p-6 space-y-4 shadow-2xl relative animate-fade-in">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="font-serif text-lg text-foreground truncate pr-4">{previewAsset.title}</h4>
                <button
                  type="button"
                  onClick={() => setPreviewAsset(null)}
                  className="p-1 text-muted-foreground hover:text-foreground text-xs"
                >
                  Close
                </button>
              </div>

              <div className="aspect-4/3 max-h-[60vh] bg-black/5 flex items-center justify-center overflow-hidden border border-border">
                <img
                  src={previewAsset.url}
                  alt={previewAsset.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="text-xs text-muted-foreground font-mono truncate flex-1">
                  {previewAsset.url}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(previewAsset.url)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs uppercase tracking-wider font-medium"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy URL</span>
                  </button>
                  <a
                    href={previewAsset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 border border-border text-muted-foreground hover:text-foreground"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reference New Media Modal */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
              <div className="border-b border-border pb-3">
                <h4 className="font-serif text-xl font-medium text-foreground">Add Media Asset Reference</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Save a high-resolution Unsplash/CDN image URL to your brand media library.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Image Title / Description</label>
                  <input
                    type="text"
                    value={newImageTitle}
                    onChange={(e) => setNewImageTitle(e.target.value)}
                    placeholder="e.g. Silk Velvet Emerald Kurta Shot"
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Image URL</label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground font-mono"
                  />
                </div>

                {newImageUrl && (
                  <div className="aspect-16/9 bg-muted overflow-hidden border border-border">
                    <img
                      src={newImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => toast.error("Invalid image URL")}
                    />
                  </div>
                )}
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
                  onClick={() => {
                    if (!newImageUrl.trim()) {
                      toast.error("Please provide an image URL.");
                      return;
                    }
                    handleCopy(newImageUrl.trim());
                    toast.success("Media reference copied and ready for use.");
                    setIsAddOpen(false);
                    setNewImageUrl("");
                    setNewImageTitle("");
                  }}
                  className="px-4 py-2 bg-foreground text-background text-xs uppercase tracking-wider font-semibold"
                >
                  Copy & Ready
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
