import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | FABRICO" },
      { name: "description", content: "Common questions about ordering, WhatsApp commerce, sizing, delivery, and fabrics at FABRICO." },
    ],
  }),
  component: FaqsPage,
});

function FaqsPage() {
  const waUrl = waLink(
    "923000000000",
    "Hello FABRICO, I have a question not covered in the FAQs."
  );

  const faqs = [
    {
      q: "How does ordering on WhatsApp work?",
      a: "Browse our studio catalog, select your size and pieces, and add them to your shopping bag. When you tap 'Proceed to WhatsApp Order', a complete summary message is created. Our concierge verifies availability, custom requests, and delivery details directly in chat before confirming.",
    },
    {
      q: "Do I need to create an account to order?",
      a: "No account registration is required. You can browse freely and place orders via WhatsApp in seconds.",
    },
    {
      q: "What payment methods are supported in Pakistan?",
      a: "We support Cash on Delivery (COD) across Pakistan, as well as direct Online Bank Transfer (IBFT), Raast, JazzCash, and Nayapay.",
    },
    {
      q: "Can I customize the sizing or lengths?",
      a: "Yes. For select ready-to-wear and unstitched collections, our master tailors can accommodate custom shirt lengths, sleeve variations, and trouser adjustments. Inquire with our stylist on WhatsApp.",
    },
    {
      q: "How long does delivery take?",
      a: "Ready-to-wear and unstitched orders are delivered within 2–4 working days nationwide via TCS and Leopards Courier. Formal bespoke orders require 7–14 working days.",
    },
    {
      q: "Are the fabrics pure and authentic?",
      a: "Absolutely. We use 100% pure raw silks, high-grade combed lawn, genuine organza, and artisanal hand-spun karandi. Each product description states the exact fabric breakdown.",
    },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <p className="eyebrow text-gold text-[0.65rem] tracking-[0.25em]">ASSISTANCE</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-foreground font-normal">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          Everything you need to know about our collections, sizing, payments, and WhatsApp ordering experience.
        </p>
      </div>

      <div className="bg-card border border-border p-6 sm:p-8">
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border">
              <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-left py-4 hover:text-gold">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="text-center space-y-4 pt-4">
        <p className="font-serif text-2xl text-foreground">Still have questions?</p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-lux bg-[#25D366] text-white hover:bg-[#1EBE5D] border-none text-xs inline-flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4 fill-white" />
          <span>Chat with FABRICO Stylist</span>
        </a>
      </div>
    </main>
  );
}
