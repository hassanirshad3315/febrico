import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | FABRICO" },
      { name: "description", content: "Our commitments regarding customer privacy, order information, and browsing data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-8">
      <div className="border-b border-border pb-6 space-y-2">
        <p className="eyebrow text-gold text-[0.65rem] tracking-[0.25em]">LEGAL</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-foreground font-normal">
          Privacy Policy
        </h1>
        <p className="text-xs text-muted-foreground">Last updated: September 2026</p>
      </div>

      <div className="space-y-6 text-xs text-foreground/80 leading-relaxed font-sans bg-card border border-border p-8">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl text-foreground">1. Information We Collect</h2>
          <p>
            At FABRICO, we respect your privacy. When you browse our studio catalog or interact with our WhatsApp concierge, we collect minimal information necessary to deliver exceptional service, including your name, contact phone number, delivery address, and order selections.
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <h2 className="font-serif text-2xl text-foreground">2. WhatsApp Communications</h2>
          <p>
            All direct communications occur via secure, end-to-end encrypted WhatsApp messaging between yourself and our official concierge team. We never share your phone number or chat transcripts with unauthorized third parties.
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <h2 className="font-serif text-2xl text-foreground">3. Analytics & Cookies</h2>
          <p>
            Anonymous telemetry is used solely to understand trending pieces, improve category discovery, and optimize studio performance. No sensitive private data is exposed.
          </p>
        </div>
      </div>
    </main>
  );
}
