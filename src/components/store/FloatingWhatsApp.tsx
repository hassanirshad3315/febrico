import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";

export function FloatingWhatsApp({
  whatsappNumber = "923000000000",
}: {
  whatsappNumber?: string;
}) {
  const message = "Hello FABRICO, I would like to enquire about your luxury collection and ordering.";
  const url = waLink(whatsappNumber, message);

  const handleClick = () => {
    track("whatsapp_click", { source: "floating" });
  };

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-6 z-30 group">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-3 rounded-full shadow-xl transition-all duration-300 hover:scale-105"
        aria-label="Chat with FABRICO Concierge on WhatsApp"
      >
        <MessageCircle className="h-5 w-5 fill-white" />
        <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
          Order on WhatsApp
        </span>
      </a>
    </div>
  );
}
