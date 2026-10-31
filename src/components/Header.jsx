import { Menu, ShoppingBag, Sparkles, X, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

export default function Header({ cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navClass = ({ isActive }) =>
    `relative py-1 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
      isActive
        ? "text-[#24241f] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#7c8566]"
        : "text-[#85847b] hover:text-[#24241f]"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[#faf9f6]/92 backdrop-blur-xl border-b border-black/[0.06] transition-all">
      {/* Editorial Announcement Bar */}
      <div className="bg-[#24241f] px-3 py-1.5 text-center text-[10px] font-medium uppercase tracking-[0.14em] sm:tracking-[0.2em] text-[#eeece5] overflow-hidden">
        <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-2 sm:gap-4 truncate">
          <Sparkles size={11} className="text-[#c8a858] shrink-0" />
          <span className="sm:hidden truncate">Real-time 3D Customization Studio</span>
          <span className="hidden sm:inline">Real-time 3D Customization Studio · Handcrafted Precision</span>
          <span className="hidden sm:inline opacity-40">/</span>
          <span className="hidden sm:inline text-white/70">Bespoke Monogramming</span>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:h-[72px] sm:px-8 lg:px-12">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="group flex flex-col leading-none transition-transform active:scale-[0.98]"
        >
          <span className="font-display text-xl font-extrabold tracking-[-0.08em] sm:text-2xl text-[#24241f]">
            FORME
          </span>
          <span className="mt-1 text-[8px] font-semibold tracking-[0.38em] text-[#7c8566] transition-colors group-hover:text-[#24241f]">
            ATELIER
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>
          <NavLink to="/shop" className={navClass}>
            Collection
          </NavLink>
          <NavLink
            to="/shop?category=Drinkware"
            className={() =>
              `relative py-1 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
                location.search.includes("Drinkware")
                  ? "text-[#24241f] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#7c8566]"
                  : "text-[#85847b] hover:text-[#24241f]"
              }`
            }
          >
            Drinkware
          </NavLink>
          <NavLink
            to="/shop?category=Stationery"
            className={() =>
              `relative py-1 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
                location.search.includes("Stationery")
                  ? "text-[#24241f] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#7c8566]"
                  : "text-[#85847b] hover:text-[#24241f]"
              }`
            }
          >
            Stationery
          </NavLink>
          <NavLink
            to="/customize/custom-bottle"
            className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white/60 px-3.5 py-1 text-[11px] font-medium tracking-[0.12em] uppercase text-[#24241f] hover:border-[#7c8566] hover:bg-white shadow-xs transition-all"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#7c8566] animate-pulse" />
            3D Customise and Buy
          </NavLink>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Link
            to="/cart"
            aria-label={`Shopping bag with ${cartCount} items`}
            className="relative flex h-10 items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-3.5 py-1 text-xs font-medium text-[#24241f] shadow-xs transition-all hover:border-black/25 hover:bg-white"
          >
            <ShoppingBag size={16} strokeWidth={1.8} />
            <span className="hidden sm:inline">Bag</span>
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold transition-transform ${
                cartCount > 0
                  ? "bg-[#24241f] text-white scale-100"
                  : "bg-[#dce1ce] text-[#24241f]"
              }`}
            >
              {cartCount}
            </span>
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white/70 text-[#24241f] shadow-xs transition-colors hover:border-black/25 md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Luxury Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-[calc(4rem+26px)] bottom-0 z-50 flex flex-col justify-between bg-[#faf9f6]/98 backdrop-blur-2xl px-6 py-8 md:hidden overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7c8566] pb-3">
              Navigation
            </p>
            {[
              { label: "Home", to: "/" },
              { label: "Full Collection", to: "/shop" },
              { label: "Drinkware Essentials", to: "/shop?category=Drinkware" },
              { label: "Stationery & Journal", to: "/shop?category=Stationery" },
              { label: "Accessories & Keychains", to: "/shop?category=Accessories" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between border-b border-black/[0.06] py-4 text-sm uppercase tracking-[0.16em] font-medium text-[#24241f] active:text-[#7c8566]"
              >
                <span>{item.label}</span>
                <ArrowRight size={15} className="text-[#85847b]" />
              </Link>
            ))}
          </div>

          <div className="mt-8 space-y-4 pt-6 border-t border-black/[0.08]">
            <Link
              to="/customize/custom-bottle"
              onClick={() => setMenuOpen(false)}
              className="flex h-13 w-full items-center justify-center gap-2.5 rounded-sm bg-[#24241f] text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-md active:bg-[#515449]"
            >
              <Sparkles size={14} className="text-[#c8a858]" />
              3D Customise and Buy
            </Link>

            <div className="flex items-center justify-between text-[10px] tracking-[0.14em] uppercase text-[#85847b]">
              <span>Complimentary Personalization</span>
              <span>Made Just For You</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
