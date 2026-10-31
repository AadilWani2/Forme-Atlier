import { ArrowUpRight, Rotate3D, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col min-w-0 text-[#24241f] transition-all"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-[#eeece5] border border-black/[0.05] shadow-xs transition-shadow duration-500 group-hover:shadow-md">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />

        {/* Badge (NEW, LIMITED, etc.) */}
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-[#24241f] px-2.5 py-0.5 text-[9px] font-semibold tracking-[0.16em] uppercase text-white shadow-sm">
            {product.badge}
          </span>
        )}

        {/* 3D Interactive Indicator */}
        <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium tracking-[0.06em] text-[#24241f] shadow-xs backdrop-blur-md border border-black/[0.04]">
          <Rotate3D size={12} className="text-[#7c8566]" />
          <span>3D</span>
        </span>

        {/* Floating Explore Pill on Hover */}
        <span className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-white text-[#24241f] shadow-md opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={17} strokeWidth={1.8} />
        </span>
      </div>

      {/* Info Block */}
      <div className="flex items-start justify-between gap-3 pt-3.5">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#85847b]">
            {product.category}
          </p>
          <h3 className="mt-1 truncate font-display text-base font-medium tracking-tight text-[#24241f] group-hover:text-[#7c8566] transition-colors">
            {product.name}
          </h3>
        </div>

        <p className="shrink-0 text-sm font-semibold tabular-nums text-[#24241f]">
          ₹{product.price}
        </p>
      </div>

      {/* Palette Swatches */}
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {product.colors.map((color) => (
            <span
              key={color}
              title={color}
              className="h-3.5 w-3.5 rounded-full border border-black/15 shadow-2xs transition-transform hover:scale-125"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span className="flex items-center gap-1 text-[10px] text-[#7c8566] font-medium">
          <Sparkles size={10} />
          <span>3D Customise and Buy</span>
        </span>
      </div>
    </Link>
  );
}
