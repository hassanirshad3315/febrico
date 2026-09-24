import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { waLink } from "@/lib/whatsapp";

export function Footer({
  whatsappNumber = "923000000000",
}: {
  whatsappNumber?: string;
}) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim().toLowerCase() });

      if (error && !error.message.includes("duplicate")) {
        throw error;
      }

      setSubscribed(true);
      toast.success("Thank you for joining the FABRICO Edit.");
    } catch (err) {
      console.error(err);
      toast.error("Could not subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const conciergeUrl = waLink(
    whatsappNumber,
    "Hello FABRICO Concierge, I would like assistance."
  );

  return (
    <footer className="bg-ink text-ivory pt-16 pb-24 lg:pb-12 border-t border-white/10">
      {/* Service Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-14 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-none bg-white/5 border border-white/10 text-gold">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] font-semibold text-ivory">
                Nationwide Delivery
              </h4>
              <p className="text-[0.72rem] text-ivory/70 mt-1">
                Complimentary shipping across Pakistan on orders above PKR 5,000.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-none bg-white/5 border border-white/10 text-gold">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] font-semibold text-ivory">
                WhatsApp Concierge
              </h4>
              <p className="text-[0.72rem] text-ivory/70 mt-1">
                Direct styling consultation, custom sizing, and order assistance.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-none bg-white/5 border border-white/10 text-gold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] font-semibold text-ivory">
                Authentic Craft
              </h4>
              <p className="text-[0.72rem] text-ivory/70 mt-1">
                Finest raw silks, lawn, organza, and artisanal embroidery.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-none bg-white/5 border border-white/10 text-gold">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] font-semibold text-ivory">
                Hassle-Free Returns
              </h4>
              <p className="text-[0.72rem] text-ivory/70 mt-1">
                Easy exchanges and dedicated support for every order.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
        {/* Brand Column */}
        <div className="lg:col-span-4 space-y-4">
          <Link
            to="/"
            className="font-serif text-3xl tracking-[0.25em] text-ivory font-medium uppercase inline-block"
          >
            FABRICO
          </Link>
          <p className="text-xs text-ivory/70 leading-relaxed max-w-sm">
            Contemporary Pakistani women's fashion celebrating artisanal heritage and modern silhouettes. Stitched with precision, styled for life.
          </p>
          <div className="pt-2">
            <a
              href={conciergeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-gold hover:underline"
            >
              <span>Speak With A Stylist on WhatsApp</span>
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Collections */}
        <div className="lg:col-span-2 space-y-3">
          <p className="eyebrow text-[0.65rem] text-ivory tracking-[0.2em] font-semibold">
            Collections
          </p>
          <ul className="space-y-2 text-xs text-ivory/70">
            <li><Link to="/new-in" className="hover:text-ivory transition-colors">New Season</Link></li>
            <li><Link to="/collections/$slug" params={{ slug: "signature" }} className="hover:text-ivory transition-colors">Signature Edit</Link></li>
            <li><Link to="/collections/$slug" params={{ slug: "festive" }} className="hover:text-ivory transition-colors">Festive & Evening</Link></li>
            <li><Link to="/collections/$slug" params={{ slug: "casual" }} className="hover:text-ivory transition-colors">Casual Luxe</Link></li>
            <li><Link to="/collections/$slug" params={{ slug: "formal" }} className="hover:text-ivory transition-colors">Formal Collection</Link></li>
            <li><Link to="/collections/$slug" params={{ slug: "winter" }} className="hover:text-ivory transition-colors">Winter Edit</Link></li>
            <li><Link to="/collections/$slug" params={{ slug: "sale" }} className="hover:text-gold transition-colors text-gold/90">Sale Specials</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div className="lg:col-span-2 space-y-3">
          <p className="eyebrow text-[0.65rem] text-ivory tracking-[0.2em] font-semibold">
            Categories
          </p>
          <ul className="space-y-2 text-xs text-ivory/70">
            <li><Link to="/category/$slug" params={{ slug: "ready-to-wear" }} className="hover:text-ivory transition-colors">Ready To Wear</Link></li>
            <li><Link to="/category/$slug" params={{ slug: "unstitched" }} className="hover:text-ivory transition-colors">Unstitched Fabrics</Link></li>
            <li><Link to="/category/$slug" params={{ slug: "suits" }} className="hover:text-ivory transition-colors">2 & 3 Piece Suits</Link></li>
            <li><Link to="/category/$slug" params={{ slug: "dresses" }} className="hover:text-ivory transition-colors">Dresses & Kaftans</Link></li>
            <li><Link to="/category/$slug" params={{ slug: "co-ords" }} className="hover:text-ivory transition-colors">Co-Ord Sets</Link></li>
            <li><Link to="/category/$slug" params={{ slug: "tops" }} className="hover:text-ivory transition-colors">Kurtas & Shirts</Link></li>
            <li><Link to="/category/$slug" params={{ slug: "shawls-dupattas" }} className="hover:text-ivory transition-colors">Shawls & Dupattas</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="lg:col-span-2 space-y-3">
          <p className="eyebrow text-[0.65rem] text-ivory tracking-[0.2em] font-semibold">
            Customer Care
          </p>
          <ul className="space-y-2 text-xs text-ivory/70">
            <li><Link to="/size-guide" className="hover:text-ivory transition-colors">Size & Fit Guide</Link></li>
            <li><Link to="/shipping" className="hover:text-ivory transition-colors">Shipping & Delivery</Link></li>
            <li><Link to="/returns" className="hover:text-ivory transition-colors">Returns & Exchanges</Link></li>
            <li><Link to="/faqs" className="hover:text-ivory transition-colors">Frequently Asked Questions</Link></li>
            <li><Link to="/about" className="hover:text-ivory transition-colors">About Our Story</Link></li>
            <li><Link to="/contact" className="hover:text-ivory transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="lg:col-span-2 space-y-3">
          <p className="eyebrow text-[0.65rem] text-ivory tracking-[0.2em] font-semibold">
            The FABRICO Edit
          </p>
          <p className="text-[0.72rem] text-ivory/70">
            Subscribe for early previews of new releases and private seasonal sales.
          </p>
          {subscribed ? (
            <div className="flex items-center gap-2 text-xs text-gold py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>You are subscribed. Welcome.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                  className="w-full bg-white/5 border border-white/20 text-xs px-3 py-2 text-ivory placeholder:text-ivory/40 outline-none focus:border-gold transition-colors font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-lux w-full bg-ivory text-ink hover:bg-gold hover:text-ink text-[0.62rem] py-2 min-h-9"
              >
                {loading ? "Joining..." : "Join The List"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.68rem] text-ivory/50">
        <p>© {new Date().getFullYear()} FABRICO. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-ivory transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-ivory transition-colors">Terms of Service</Link>
          <Link to="/admin" className="hover:text-ivory transition-colors text-ivory/30">Studio Admin</Link>
        </div>
      </div>
    </footer>
  );
}
