import { useState, useEffect } from "react";
import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Layers,
  FolderTree,
  ShoppingBag,
  Users,
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Sliders,
  Sparkles,
  BookOpen,
  Megaphone,
  Images,
  FileText,
  Navigation,
  Globe,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_SECTIONS = [
  {
    title: "Commerce & Operations",
    links: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
      { label: "Products", to: "/admin/products", icon: Package },
      { label: "Collections", to: "/admin/collections", icon: Layers },
      { label: "Categories", to: "/admin/categories", icon: FolderTree },
      { label: "Orders & Inquiries", to: "/admin/orders", icon: ShoppingBag },
      { label: "Customer CRM", to: "/admin/customers", icon: Users },
    ],
  },
  {
    title: "Merchandising Intelligence",
    links: [
      { label: "Algorithm Intelligence", to: "/admin/analytics", icon: BarChart3 },
      { label: "Product Performance", to: "/admin/analytics/products", icon: TrendingUp },
      { label: "Collection Metrics", to: "/admin/analytics/collections", icon: PieChart },
      { label: "Traffic & Funnel", to: "/admin/analytics/traffic", icon: Activity },
    ],
  },
  {
    title: "Editorial & Content CMS",
    links: [
      { label: "Hero Carousel", to: "/admin/hero", icon: Sliders },
      { label: "Campaigns & Drops", to: "/admin/campaigns", icon: Sparkles },
      { label: "Lookbook & Hotspots", to: "/admin/lookbook", icon: BookOpen },
      { label: "Announcements", to: "/admin/promotions", icon: Megaphone },
      { label: "Media Library", to: "/admin/media", icon: Images },
      { label: "Content Pages", to: "/admin/pages", icon: FileText },
    ],
  },
  {
    title: "Architecture & Settings",
    links: [
      { label: "Navigation Menus", to: "/admin/navigation", icon: Navigation },
      { label: "SEO & Social Graph", to: "/admin/seo", icon: Globe },
      { label: "Studio Settings", to: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    router.navigate({ to: "/admin/login" as any });
  };

  return (
    <div className="min-h-screen bg-muted/20 text-foreground flex flex-col lg:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-30">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Open admin menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/admin" className="font-serif text-lg tracking-[0.2em] font-medium">
          FABRICO CMS
        </Link>
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Sidebar Overlay on Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <Link to="/admin" className="font-serif text-xl tracking-[0.25em] font-medium block">
              FABRICO
            </Link>
            <span className="eyebrow text-[0.58rem] text-gold mt-0.5 block tracking-widest">
              Operations & Merchandising
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {ADMIN_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.title}
              </div>
              {section.links.map((link) => {
                const Icon = link.icon;
                const isActive =
                  currentPath === link.to ||
                  (link.to !== "/admin" &&
                    link.to !== "/admin/analytics" &&
                    currentPath.startsWith(link.to + "/"));
                return (
                  <Link
                    key={link.to}
                    to={link.to as any}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-none font-medium transition-colors ${
                      isActive
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border space-y-2 text-xs shrink-0">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <span>Customer Storefront</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors text-left"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-card border-b border-border items-center justify-between px-8">
          <h1 className="font-serif text-2xl text-foreground font-normal">
            {title || "Studio Management"}
          </h1>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 text-[0.68rem] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live Database Active
            </span>
            <Link
              to="/"
              className="btn-outline text-xs px-3 py-1.5 h-8 flex items-center gap-1.5"
            >
              <span>View Storefront</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
