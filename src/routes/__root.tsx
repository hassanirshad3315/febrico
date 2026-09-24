import { QueryClient, QueryClientProvider, useSuspenseQuery } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { layoutQuery } from "../lib/catalog";
import { AnnouncementBar } from "../components/store/AnnouncementBar";
import { Navbar } from "../components/store/Navbar";
import { Footer } from "../components/store/Footer";
import { BagDrawer } from "../components/store/BagDrawer";
import { SearchDialog } from "../components/store/SearchDialog";
import { QuickView } from "../components/store/QuickView";
import { FloatingWhatsApp } from "../components/store/FloatingWhatsApp";
import { MobileBottomBar } from "../components/store/MobileBottomBar";
import { SizeGuideModal } from "../components/store/SizeGuideModal";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <p className="eyebrow text-muted-foreground">Error 404</p>
        <h1 className="font-serif text-5xl font-normal text-foreground">Piece Not Found</h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The collection or piece you are looking for is unavailable or has been archived.
        </p>
        <div className="pt-4">
          <Link to="/" className="btn-lux">
            Return to Studio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Runtime Error:", error);
  const router = useRouter();

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <p className="eyebrow text-destructive">Application Notice</p>
        <h1 className="font-serif text-4xl text-foreground font-normal">
          Unable to Load Content
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We encountered an issue retrieving this page from the FABRICO catalog.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-lux text-xs"
          >
            Try Again
          </button>
          <Link to="/" className="btn-outline text-xs">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: ({ context }) => context.queryClient.ensureQueryData(layoutQuery),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
      { title: "FABRICO — Luxury Pakistani Women's Fashion" },
      {
        name: "description",
        content:
          "Discover contemporary Pakistani women's fashion: ready to wear, unstitched luxury fabrics, festive edits, and effortless WhatsApp ordering.",
      },
      { name: "author", content: "FABRICO Style Studio" },
      { property: "og:title", content: "FABRICO — Luxury Pakistani Women's Fashion" },
      {
        property: "og:description",
        content:
          "Contemporary Pakistani women's fashion: ready to wear, unstitched, festive and formal. Order easily on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/images/hero-1.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#1a1a1a" },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Manrope:wght@300;400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-gold/30">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function StoreLayout() {
  const { data } = useSuspenseQuery(layoutQuery);
  const whatsappNumber = (data?.settings as Record<string, any>)?.["whatsapp"]?.number || "923000000000";

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar items={data?.announcements} />
      <Navbar
        categories={data?.categories}
        collections={data?.collections}
        whatsappNumber={whatsappNumber}
      />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer whatsappNumber={whatsappNumber} />
      <MobileBottomBar />
      <BagDrawer whatsappNumber={whatsappNumber} />
      <SearchDialog />
      <QuickView whatsappNumber={whatsappNumber} />
      <FloatingWhatsApp whatsappNumber={whatsappNumber} />
      <SizeGuideModal whatsappNumber={whatsappNumber} />
      <Toaster position="top-center" richColors />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreLayout />
    </QueryClientProvider>
  );
}
