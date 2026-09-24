import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";

const ANALYTICS_TABS = [
  { label: "Algorithm Intelligence", to: "/admin/analytics", icon: BarChart3 },
  { label: "Product Performance", to: "/admin/analytics/products", icon: TrendingUp },
  { label: "Collection Metrics", to: "/admin/analytics/collections", icon: PieChart },
  { label: "Traffic & Funnel", to: "/admin/analytics/traffic", icon: Activity },
];

export function AnalyticsSubNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
      {ANALYTICS_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPath === tab.to;
        return (
          <Link
            key={tab.to}
            to={tab.to as any}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors border ${
              isActive
                ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
