import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Search, Heart, ShoppingBag } from "lucide-react";
import { store, useStore } from "@/lib/store";
import { openSearchDialog } from "./SearchDialog";

export function MobileBottomBar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const wishlistCount = useStore((s) => s.wishlist.length);
  const bagCount = useStore((s) => s.bag.reduce((sum, item) => sum + item.qty, 0));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border lg:hidden pb-[env(safe-area-inset-bottom)]">
      <nav className="grid grid-cols-5 h-14 items-center justify-items-center text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-1 w-full h-full ${
            currentPath === "/" ? "text-foreground font-semibold" : "hover:text-foreground"
          }`}
        >
          <Home className="h-4 w-4" strokeWidth={currentPath === "/" ? 2 : 1.5} />
          <span>Home</span>
        </Link>

        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center gap-1 w-full h-full ${
            currentPath === "/shop" ? "text-foreground font-semibold" : "hover:text-foreground"
          }`}
        >
          <Compass className="h-4 w-4" strokeWidth={currentPath === "/shop" ? 2 : 1.5} />
          <span>Shop</span>
        </Link>

        <button
          type="button"
          onClick={() => openSearchDialog(true)}
          className="flex flex-col items-center justify-center gap-1 w-full h-full hover:text-foreground"
        >
          <Search className="h-4 w-4" strokeWidth={1.5} />
          <span>Search</span>
        </button>

        <Link
          to="/wishlist"
          className={`flex flex-col items-center justify-center gap-1 w-full h-full relative ${
            currentPath === "/wishlist" ? "text-foreground font-semibold" : "hover:text-foreground"
          }`}
        >
          <div className="relative">
            <Heart className="h-4 w-4" strokeWidth={currentPath === "/wishlist" ? 2 : 1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 h-3.5 w-3.5 rounded-full bg-foreground text-background text-[0.5rem] font-bold grid place-items-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span>Saved</span>
        </Link>

        <button
          type="button"
          onClick={() => store.setBagOpen(true)}
          className="flex flex-col items-center justify-center gap-1 w-full h-full relative hover:text-foreground"
        >
          <div className="relative">
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            {bagCount > 0 && (
              <span className="absolute -top-1.5 -right-2 h-3.5 w-3.5 rounded-full bg-gold text-ink text-[0.5rem] font-bold grid place-items-center">
                {bagCount}
              </span>
            )}
          </div>
          <span>Bag</span>
        </button>
      </nav>
    </div>
  );
}
