import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { listProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";

export const Route = createFileRoute("/new-in")({
  head: () => ({
    meta: [
      { title: "New Arrivals — FABRICO Style Studio" },
      {
        name: "description",
        content:
          "Explore the latest seasonal drops, newly tailored raw silk suites, embroidered lawn co-ords, and festive statements from FABRICO.",
      },
      { property: "og:title", content: "New In | FABRICO" },
    ],
  }),
  component: NewInPage,
});

function NewInPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "new-in"],
    queryFn: () => listProducts({ newOnly: true, sort: "newest" }),
  });

  const products = data?.products || [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Banner */}
      <div className="relative aspect-[21/9] sm:aspect-[24/8] bg-ink overflow-hidden flex items-center p-8 sm:p-14 text-ivory">
        <img
          src="/images/hero-1.jpg"
          alt="New Arrivals"
          className="anim-ken-burns absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <p className="eyebrow text-gold text-[0.65rem]">Latest Season Release</p>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
            New Arrivals
          </h1>
          <p className="text-xs sm:text-sm text-ivory/80 max-w-md">
            The freshest silhouettes in raw silk, velvet, lawn, and organza. Handcrafted details for the modern wardrobe.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <p className="eyebrow text-muted-foreground">{products.length} New Pieces</p>
          <Link to="/shop" className="text-xs underline underline-offset-4 hover:text-gold flex items-center gap-1 font-medium">
            Explore All Studio <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="eyebrow text-xs">Loading New Arrivals...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <p className="font-serif text-2xl text-foreground">New season pieces are arriving soon</p>
            <p className="text-xs text-muted-foreground">Check back shortly or explore our current studio catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-10 md:gap-x-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} p={p} priority={i < 4} badge="New Season" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
