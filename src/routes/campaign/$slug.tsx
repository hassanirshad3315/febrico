import { useState, useEffect } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Clock, ArrowRight, Loader2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_FIELDS, type Product } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";

type Campaign = {
  id: string;
  name: string;
  slug: string;
  type: string;
  headline: string | null;
  description: string | null;
  hero_image: string | null;
  banner: string | null;
  cta_label: string | null;
  cta_url: string | null;
  countdown_message: string | null;
  show_countdown: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

export const Route = createFileRoute("/campaign/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("slug", params.slug)
      .maybeSingle();

    if (!data) throw notFound();
    return { campaign: data as Campaign };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.campaign) return { meta: [{ title: "Campaign Not Found" }] };
    const c = loaderData.campaign;
    return {
      meta: [
        { title: `${c.name} — FABRICO Campaign Edit` },
        { name: "description", content: c.description || c.headline || "" },
        { property: "og:title", content: c.name },
        { property: "og:image", content: c.hero_image || "/images/hero-1.jpg" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="py-24 text-center px-4 space-y-4">
      <h1 className="font-serif text-4xl text-foreground font-normal">Campaign Not Found</h1>
      <Link to="/" className="btn-lux">
        Return to Studio
      </Link>
    </div>
  ),
  component: CampaignDetailPage,
});

function CampaignDetailPage() {
  const { campaign } = Route.useLoaderData();

  // Fetch campaign products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["campaign-products", campaign.id],
    queryFn: async () => {
      const { data: cp } = await supabase
        .from("campaign_products")
        .select("product_id, sort_order")
        .eq("campaign_id", campaign.id)
        .order("sort_order");

      if (!cp?.length) return [];
      const ids = cp.map((r) => r.product_id);
      const { data: prods } = await supabase.from("products").select(PRODUCT_FIELDS).in("id", ids);
      const map = new Map((prods as unknown as Product[] || []).map((p) => [p.id, p]));
      return ids.map((id) => map.get(id)).filter(Boolean) as Product[];
    },
  });

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!campaign.show_countdown || !campaign.ends_at) return;
    const target = new Date(campaign.ends_at).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [campaign.show_countdown, campaign.ends_at]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[0.65rem] tracking-wider uppercase text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/collections" className="hover:text-foreground">Campaigns</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{campaign.name}</span>
      </nav>

      {/* Hero Banner */}
      <div className="relative aspect-[21/9] sm:aspect-[24/8] bg-ink overflow-hidden flex items-center p-8 sm:p-14 text-ivory">
        <img
          src={campaign.hero_image || campaign.banner || "/images/hero-1.jpg"}
          alt={campaign.name}
          className="anim-ken-burns absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <p className="eyebrow text-gold text-[0.65rem] tracking-[0.25em]">
              {campaign.type.toUpperCase()} CAMPAIGN
            </p>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
            {campaign.headline || campaign.name}
          </h1>
          <p className="text-xs sm:text-sm text-ivory/80 max-w-md leading-relaxed">
            {campaign.description || "Curated silhouettes and special release edits."}
          </p>
        </div>
      </div>

      {/* Countdown Timer Block if active */}
      {timeLeft && (
        <div className="bg-muted/60 border border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-foreground">
            <Clock className="h-4 w-4 text-gold" />
            <span>{campaign.countdown_message || "Limited Time Campaign Release:"}</span>
          </div>
          <div className="flex items-center gap-4 text-center">
            <div className="bg-card border border-border px-3 py-1.5 min-w-12">
              <span className="font-mono text-base font-bold text-foreground">{timeLeft.days}</span>
              <p className="text-[0.55rem] text-muted-foreground uppercase">Days</p>
            </div>
            <div className="bg-card border border-border px-3 py-1.5 min-w-12">
              <span className="font-mono text-base font-bold text-foreground">{timeLeft.hours}</span>
              <p className="text-[0.55rem] text-muted-foreground uppercase">Hours</p>
            </div>
            <div className="bg-card border border-border px-3 py-1.5 min-w-12">
              <span className="font-mono text-base font-bold text-foreground">{timeLeft.minutes}</span>
              <p className="text-[0.55rem] text-muted-foreground uppercase">Mins</p>
            </div>
            <div className="bg-card border border-border px-3 py-1.5 min-w-12">
              <span className="font-mono text-base font-bold text-foreground">{timeLeft.seconds}</span>
              <p className="text-[0.55rem] text-muted-foreground uppercase">Secs</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <p className="eyebrow text-muted-foreground">{products.length} Curated Pieces</p>
          <Link to="/shop" className="text-xs underline underline-offset-4 hover:text-gold flex items-center gap-1 font-medium">
            Explore Full Studio <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="eyebrow text-xs">Loading Campaign Pieces...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center space-y-3 border border-dashed border-border p-8">
            <p className="font-serif text-2xl text-foreground">Campaign Pieces Coming Soon</p>
            <p className="text-xs text-muted-foreground">Browse our other curated collections in the meantime.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-10 md:gap-x-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} p={p} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
