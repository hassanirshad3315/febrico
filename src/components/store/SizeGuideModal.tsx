import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MessageCircle, HelpCircle } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

let isSizeGuideOpen = false;
const sizeGuideListeners = new Set<() => void>();

export function openSizeGuide(open: boolean = true) {
  isSizeGuideOpen = open;
  sizeGuideListeners.forEach((l) => l());
}

export function SizeGuideModal({ whatsappNumber = "923000000000" }: { whatsappNumber?: string }) {
  const [open, setOpen] = useState(isSizeGuideOpen);
  const [unit, setUnit] = useState<"inches" | "cm">("inches");

  const toggleOpen = (val: boolean) => {
    isSizeGuideOpen = val;
    setOpen(val);
    sizeGuideListeners.forEach((l) => l());
  };

  const chartData = {
    inches: [
      { size: "XS", bust: "32", waist: "26", hip: "35", length: "38", shoulder: "14" },
      { size: "S", bust: "34", waist: "28", hip: "37", length: "39", shoulder: "14.5" },
      { size: "M", bust: "36", waist: "30", hip: "39", length: "40", shoulder: "15" },
      { size: "L", bust: "39", waist: "33", hip: "42", length: "41", shoulder: "15.5" },
      { size: "XL", bust: "42", waist: "36", hip: "45", length: "42", shoulder: "16" },
    ],
    cm: [
      { size: "XS", bust: "81", waist: "66", hip: "89", length: "96", shoulder: "35.5" },
      { size: "S", bust: "86", waist: "71", hip: "94", length: "99", shoulder: "37" },
      { size: "M", bust: "91", waist: "76", hip: "99", length: "101", shoulder: "38" },
      { size: "L", bust: "99", waist: "84", hip: "107", length: "104", shoulder: "39.5" },
      { size: "XL", bust: "107", waist: "91", hip: "114", length: "106", shoulder: "40.5" },
    ],
  };

  const rows = chartData[unit];

  const waUrl = waLink(
    whatsappNumber,
    "Hello FABRICO, I would like assistance with finding my exact size and measurements."
  );

  return (
    <Dialog open={open} onOpenChange={toggleOpen}>
      <DialogContent className="max-w-2xl p-6 sm:p-8 rounded-none border border-border bg-card shadow-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-serif text-2xl sm:text-3xl text-foreground font-normal">
                Size & Fit Guide
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Standard Pakistani sizing chart for ready-to-wear kurtas, suits, and dresses.
              </DialogDescription>
            </div>

            {/* Unit Toggle */}
            <div className="flex border border-border bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setUnit("inches")}
                className={`px-3 py-1 font-medium transition-colors ${
                  unit === "inches" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Inches
              </button>
              <button
                type="button"
                onClick={() => setUnit("cm")}
                className={`px-3 py-1 font-medium transition-colors ${
                  unit === "cm" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                CM
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted text-muted-foreground uppercase tracking-wider text-[0.65rem] border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Size</th>
                  <th className="px-4 py-3">Bust</th>
                  <th className="px-4 py-3">Waist</th>
                  <th className="px-4 py-3">Hip</th>
                  <th className="px-4 py-3">Shoulder</th>
                  <th className="px-4 py-3">Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((r) => (
                  <tr key={r.size} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-semibold text-foreground">{r.size}</td>
                    <td className="px-4 py-2.5">{r.bust} {unit === "inches" ? 'in' : 'cm'}</td>
                    <td className="px-4 py-2.5">{r.waist} {unit === "inches" ? 'in' : 'cm'}</td>
                    <td className="px-4 py-2.5">{r.hip} {unit === "inches" ? 'in' : 'cm'}</td>
                    <td className="px-4 py-2.5">{r.shoulder} {unit === "inches" ? 'in' : 'cm'}</td>
                    <td className="px-4 py-2.5">{r.length} {unit === "inches" ? 'in' : 'cm'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How to Measure Guidelines */}
          <div className="bg-muted/40 p-4 border border-border/60 space-y-2 text-xs">
            <p className="eyebrow text-[0.65rem] text-foreground font-semibold flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-gold" />
              Measuring Instructions
            </p>
            <ul className="space-y-1 text-muted-foreground text-[0.72rem] list-disc list-inside">
              <li><strong className="text-foreground">Bust:</strong> Measure around the fullest part of the chest holding tape comfortably loose.</li>
              <li><strong className="text-foreground">Waist:</strong> Measure around the narrowest natural waistline.</li>
              <li><strong className="text-foreground">Hip:</strong> Stand with feet together and measure around the widest part of the hips.</li>
              <li><strong className="text-foreground">Unstitched Fabrics:</strong> Includes standard fabric cuts (3.0m shirt, 2.5m dupatta, 2.25m trouser).</li>
            </ul>
          </div>

          {/* Concierge Help */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-border">
            <p className="text-muted-foreground text-[0.72rem]">
              Need custom alterations or custom size advice?
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-lux flex items-center gap-2 bg-[#25D366] text-white hover:bg-[#1EBE5D] border-none text-[0.65rem] py-2 px-4 h-9"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-white" />
              <span>Ask Stylist on WhatsApp</span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
