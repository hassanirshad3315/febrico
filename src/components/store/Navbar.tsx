import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { store, useStore } from "@/lib/store";
import { openSearchDialog } from "./SearchDialog";
import { ShopMegaMenu, CollectionsMegaMenu } from "./MegaMenu";
import type { Category, Collection } from "@/lib/catalog";
import { waLink } from "@/lib/whatsapp";

export function Navbar({
  categories = [],
  collections = [],
  whatsappNumber = "923000000000",
}: {
  categories?: Category[];
  collections?: Collection[];
  whatsappNumber?: string;
}) {
  const [activeMenu, setActiveMenu] = useState<"shop" | "collections" | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const wishlistCount = useStore((s) => s.wishlist.length);
  const bagItemsCount = useStore((s) => s.bag.reduce((sum, item) => sum + item.qty, 0));

  // Close menus on route change
  const routerState = useRouterState();
  useEffect(() => {
    setActiveMenu(null);
    setMobileMenuOpen(false);
  }, [routerState.location.pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const waUrl = waLink(
    whatsappNumber,
    "Hello FABRICO, I would like assistance with your latest collection."
  );

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled || activeMenu
            ? "bg-card/95 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-background/80 backdrop-blur-sm border-b border-border/40"
        }`}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-foreground hover:text-gold transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="font-serif text-2xl sm:text-3xl tracking-[0.25em] text-foreground font-medium uppercase hover:opacity-90 transition-opacity"
              >
                FABRICO
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 text-[0.72rem] tracking-[0.2em] font-medium uppercase text-foreground/80">
              <Link
                to="/new-in"
                className="hover:text-foreground link-underline transition-colors flex items-center gap-1.5"
                onMouseEnter={() => setActiveMenu(null)}
              >
                <Sparkles className="h-3 w-3 text-gold" />
                <span>New In</span>
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setActiveMenu("shop")}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === "shop" ? null : "shop")}
                  className={`hover:text-foreground flex items-center gap-1 transition-colors ${
                    activeMenu === "shop" ? "text-foreground font-semibold" : ""
                  }`}
                >
                  <span>Shop</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeMenu === "shop" ? "rotate-180" : ""}`} />
                </button>
              </div>

              <div
                className="relative"
                onMouseEnter={() => setActiveMenu("collections")}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === "collections" ? null : "collections")}
                  className={`hover:text-foreground flex items-center gap-1 transition-colors ${
                    activeMenu === "collections" ? "text-foreground font-semibold" : ""
                  }`}
                >
                  <span>Collections</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeMenu === "collections" ? "rotate-180" : ""}`} />
                </button>
              </div>

              <Link
                to="/lookbook"
                className="hover:text-foreground link-underline transition-colors"
                onMouseEnter={() => setActiveMenu(null)}
              >
                Lookbook
              </Link>

              <Link
                to="/collections/$slug"
                params={{ slug: "sale" }}
                className="text-destructive hover:text-destructive/80 link-underline transition-colors"
                onMouseEnter={() => setActiveMenu(null)}
              >
                Sale
              </Link>
            </nav>

            {/* Desktop & Mobile Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search button */}
              <button
                type="button"
                onClick={() => openSearchDialog(true)}
                className="p-2 text-foreground/80 hover:text-foreground transition-colors"
                aria-label="Search catalog"
              >
                <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.5} />
              </button>

              {/* Wishlist button */}
              <Link
                to="/wishlist"
                className="p-2 text-foreground/80 hover:text-foreground transition-colors relative"
                aria-label={`Wishlist (${wishlistCount})`}
              >
                <Heart className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-foreground text-background text-[0.55rem] font-medium grid place-items-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Trigger */}
              <button
                type="button"
                onClick={() => store.setBagOpen(true)}
                className="p-2 text-foreground/80 hover:text-foreground transition-colors relative"
                aria-label={`Shopping Bag (${bagItemsCount})`}
              >
                <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.5} />
                {bagItemsCount > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-gold text-ink font-bold text-[0.55rem] grid place-items-center">
                    {bagItemsCount}
                  </span>
                )}
              </button>

              {/* WhatsApp direct order action */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-[0.65rem] tracking-[0.15em] uppercase font-medium hover:border-foreground transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5 text-[#25D366] fill-[#25D366]" />
                <span>Concierge</span>
              </a>
            </div>
          </div>
        </div>

        {/* Mega Menus for Desktop */}
        {activeMenu === "shop" && (
          <ShopMegaMenu
            categories={categories}
            onClose={() => setActiveMenu(null)}
          />
        )}
        {activeMenu === "collections" && (
          <CollectionsMegaMenu
            collections={collections}
            onClose={() => setActiveMenu(null)}
          />
        )}
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Menu Panel */}
          <div className="relative w-full max-w-xs bg-card border-r border-border h-full flex flex-col z-10 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-xl tracking-[0.25em] font-medium"
              >
                FABRICO
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 px-5 py-6 space-y-6">
              {/* Primary Store Links */}
              <div className="space-y-3">
                <Link
                  to="/new-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-sm font-medium uppercase tracking-wider text-foreground hover:text-gold"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                    New Arrivals
                  </span>
                </Link>

                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium uppercase tracking-wider text-foreground hover:text-gold"
                >
                  Shop All Pieces
                </Link>

                <Link
                  to="/collections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium uppercase tracking-wider text-foreground hover:text-gold"
                >
                  Collections
                </Link>

                <Link
                  to="/lookbook"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium uppercase tracking-wider text-foreground hover:text-gold"
                >
                  Lookbook & Stories
                </Link>

                <Link
                  to="/collections/$slug"
                  params={{ slug: "sale" }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium uppercase tracking-wider text-destructive"
                >
                  Sale Reductions
                </Link>
              </div>

              {/* Categories Section */}
              <div className="pt-4 border-t border-border/60">
                <p className="eyebrow text-[0.65rem] text-muted-foreground mb-3">
                  Categories
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {categories
                    .filter((c) => !c.parent_id)
                    .map((c) => (
                      <Link
                        key={c.id}
                        to="/category/$slug"
                        params={{ slug: c.slug }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xs text-foreground/80 hover:text-foreground py-1"
                      >
                        {c.name}
                      </Link>
                    ))}
                </div>
              </div>

              {/* Customer Care & Information */}
              <div className="pt-4 border-t border-border/60 space-y-2 text-xs text-muted-foreground">
                <p className="eyebrow text-[0.65rem] text-muted-foreground mb-2">
                  Client Services
                </p>
                <Link
                  to="/size-guide"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-foreground py-0.5"
                >
                  Size & Fit Guide
                </Link>
                <Link
                  to="/shipping"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-foreground py-0.5"
                >
                  Shipping & Delivery
                </Link>
                <Link
                  to="/returns"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-foreground py-0.5"
                >
                  Returns & Exchanges
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-foreground py-0.5"
                >
                  About FABRICO
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-foreground py-0.5"
                >
                  Contact & Support
                </Link>
              </div>
            </div>

            {/* Bottom Mobile Drawer WhatsApp CTA */}
            <div className="p-5 border-t border-border bg-muted/40">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-lux w-full flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#1EBE5D] border-none text-xs"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>Order On WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
