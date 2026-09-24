import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { waLink } from "@/lib/whatsapp";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Concierge Assistance | FABRICO" },
      { name: "description", content: "Reach our studio styling team via WhatsApp, phone, or message." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Thank you. Our concierge will respond promptly.");
  };

  const waUrl = waLink(
    "923000000000",
    "Hello FABRICO, I would like assistance with an inquiry or order."
  );

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-8 py-16 space-y-16">
      <div className="text-center space-y-3">
        <p className="eyebrow text-gold text-[0.65rem] tracking-[0.25em]">CLIENT SERVICES</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-foreground font-normal">
          Contact Studio Concierge
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          We are here to assist with product inquiries, sizing advice, order status, and bespoke styling requests.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-10">
        {/* Contact info channels (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-card border border-border p-6 space-y-6">
            <h3 className="font-serif text-2xl text-foreground">Direct Channels</h3>

            <div className="space-y-4 text-xs">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors"
              >
                <MessageCircle className="h-5 w-5 text-[#25D366] fill-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">WhatsApp Concierge (Fastest)</h4>
                  <p className="text-muted-foreground text-[0.7rem] mt-0.5">Mon–Sat: 10:00 AM – 8:00 PM PKT</p>
                  <span className="text-[#25D366] font-semibold text-[0.75rem] mt-1 inline-block">+92 300 0000000</span>
                </div>
              </a>

              <div className="flex items-start gap-3 p-3 border border-border">
                <Mail className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Email Inquiries</h4>
                  <p className="text-muted-foreground text-[0.7rem] mt-0.5">support@fabricostyle.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border border-border">
                <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Design Studio</h4>
                  <p className="text-muted-foreground text-[0.7rem] mt-0.5">Gulberg III, Lahore, Pakistan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message form (7 cols) */}
        <div className="md:col-span-7 bg-card border border-border p-6 sm:p-8 space-y-6">
          <h3 className="font-serif text-2xl text-foreground">Send a Message</h3>

          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-[#25D366] mx-auto" />
              <p className="font-serif text-2xl text-foreground">Message Received</p>
              <p className="text-xs text-muted-foreground">
                Our team has received your note and will be in touch shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="eyebrow text-[0.62rem] text-foreground">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground transition-colors font-sans"
                    placeholder="e.g. Ayesha Khan"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="eyebrow text-[0.62rem] text-foreground">WhatsApp / Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground transition-colors font-sans"
                    placeholder="0300 1234567"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="eyebrow text-[0.62rem] text-foreground">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground transition-colors font-sans"
                  placeholder="name@domain.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="eyebrow text-[0.62rem] text-foreground">Message or Inquiry</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground transition-colors font-sans"
                  placeholder="Tell us about the design, size, or styling question you have..."
                />
              </div>

              <button type="submit" className="btn-lux w-full">
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
