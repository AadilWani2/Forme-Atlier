import { ArrowRight, Rotate3D, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#24241f] text-[#faf9f6] border-t border-black/10">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-16 sm:px-8 sm:pt-20 lg:px-12">
        <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c8a858]">
              <Sparkles size={12} />
              <span>Forme Atelier Bespoke</span>
            </div>
            <p className="mt-4 font-display text-4xl font-extrabold tracking-[-0.07em] sm:text-6xl text-[#eeece5]">
              Objects, made personal.
            </p>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
              Thoughtful everyday pieces elevated through physical-accurate 3D
              customization, tactile material finishes, and precision individual
              detailing.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/customize/custom-bottle"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white hover:border-white/40 hover:bg-white/20 transition-all"
              >
                <Rotate3D size={14} className="text-[#c8a858]" />
                <span>3D Customise and Buy</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:justify-items-end">
            <div>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c8a858]">
                Collection
              </p>
              <div className="flex flex-col gap-3 text-xs tracking-wide">
                <Link to="/shop" className="text-white/70 hover:text-white transition-colors">
                  Shop All Pieces
                </Link>
                <Link
                  to="/shop?category=Drinkware"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Drinkware Vessels
                </Link>
                <Link
                  to="/shop?category=Stationery"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Stationery &amp; Diary
                </Link>
                <Link
                  to="/shop?category=Accessories"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Everyday Accessories
                </Link>
                <Link to="/cart" className="text-white/70 hover:text-white transition-colors">
                  Shopping Bag
                </Link>
              </div>
            </div>

            <div>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c8a858]">
                Studio Standards
              </p>
              <div className="flex flex-col gap-3 text-xs tracking-wide text-white/60">
                <span>Real-Time PBR Shaders</span>
                <span>Zero-Waste On-Demand</span>
                <span>Complimentary Delivery</span>
                <span>Insured Studio Packaging</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-[10px] tracking-[0.14em] uppercase text-white/45 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} FORME STUDIO ATELIER. ALL RIGHTS RESERVED.</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7c8566]" />
            <span>AUTHENTIC REAL-TIME 3D CONFIGURATION</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
