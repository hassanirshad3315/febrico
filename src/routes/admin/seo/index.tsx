import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Globe,
  Search,
  Share2,
  FileCode,
  Save,
  Check,
  ExternalLink,
  Smartphone,
  Monitor,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { mergeSettings, saveStoredSetting, safeDbMutation } from "@/lib/studio-persistence";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/seo/")({
  head: () => ({
    meta: [{ title: "Search Engine Optimization & Social Graph — FABRICO Admin" }],
  }),
  component: AdminSeoPage,
});

function AdminSeoPage() {
  const queryClient = useQueryClient();

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["admin", "site-settings-seo"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      const map: Record<string, any> = {};
      (data || []).forEach((row) => {
        map[row.key] = row.value;
      });
      return mergeSettings(map);
    },
  });

  const [siteTitle, setSiteTitle] = useState("FABRICO — Modern Pakistani Fashion");
  const [siteDesc, setSiteDesc] = useState(
    "Discover contemporary luxury Pakistani women's fashion: ready-to-wear pret, festive formal edits, unstitched silk ensembles. Seamless WhatsApp shopping & bespoke sizing."
  );
  const [canonicalUrl, setCanonicalUrl] = useState("https://fabrico.pk");
  const [ogImageUrl, setOgImageUrl] = useState(
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&auto=format&fit=crop&q=80"
  );
  const [keywords, setKeywords] = useState(
    "Pakistani fashion, luxury pret, unstitched suits, festive formals, Pakistani designer wear, silk kurta, WhatsApp shopping Pakistan"
  );
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"serp" | "social" | "sitemap">("serp");

  useEffect(() => {
    if (settings['seo']) {
      const seo = settings['seo'];
      if (seo.site_title) setSiteTitle(seo.site_title);
      if (seo.site_description) setSiteDesc(seo.site_description);
      if (seo.canonical_url) setCanonicalUrl(seo.canonical_url);
      if (seo.og_image) setOgImageUrl(seo.og_image);
      if (seo.keywords) setKeywords(seo.keywords);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        site_title: siteTitle.trim(),
        site_description: siteDesc.trim(),
        canonical_url: canonicalUrl.trim(),
        og_image: ogImageUrl.trim(),
        keywords: keywords.trim(),
      };

      await safeDbMutation(
        () =>
          supabase.from("site_settings").upsert({
            key: "seo",
            value: payload,
          }),
        () => saveStoredSetting("seo", payload)
      );
    },
    onSuccess: () => {
      toast.success("SEO and Social Graph metadata saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "site-settings-seo"] });
      queryClient.invalidateQueries({ queryKey: ["layout"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save SEO configuration.");
    },
  });

  return (
    <AdminLayout title="SEO & Social Graph Management">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h3 className="font-serif text-2xl text-foreground">Search Visibility & Social Previews</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Configure search engine indexing, rich snippets, OpenGraph share banners, and sitemaps for maximum organic discovery.
            </p>
          </div>

          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-xs uppercase tracking-widest font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saveMutation.isPending ? "Saving..." : "Save SEO Settings"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Configuration Form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-card border border-border p-6 space-y-5">
              <h4 className="font-serif text-lg text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-gold" />
                <span>Global Meta Directives</span>
              </h4>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-foreground">Site Title</label>
                    <span className="text-[0.65rem] text-muted-foreground">{siteTitle.length} / 60 chars</span>
                  </div>
                  <input
                    type="text"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-foreground">Meta Description</label>
                    <span className="text-[0.65rem] text-muted-foreground">{siteDesc.length} / 160 chars</span>
                  </div>
                  <textarea
                    rows={3}
                    value={siteDesc}
                    onChange={(e) => setSiteDesc(e.target.value)}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Canonical Domain URL</label>
                  <input
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Default Social Share Image (OpenGraph)</label>
                  <input
                    type="url"
                    value={ogImageUrl}
                    onChange={(e) => setOgImageUrl(e.target.value)}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground font-mono text-[0.7rem]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Keywords (comma separated)</label>
                  <textarea
                    rows={2}
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground resize-none text-[0.7rem]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Visual Previews */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-card border border-border p-6 space-y-6">
              {/* Preview Mode Selector */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center bg-muted/50 p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => setActiveTab("serp")}
                    className={`px-3 py-1 text-xs uppercase tracking-wider font-medium transition-colors ${
                      activeTab === "serp" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    Google Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("social")}
                    className={`px-3 py-1 text-xs uppercase tracking-wider font-medium transition-colors ${
                      activeTab === "social" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    WhatsApp / Social
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("sitemap")}
                    className={`px-3 py-1 text-xs uppercase tracking-wider font-medium transition-colors ${
                      activeTab === "sitemap" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    Sitemap XML
                  </button>
                </div>

                {activeTab === "serp" && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`p-1.5 ${previewDevice === "desktop" ? "text-foreground bg-muted" : "hover:text-foreground"}`}
                      title="Desktop Search Preview"
                    >
                      <Monitor className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`p-1.5 ${previewDevice === "mobile" ? "text-foreground bg-muted" : "hover:text-foreground"}`}
                      title="Mobile Search Preview"
                    >
                      <Smartphone className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tab 1: Google SERP Preview */}
              {activeTab === "serp" && (
                <div className="space-y-4">
                  <span className="eyebrow text-[0.6rem] text-muted-foreground block">
                    Live Google Search Snippet ({previewDevice})
                  </span>

                  <div
                    className={`p-4 bg-white text-slate-900 border border-slate-200 rounded-md font-sans ${
                      previewDevice === "mobile" ? "max-w-xs mx-auto text-xs shadow-md" : "text-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[0.65rem] font-serif font-bold">
                        F
                      </div>
                      <div className="text-[0.7rem] text-slate-700 leading-tight">
                        <span className="font-semibold block text-slate-900">FABRICO</span>
                        <span className="text-slate-500 font-mono text-[0.65rem]">{canonicalUrl}</span>
                      </div>
                    </div>

                    <h4 className="text-[#1a0dab] hover:underline cursor-pointer font-medium text-base line-clamp-1 leading-snug">
                      {siteTitle}
                    </h4>

                    <p className="text-[#4d5156] text-xs mt-1 line-clamp-2 leading-relaxed">
                      {siteDesc}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-4 text-[0.7rem] text-[#1a0dab]">
                      <span className="hover:underline">Shop Luxury Pret</span>
                      <span className="hover:underline">Festive Formals</span>
                      <span className="hover:underline">WhatsApp Concierge</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: WhatsApp / Social Share Preview */}
              {activeTab === "social" && (
                <div className="space-y-4">
                  <span className="eyebrow text-[0.6rem] text-muted-foreground block">
                    WhatsApp & Social Card Preview
                  </span>

                  <div className="max-w-sm mx-auto bg-[#075E54]/5 p-4 rounded-xl border border-[#128C7E]/20">
                    <div className="bg-[#EFEAE2] p-3 rounded-lg shadow-sm border border-neutral-300 space-y-2">
                      <div className="bg-white rounded-lg overflow-hidden border border-neutral-200 shadow-xs">
                        <div className="aspect-16/9 bg-neutral-100 overflow-hidden">
                          <img
                            src={ogImageUrl}
                            alt="OpenGraph Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 bg-neutral-50 space-y-1">
                          <span className="text-[0.6rem] uppercase tracking-wider text-neutral-500 block font-mono">
                            {canonicalUrl.replace("https://", "")}
                          </span>
                          <h5 className="font-serif text-sm font-semibold text-neutral-900 line-clamp-1">
                            {siteTitle}
                          </h5>
                          <p className="text-[0.7rem] text-neutral-600 line-clamp-2 leading-tight">
                            {siteDesc}
                          </p>
                        </div>
                      </div>

                      <div className="text-[0.75rem] text-neutral-800 font-sans">
                        Check out the latest Pakistani luxury Pret & Formals at FABRICO: {canonicalUrl}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Dynamic XML Sitemap */}
              {activeTab === "sitemap" && (
                <div className="space-y-3">
                  <span className="eyebrow text-[0.6rem] text-muted-foreground block">
                    Dynamic XML Sitemap Spec
                  </span>

                  <div className="bg-muted p-4 border border-border font-mono text-[0.65rem] text-foreground/80 overflow-x-auto max-h-72 leading-relaxed">
                    <pre>{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${canonicalUrl}/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${canonicalUrl}/shop</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${canonicalUrl}/collections</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${canonicalUrl}/lookbook</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${canonicalUrl}/about</loc>
    <priority>0.5</priority>
  </url>
</urlset>`}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
