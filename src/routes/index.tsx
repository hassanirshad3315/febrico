import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  MessageCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import { homeQuery, formatPKR, type Product, type Collection } from "@/lib/catalog";
import { ProductRail, ProductCard } from "@/components/store/ProductCard";
import { QuickView, openQuickView } from "@/components/store/QuickView";
import { openSearchDialog } from "@/components/store/SearchDialog";
import { track } from "@/lib/analytics";
import { store } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FABRICO — Contemporary Luxury Pakistani Women's Fashion" },
      {
        name: "description",
        content:
          "Discover modern Pakistani fashion: artisanal raw silks, unstitched luxury lawn, festive formal wear, and bespoke WhatsApp concierge ordering.",
      },
      { property: "og:title", content: "FABRICO — Contemporary Pakistani Fashion" },
      {
        property: "og:description",
        content:
          "Artisanal luxury fabrics, handcrafted embroidery, and effortless WhatsApp ordering.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/images/hero-1.jpg" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: HomePage,
});

function HomePage() {
  const { data } = useSuspenseQuery(homeQuery);
  const heroSlides = data?.hero || [];
  const [heroIndex, setHeroIndex] = useState(0);

  // Auto rotate hero slides
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const currentHero = heroSlides[heroIndex] || heroSlides[0];

  const categories = [
    { title: "Ready To Wear", slug: "ready-to-wear", image: "/images/look-4.jpg", desc: "Stitched & ready to style" },
    { title: "Unstitched Luxury", slug: "unstitched", image: "/images/look-6.jpg", desc: "3-piece lawn & cambric" },
    { title: "Festive & Suits", slug: "suits", image: "/images/look-1.jpg", desc: "Raw silk & hand embellishment" },
    { title: "Dresses & Kaftans", slug: "dresses", image: "/images/look-2.jpg", desc: "Flowing modern silhouettes" },
    { title: "Co-Ord Sets", slug: "co-ords", image: "/images/look-3.jpg", desc: "Effortless matching pairs" },
    { title: "Shawls & Dupattas", slug: "shawls-dupattas", image: "/images/hero-2.jpg", desc: "Organza, velvet & chiffon" },
  ];

  const occasions = [
    { title: "Everyday Elegance", link: "/collections/casual", image: "/images/look-3.jpg", tag: "Casual Luxe" },
    { title: "Festive Celebrations", link: "/collections/festive", image: "/images/look-5.jpg", tag: "Festive Edit" },
    { title: "Formal Evenings", link: "/collections/formal", image: "/images/look-2.jpg", tag: "Heirloom Velvet" },
    { title: "Summer Breezes", link: "/collections/summer", image: "/images/look-6.jpg", tag: "Breathable Lawn" },
  ];

  const ugcPosts = [
    { img: "/images/look-1.jpg", title: "Ivory Raw Silk", handle: "@fabrico.pk" },
    { img: "/images/look-3.jpg", title: "Rose Lawn Co-Ord", handle: "@fabrico.pk" },
    { img: "/images/look-5.jpg", title: "Festive Emerald", handle: "@fabrico.pk" },
    { img: "/images/look-2.jpg", title: "Noir Velvet", handle: "@fabrico.pk" },
    { img: "/images/look-6.jpg", title: "Sky Printed Lawn", handle: "@fabrico.pk" },
    { img: "/images/look-4.jpg", title: "Mustard Cambric", handle: "@fabrico.pk" },
  ];

  return (
    <main className="space-y-0">
      {/* 1. Cinematic Hero Section */}
      {currentHero && (
        <section className="relative h-[88vh] sm:h-[92vh] overflow-hidden bg-ink select-none">
          {heroSlides.map((slide, i) => (
            <div
              key={slide.id || i}
              className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                i === heroIndex ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="anim-ken-burns absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: slide.focal || "center" }}
              />
              <div
                className="absolute inset-0 bg-ink"
                style={{ opacity: (slide.overlay ?? 30) / 100 }}
              />
            </div>
          ))}

          {/* Hero Content Overlay */}
          <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-16 sm:pb-24 text-ivory">
            <div className="max-w-2xl space-y-4 anim-fade-up">
              <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-gold"></span>
                <p className="eyebrow text-[0.68rem] text-gold tracking-[0.3em]">
                  FABRICO STUDIO EDIT
                </p>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.02] tracking-tight">
                {currentHero.title}
              </h1>

              <p className="text-xs sm:text-sm text-ivory/80 max-w-lg leading-relaxed font-sans">
                {currentHero.subtitle ||
                  "Discover handcrafted raw silks, breathable lawn prints, and evening silhouettes."}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                {currentHero.cta_url && (
                  <Link to={currentHero.cta_url} className="btn-lux bg-ivory text-ink hover:bg-gold hover:text-ink">
                    {currentHero.cta_label || "Shop Collection"}
                  </Link>
                )}
                {currentHero.cta2_url && (
                  <Link to={currentHero.cta2_url} className="btn-outline text-ivory hover:text-ink hover:bg-ivory border-ivory">
                    {currentHero.cta2_label || "Explore Story"}
                  </Link>
                )}
              </div>
            </div>

            {/* Slider Controls */}
            {heroSlides.length > 1 && (
              <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                  className="p-2 text-ivory/60 hover:text-ivory bg-white/5 backdrop-blur-xs border border-white/10 hover:border-white/30 transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-[0.68rem] font-mono tracking-widest text-ivory/80">
                  0{heroIndex + 1} / 0{heroSlides.length}
                </div>
                <button
                  type="button"
                  onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                  className="p-2 text-ivory/60 hover:text-ivory bg-white/5 backdrop-blur-xs border border-white/10 hover:border-white/30 transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Trust Strip */}
      <section className="bg-muted/40 border-b border-border py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <Truck className="h-4 w-4 text-gold" />
            <p className="eyebrow text-[0.62rem] text-foreground font-semibold">
              Nationwide Delivery
            </p>
            <p className="text-[0.68rem] text-muted-foreground">Free shipping over PKR 5,000</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <MessageCircle className="h-4 w-4 text-gold" />
            <p className="eyebrow text-[0.62rem] text-foreground font-semibold">
              WhatsApp Concierge
            </p>
            <p className="text-[0.68rem] text-muted-foreground">Direct stylist advice & ordering</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-gold" />
            <p className="eyebrow text-[0.62rem] text-foreground font-semibold">
              Artisanal Craft
            </p>
            <p className="text-[0.68rem] text-muted-foreground">Pure silks, lawns & organzas</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <RefreshCw className="h-4 w-4 text-gold" />
            <p className="eyebrow text-[0.62rem] text-foreground font-semibold">
              Hassle-Free Returns
            </p>
            <p className="text-[0.68rem] text-muted-foreground">Dedicated exchange support</p>
          </div>
        </div>
      </section>

      {/* 3. Shop By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-muted-foreground mb-1">Discover The Studio</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-normal">
              Shop By Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-widest font-semibold text-foreground hover:text-gold flex items-center gap-1.5 underline underline-offset-4"
          >
            <span>View Complete Studio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to="/category/$slug"
              params={{ slug: cat.slug }}
              className="group relative block aspect-[3/4] overflow-hidden bg-muted"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent flex flex-col justify-end p-4 text-ivory">
                <h3 className="font-serif text-base sm:text-lg font-medium group-hover:text-gold transition-colors">
                  {cat.title}
                </h3>
                <p className="text-[0.65rem] text-ivory/70 line-clamp-1 mt-0.5">
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Dynamic Merchandised Product Sections (New In, Top This Week, Trending Now, Best Sellers, Most Loved) */}
      {data?.sections
        ?.filter((s: any) => s.type === "product_carousel" && s.products?.length > 0)
        .map((s: any, idx: number) => (
          <section key={s.id || idx} className="py-16 border-t border-border/40 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-muted-foreground mb-1">
                  {s.subtitle || "Curated Merchandising"}
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-normal">
                  {s.title}
                </h2>
              </div>
              {s.config?.cta_url && (
                <Link
                  to={s.config.cta_url}
                  className="text-xs uppercase tracking-widest font-semibold text-foreground hover:text-gold flex items-center gap-1.5 underline underline-offset-4"
                >
                  <span>{s.config.cta_label || "View All"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <ProductRail products={s.products} badge={s.config?.badge} />
          </section>
        ))}

      {/* 5. Editorial Story Block ("The Winter Edit") */}
      <section className="bg-ink text-ivory my-16 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center">
          <div className="aspect-[4/3] md:aspect-square overflow-hidden bg-muted">
            <img
              src="/images/look-2.jpg"
              alt="The Winter Edit"
              className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
            />
          </div>
          <div className="p-8 sm:p-16 lg:p-20 space-y-6">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-gold"></span>
              <p className="eyebrow text-gold text-[0.65rem]">Seasonal Narrative</p>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-normal leading-tight">
              The Winter & Festive Edit
            </h2>
            <p className="text-xs sm:text-sm text-ivory/80 leading-relaxed font-sans">
              Layered textures in khaddar, hand-spun karandi, and rich embroidered velvet. Designed for evening gatherings, crisp winter afternoons, and effortless celebration.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/campaign/$slug" params={{ slug: "winter-edit" }} className="btn-lux bg-ivory text-ink hover:bg-gold hover:text-ink">
                Explore The Campaign
              </Link>
              <Link to="/collections/$slug" params={{ slug: "festive" }} className="btn-outline text-ivory border-ivory hover:bg-ivory hover:text-ink">
                Shop Festive Pieces
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Shop by Occasion */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="eyebrow text-muted-foreground">Lifestyle & Mood</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-normal">
            Shop By Occasion
          </h2>
          <p className="text-xs text-muted-foreground">
            Whether for everyday ease or special milestone festivities, discover curated edits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {occasions.map((occ) => (
            <Link
              key={occ.title}
              to={occ.link}
              className="group relative aspect-[3/4] overflow-hidden bg-muted block"
            >
              <img
                src={occ.image}
                alt={occ.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent flex flex-col justify-end p-6 text-ivory">
                <span className="eyebrow text-[0.6rem] text-gold mb-1">{occ.tag}</span>
                <h3 className="font-serif text-xl group-hover:text-gold transition-colors">
                  {occ.title}
                </h3>
                <span className="text-[0.68rem] text-ivory/80 underline underline-offset-4 mt-2 inline-flex items-center gap-1 font-sans">
                  Shop Edit <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Lookbook & Shop The Look Spotlight */}
      <section className="bg-muted/30 border-y border-border py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-muted-foreground mb-1">Editorial Vision</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-normal">
                Modern Pakistani Classics
              </h2>
            </div>
            <Link
              to="/lookbook"
              className="text-xs uppercase tracking-widest font-semibold text-foreground hover:text-gold flex items-center gap-1.5 underline underline-offset-4"
            >
              <span>View Full Lookbook</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative group aspect-[3/4] overflow-hidden bg-muted">
              <img
                src="/images/look-1.jpg"
                alt="Ivory Raw Silk"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Link
                  to="/product/$slug"
                  params={{ slug: "ivory-embroidered-raw-silk-3-piece" }}
                  className="btn-lux bg-ivory text-ink text-xs"
                >
                  Shop This Look
                </Link>
              </div>
            </div>

            <div className="relative group aspect-[3/4] overflow-hidden bg-muted">
              <img
                src="/images/look-5.jpg"
                alt="Emerald Raw Silk Festive"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Link
                  to="/product/$slug"
                  params={{ slug: "emerald-raw-silk-festive-suit" }}
                  className="btn-lux bg-ivory text-ink text-xs"
                >
                  Shop This Look
                </Link>
              </div>
            </div>

            <div className="relative group aspect-[3/4] overflow-hidden bg-muted">
              <img
                src="/images/look-2.jpg"
                alt="Noir Velvet Kurta"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Link
                  to="/product/$slug"
                  params={{ slug: "noir-velvet-embroidered-kurta" }}
                  className="btn-lux bg-ivory text-ink text-xs"
                >
                  Shop This Look
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. WhatsApp Direct Ordering Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="bg-[#0f1f15] border border-[#25D366]/30 p-8 sm:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="eyebrow text-[#25D366] text-[0.65rem] tracking-[0.25em]">
              EFFORTLESS WHATSAPP COMMERCE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal leading-tight">
              Order Your Bespoke Pieces Directly in One Message
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
              Browse our studio catalog, add your favorite pieces to your bag, and tap proceed. Our stylist team confirms stock, sizing, and custom delivery immediately.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              type="button"
              onClick={() => store.setBagOpen(true)}
              className="btn-lux bg-[#25D366] text-white hover:bg-[#1EBE5D] border-none flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>View My Bag</span>
            </button>
            <Link to="/shop" className="btn-outline text-white border-white hover:bg-white hover:text-ink">
              Browse Studio
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Social Proof & Community Edit */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-8">
        <div className="text-center space-y-1">
          <p className="eyebrow text-muted-foreground">Follow The Journey</p>
          <h2 className="font-serif text-3xl text-foreground font-normal">
            @fabrico.pk on Instagram
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ugcPosts.map((post, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden bg-muted">
              <img
                src={post.img}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-ivory">
                <p className="text-[0.62rem] font-medium truncate">{post.title}</p>
                <p className="text-[0.55rem] text-ivory/70">{post.handle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
