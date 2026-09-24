import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { formatPKR, type Product } from "@/lib/catalog";
import { store, useStore } from "@/lib/store";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { openQuickView } from "./QuickView";

export function productBadge(p: Product, forced?: string) {
  if (forced) return forced;
  if (p.stock_status === "sold_out") return "Sold Out";
  if (p.on_sale && p.sale_price) return "Sale";
  if (p.is_best_seller) return "Best Seller";
  if (p.is_trending) return "Trending";
  if (p.is_new) return "New";
  return null;
}

export function Price({ p, className }: { p: Pick<Product, "price" | "sale_price">; className?: string }) {
  return (
    <p className={cn("text-sm tracking-wide", className)}>
      {p.sale_price ? (
        <>
          <span className="text-destructive">{formatPKR(p.sale_price)}</span>{" "}
          <s className="ml-1 text-muted-foreground">{formatPKR(p.price)}</s>
        </>
      ) : (
        formatPKR(p.price)
      )}
    </p>
  );
}

export function WishlistButton({ productId, className }: { productId: string; className?: string }) {
  const on = useStore((s) => s.wishlist.includes(productId));
  return (
    <button
      type="button"
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = store.toggleWishlist(productId);
        track(added ? "wishlist_add" : "wishlist_remove", { product_id: productId });
      }}
      className={cn("grid h-10 w-10 place-items-center transition-colors", className)}
    >
      <Heart className={cn("h-[18px] w-[18px]", on && "fill-current")} strokeWidth={1.25} />
    </button>
  );
}

export function ProductCard({ p, badge, priority }: { p: Product; badge?: string | undefined; priority?: boolean }) {
  const b = productBadge(p, badge);
  return (
    <article className="group relative">
      <Link
        to="/product/$slug"
        params={{ slug: p.slug }}
        onClick={() => track("product_click", { product_id: p.id, collection_id: p.collection_id })}
        className="block"
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          <img
            src={p.images[0]}
            alt={p.image_alts[0] ?? p.name}
            loading={priority ? "eager" : "lazy"}
            width={1024}
            height={1536}
            style={{ objectPosition: p.focal }}
            className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-lux)] group-hover:scale-[1.02]"
          />
          {p.images[1] && (
            <img
              src={p.images[1]}
              alt=""
              aria-hidden
              loading="lazy"
              style={{ objectPosition: p.focal }}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-[var(--ease-lux)] group-hover:opacity-100"
            />
          )}
          {b && (
            <span className="eyebrow absolute left-3 top-3 bg-background/90 px-2 py-1 text-[0.6rem] text-foreground">{b}</span>
          )}
        </div>
      </Link>
      <WishlistButton productId={p.id} className="absolute right-1 top-1 text-foreground" />
      <div className="mt-4 space-y-1">
        {p.collection && <p className="eyebrow text-[0.6rem] text-muted-foreground">{p.collection.name}</p>}
        <div className="flex items-start justify-between gap-2">
          <Link to="/product/$slug" params={{ slug: p.slug }} className="min-w-0 text-sm leading-snug">
            {p.name}
          </Link>
          <button
            type="button"
            onClick={() => {
              track("quick_view", { product_id: p.id, collection_id: p.collection_id, source: "card" });
              openQuickView(p);
            }}
            className="eyebrow shrink-0 pt-0.5 text-[0.58rem] text-muted-foreground hover:text-foreground"
            aria-label={`Quick view ${p.name}`}
          >
            Quick view
          </button>
        </div>
        <Price p={p} />
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} p={p} priority={i < 4} />
      ))}
    </div>
  );
}

export function ProductRail({ products, badge }: { products: Product[]; badge?: string }) {
  return (
    <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:-mx-10 md:gap-6 md:px-10">
      {products.map((p) => (
        <div key={p.id} className="w-[62%] shrink-0 snap-start sm:w-[40%] md:w-[28%] lg:w-[22%]">
          <ProductCard p={p} badge={badge} />
        </div>
      ))}
    </div>
  );
}
