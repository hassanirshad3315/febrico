import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type Announcement = {
  id: string;
  text: string;
  mobile_text?: string | null;
  link?: string | null;
  priority?: number;
  active?: boolean;
};

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    text: "NEW SEASON HAS ARRIVED — DISCOVER THE ART OF CONTEMPORARY ELEGANCE",
    mobile_text: "NEW SEASON HAS ARRIVED — SHOP NOW",
    link: "/new-in",
  },
  {
    id: "2",
    text: "COMPLIMENTARY NATIONWIDE DELIVERY ON ORDERS OVER PKR 5,000",
    mobile_text: "FREE DELIVERY ABOVE PKR 5,000",
    link: "/shop",
  },
  {
    id: "3",
    text: "SEAMLESS WHATSAPP ORDERING & PERSONAL STYLING ASSISTANCE",
    mobile_text: "ORDER DIRECTLY ON WHATSAPP",
    link: "/about",
  },
];

export function AnnouncementBar({ items }: { items?: Announcement[] }) {
  const activeItems = (items && items.length > 0) ? items : DEFAULT_ANNOUNCEMENTS;
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (activeItems.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % activeItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeItems.length]);

  const current = activeItems[index] || activeItems[0];
  if (!visible || !current) return null;

  return (
    <aside aria-label="Announcement" className="relative z-50 bg-ink text-ivory border-b border-white/10 text-[0.68rem] tracking-[0.2em] uppercase font-medium">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="hidden sm:flex items-center gap-2">
          {activeItems.length > 1 && (
            <button
              onClick={() => setIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length)}
              className="p-1 text-ivory/60 hover:text-ivory transition-colors"
              aria-label="Previous announcement"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex-1 text-center truncate px-2">
          {current.link ? (
            <Link
              to={current.link}
              className="inline-flex items-center justify-center gap-2 hover:text-gold transition-colors duration-300"
            >
              <span className="hidden sm:inline">{current.text}</span>
              <span className="sm:hidden">{current.mobile_text || current.text}</span>
              <span className="text-[0.6rem] underline underline-offset-4 tracking-normal font-sans">Shop Now</span>
            </Link>
          ) : (
            <>
              <span className="hidden sm:inline">{current.text}</span>
              <span className="sm:hidden">{current.mobile_text || current.text}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeItems.length > 1 && (
            <button
              onClick={() => setIndex((prev) => (prev + 1) % activeItems.length)}
              className="hidden sm:inline-flex p-1 text-ivory/60 hover:text-ivory transition-colors"
              aria-label="Next announcement"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={() => setVisible(false)}
            className="p-1 text-ivory/50 hover:text-ivory transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
