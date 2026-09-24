import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Ruler, HelpCircle, MessageCircle } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/size-guide")({
  head: () => ({
    meta: [
      { title: "Size & Fit Guide | FABRICO Style Studio" },
      { name: "description", content: "Complete sizing charts and measuring guidelines for FABRICO ready-to-wear and unstitched collections." },
    ],
  }),
  component: SizeGuidePage,
});

function SizeGuidePage() {
  const [unit, setUnit] = useState<"inches" | "cm">("inches");

  const rows = unit === "inches" ? [
    { size: "XS", bust: "32", waist: "26", hip: "35", length: "38", shoulder: "14" },
    { size: "S", bust: "34", waist: "28", hip: "37", length: "39", shoulder: "14.5" },
    { size: "M", bust: "36", waist: "30", hip: "39", length: "40", shoulder: "15" },
    { size: "L", bust: "39", waist: "33", hip: "42", length: "41", shoulder: "15.5" },
    { size: "XL", bust: "42", waist: "36", hip: "45", length: "42", shoulder: "16" },
  ] : [
    { size: "XS", bust: "81", waist: "66", hip: "89", length: "96", shoulder: "35.5" },
    { size: "S", bust: "86", waist: "71", hip: "94", length: "99", shoulder: "37" },
    { size: "M", bust: "91", waist: "76", hip: "99", length: "101", shoulder: "38" },
    { size: "L", bust: "99", waist: "84", hip: "107", length: "104", shoulder: "39.5" },
    { size: "XL", bust: "107", waist: "91", hip: "114", length: "106", shoulder: "40.5" },
  ];

  const waUrl = waLink(
    "923000000000",
    "Hello FABRICO, I need assistance choosing the right size for my measurements."
  );

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <p className="eyebrow text-gold text-[0.65rem] tracking-[0.25em]">FIT & PROPORTION</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-foreground font-normal">
          Size & Measurement Guide
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          Ensure your garments fit with graceful poise. Compare your body measurements against our standard chart below.
        </p>
      </div>

      {/* Unit Switcher & Chart */}
      <div className="bg-card border border-border p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-2xl text-foreground">Standard Garment Dimensions</h2>
          <div className="flex border border-border bg-muted/40 p-0.5 text-xs">
            <button
              onClick={() => setUnit("inches")}
              className={`px-3 py-1 font-medium transition-colors ${
                unit === "inches" ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit("cm")}
              className={`px-3 py-1 font-medium transition-colors ${
                unit === "cm" ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              CM
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-border">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted text-muted-foreground uppercase tracking-wider text-[0.65rem] border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold text-foreground">Size</th>
                <th className="px-4 py-3">Bust</th>
                <th className="px-4 py-3">Waist</th>
                <th className="px-4 py-3">Hip</th>
                <th className="px-4 py-3">Shoulder</th>
                <th className="px-4 py-3">Shirt Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((r) => (
                <tr key={r.size} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold text-foreground">{r.size}</td>
                  <td className="px-4 py-3">{r.bust} {unit === "inches" ? "in" : "cm"}</td>
                  <td className="px-4 py-3">{r.waist} {unit === "inches" ? "in" : "cm"}</td>
                  <td className="px-4 py-3">{r.hip} {unit === "inches" ? "in" : "cm"}</td>
                  <td className="px-4 py-3">{r.shoulder} {unit === "inches" ? "in" : "cm"}</td>
                  <td className="px-4 py-3">{r.length} {unit === "inches" ? "in" : "cm"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to Measure */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 bg-muted/30 border border-border/60 space-y-3">
          <h3 className="font-serif text-xl text-foreground">Measuring Tips</h3>
          <ul className="space-y-2 text-xs text-muted-foreground list-disc list-inside leading-relaxed">
            <li><strong>Bust:</strong> Measure around the fullest circumference, keeping the tape straight across your back.</li>
            <li><strong>Waist:</strong> Measure at your natural waistline, where your body bends.</li>
            <li><strong>Hips:</strong> Stand with feet together and measure around the fullest point of the hips.</li>
          </ul>
        </div>

        <div className="p-6 bg-muted/30 border border-border/60 space-y-3">
          <h3 className="font-serif text-xl text-foreground">Custom Alterations</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Need custom sleeves, custom length, or special trouser alterations? Our styling team offers bespoke modifications on WhatsApp prior to stitching.
          </p>
          <div className="pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-lux bg-[#25D366] text-white hover:bg-[#1EBE5D] border-none text-xs flex items-center gap-2"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-white" />
              <span>Ask a Stylist</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
