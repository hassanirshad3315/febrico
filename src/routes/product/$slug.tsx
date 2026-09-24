import { useState, useEffect, useTransition } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Heart,
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  Truck,
  RefreshCw,
  Ruler,
  Check,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  productQuery,
  STOCK_LABEL,
  formatPKR,
  type Product,
} from "@/lib/catalog";
import { store, useStore, getSessionId } from "@/lib/store";
import { track } from "@/lib/analytics";
import { buildOrderMessage, waLink } from "@/lib/whatsapp";
import { createInquiry } from "@/lib/orders.functions";
import { ProductCard } from "@/components/store/ProductCard";
import { openSizeGuide } from "@/components/store/SizeGuideModal";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!d || !d.product) throw notFound();
    return d;
  },
  head: ({ loaderData }) => {
    if (!loaderData || !loaderData.product) {
      return {
        meta: [{ title: "Piece Not Found | FABRICO" }, { name: "robots", content: "noindex" }],
      };
    }
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.seo_title || p.name} — FABRICO Style Studio` },
        {
          name: "description",
          content:
            p.seo_description ||
            p.short_description ||
            `Shop ${p.name} in ${p.fabric || "luxury fabric"} from FABRICO. Order with ease on WhatsApp.`,
        },
        { property: "og:title", content: p.name },
        {
          property: "og:description",
          content: p.short_description || p.description || "",
        },
        { property: "og:image", content: p.images[0] || "/images/hero-1.jpg" },
        { property: "og:type", content: "product" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="py-24 text-center px-4 space-y-4">
      <p className="eyebrow text-muted-foreground">Studio Archive</p>
      <h1 className="font-serif text-4xl text-foreground font-normal">
        This piece is currently unavailable
      </h1>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
        The piece you requested might be sold out or from a past seasonal edit.
      </p>
      <div className="pt-4">
        <Link to="/shop" className="btn-lux">
          Browse Current Collection
        </Link>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="py-24 text-center px-4 space-y-4">
      <h1 className="font-serif text-3xl text-foreground font-normal">
        Could not load product details
      </h1>
      <Link to="/shop" className="btn-outline">
        Return to Shop
      </Link>
    </div>
  ),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const p = data?.product;
  const completeTheLook = data?.completeTheLook || [];
  const youMayLike = data?.youMayLike || [];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [isPending, startTransition] = useTransition();

  const isWishlisted = useStore((s) => (p ? s.wishlist.includes(p.id) : false));

  // Initialize selected size and color
  useEffect(() => {
    if (p) {
      track("product_view", { product_id: p.id, collection_id: p.collection_id });
      if (p.sizes?.length > 0 && p.sizes[0]) setSelectedSize(p.sizes[0]);
      if (p.colors?.length > 0 && p.colors[0]) setSelectedColor(p.colors[0]);
      setActiveImageIdx(0);
      setQty(1);
    }
  }, [p?.id]);

  if (!p) return null;

  const handleAddToBag = () => {
    store.addToBag({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      sku: p.sku,
      image: p.images[0] || "/images/look-1.jpg",
      price: p.sale_price ?? p.price,
      size: selectedSize || (p.sizes[0] ?? "Standard"),
      color: selectedColor || (p.colors[0] ?? "Standard"),
      qty,
    });
    track("bag_add", { product_id: p.id, collection_id: p.collection_id });
    toast.success(`${p.name} added to your bag.`);
  };

  const handleDirectWhatsAppOrder = () => {
    startTransition(async () => {
      const size = selectedSize || (p.sizes[0] ?? "Standard");
      const color = selectedColor || (p.colors[0] ?? "Standard");
      const price = p.sale_price ?? p.price;

      await createInquiry({
        data: {
          source: "product_page",
          session_id: getSessionId(),
          items: [{ productId: p.id, size, color, qty }],
        },
      });

      track("whatsapp_click", { product_id: p.id, source: "product_page" });

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const message = buildOrderMessage(
        [
          {
            productId: p.id,
            slug: p.slug,
            name: p.name,
            sku: p.sku,
            image: p.images[0] || "/images/look-1.jpg",
            price,
            size,
            color,
            qty,
          },
        ],
        undefined,
        origin
      );

      const url = waLink("923000000000", message);
      window.open(url, "_blank", "noopener,noreferrer");
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[0.65rem] tracking-wider uppercase text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
        {p.collection && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link
              to="/collections/$slug"
              params={{ slug: p.collection.slug }}
              className="hover:text-foreground"
            >
              {p.collection.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate max-w-[180px] sm:max-w-none">{p.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Gallery Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnail list */}
          {p.images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0 md:w-20">
              {p.images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImageIdx(i)}
                  className={`aspect-[2/3] w-16 md:w-full overflow-hidden bg-muted border-2 transition-all ${
                    activeImageIdx === i ? "border-foreground" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${p.name} view ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Selected Image */}
          <div className="flex-1 relative aspect-[2/3] bg-muted overflow-hidden border border-border">
            <img
              src={p.images[activeImageIdx] || p.images[0]}
              alt={p.image_alts[activeImageIdx] ?? p.name}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              style={{ objectPosition: p.focal || "center top" }}
            />
            {p.is_new && (
              <span className="eyebrow absolute top-4 left-4 bg-background/95 text-foreground px-2.5 py-1 text-[0.62rem]">
                New Arrival
              </span>
            )}
            {p.on_sale && (
              <span className="eyebrow absolute top-4 right-4 bg-destructive text-white px-2.5 py-1 text-[0.62rem]">
                Sale
              </span>
            )}
          </div>
        </div>

        {/* Product Details & Actions Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="space-y-2 border-b border-border pb-6">
            {p.collection && (
              <p className="eyebrow text-muted-foreground text-[0.65rem]">
                {p.collection.name}
              </p>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal leading-tight">
              {p.name}
            </h1>

            {/* Price & SKU */}
            <div className="flex items-baseline justify-between pt-2">
              <div className="flex items-baseline gap-3">
                {p.sale_price ? (
                  <>
                    <span className="text-xl font-semibold text-destructive font-sans">
                      {formatPKR(p.sale_price)}
                    </span>
                    <s className="text-sm text-muted-foreground font-sans">
                      {formatPKR(p.price)}
                    </s>
                  </>
                ) : (
                  <span className="text-xl font-medium text-foreground font-sans">
                    {formatPKR(p.price)}
                  </span>
                )}
              </div>
              <span className="eyebrow text-[0.6rem] text-muted-foreground">
                SKU: {p.sku}
              </span>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <span className="inline-block px-2.5 py-0.5 text-[0.62rem] font-semibold bg-muted border border-border text-foreground uppercase tracking-widest">
                {STOCK_LABEL[p.stock_status]}
              </span>
              {p.fabric && (
                <span className="text-xs text-muted-foreground font-sans">
                  Crafted in {p.fabric}
                </span>
              )}
            </div>
          </div>

          {/* Variants: Sizes & Colors */}
          <div className="space-y-4">
            {/* Size Selector */}
            {p.sizes?.length > 0 && p.sizes[0] !== "One Size" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="eyebrow text-[0.62rem] text-foreground font-semibold">
                    Size: <span className="font-normal text-muted-foreground">{selectedSize}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => openSizeGuide(true)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 underline underline-offset-4"
                  >
                    <Ruler className="h-3 w-3" />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`h-10 min-w-10 px-3 text-xs uppercase tracking-wider border transition-all ${
                        selectedSize === s
                          ? "border-foreground bg-foreground text-background font-bold shadow-xs"
                          : "border-border text-foreground hover:border-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {p.colors?.length > 0 && (
              <div className="space-y-2">
                <span className="eyebrow text-[0.62rem] text-foreground font-semibold">
                  Color Shade: <span className="font-normal text-muted-foreground">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {p.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 text-xs border transition-all ${
                        selectedColor === c
                          ? "border-foreground bg-muted font-semibold"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2 pt-1">
              <span className="eyebrow text-[0.62rem] text-foreground font-semibold">
                Quantity
              </span>
              <div className="flex items-center border border-border w-32">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="h-9 w-9 grid place-items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  -
                </button>
                <span className="h-9 flex-1 text-xs font-semibold grid place-items-center">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(10, qty + 1))}
                  className="h-9 w-9 grid place-items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={p.stock_status === "sold_out"}
              className="btn-lux w-full flex items-center justify-center gap-2 py-4"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Add To Shopping Bag</span>
            </button>

            <button
              type="button"
              onClick={handleDirectWhatsAppOrder}
              disabled={isPending || p.stock_status === "sold_out"}
              className="btn-lux w-full flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#1EBE5D] border-none py-4 shadow-md"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4 fill-white" />
              )}
              <span>Instant WhatsApp Order</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const added = store.toggleWishlist(p.id);
                track(added ? "wishlist_add" : "wishlist_remove", { product_id: p.id });
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground transition-colors"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current text-destructive" : ""}`} />
              <span>{isWishlisted ? "Saved in Your Wishlist" : "Add to Wishlist"}</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 py-4 border-y border-border/60 text-[0.65rem] text-muted-foreground text-center">
            <div className="flex flex-col items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-gold" />
              <span>Free Delivery &gt; PKR 5k</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" />
              <span>100% Authentic</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5 text-gold" />
              <span>Easy Exchanges</span>
            </div>
          </div>

          {/* Product Accordion Details */}
          <Accordion type="single" collapsible defaultValue="description" className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger className="text-xs uppercase tracking-wider font-medium">
                Description & Craft
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>{p.description || p.short_description}</p>
                {p.fit && <p><strong>Fit:</strong> {p.fit}</p>}
                {p.season && <p><strong>Season:</strong> {p.season}</p>}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="care">
              <AccordionTrigger className="text-xs uppercase tracking-wider font-medium">
                Fabric & Care
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed space-y-1">
                <p>{p.care || "Dry clean recommended. Iron inside-out on low temperature setting."}</p>
                <p>Avoid harsh chemical bleaches to preserve delicate zari and thread embellishments.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery">
              <AccordionTrigger className="text-xs uppercase tracking-wider font-medium">
                Delivery & WhatsApp Protocol
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>
                  Every order is reviewed with our dedicated concierge on WhatsApp before final dispatch.
                </p>
                <p>
                  <strong>Delivery Timelines:</strong> 2–4 business days across major cities in Pakistan (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad).
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Complete The Look Section */}
      {completeTheLook.length > 0 && (
        <section className="space-y-8 pt-12 border-t border-border">
          <div className="space-y-1">
            <p className="eyebrow text-muted-foreground">Stylist Recommendations</p>
            <h2 className="font-serif text-3xl text-foreground font-normal">
              Complete The Look
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {completeTheLook.map((item) => (
              <ProductCard key={item.id} p={item} />
            ))}
          </div>
        </section>
      )}

      {/* You May Also Like Section */}
      {youMayLike.length > 0 && (
        <section className="space-y-8 pt-12 border-t border-border">
          <div className="space-y-1">
            <p className="eyebrow text-muted-foreground">From The Studio</p>
            <h2 className="font-serif text-3xl text-foreground font-normal">
              You May Also Like
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {youMayLike.slice(0, 4).map((item) => (
              <ProductCard key={item.id} p={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
