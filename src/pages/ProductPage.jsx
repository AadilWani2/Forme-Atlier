import { lazy, Suspense, useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  Rotate3D,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { products } from "../data/products";

const MugViewer = lazy(() => import("../three/MugViewer"));
const ProductViewer = lazy(() => import("../three/ProductViewer"));

const COLOR_NAMES = {
  "#292929": "Charcoal Obsidian",
  "#F1EBDD": "Oatmeal Ceramic",
  "#7C8566": "Olive Earth",
  "#D7C4A3": "Warm Brass",
  "#C97960": "Terracotta Clay",
  "#E7E2D7": "Alabaster White",
  "#C8B69A": "Warm Tan Leather",
  "#FFFFFF": "Pure Studio White",
};

function ViewerFallback({ image, name }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-[#eeece5]">
      <img src={image} alt={name} className="h-full w-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-xs">
        <span className="rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-[#24241f] shadow-sm">
          Loading 3D Studio Preview…
        </span>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((item) => item.id === id);

  const [colorChoice, setColorChoice] = useState({ id: "", color: "" });
  const [viewMode, setViewMode] = useState("3d");
  const [activeTab, setActiveTab] = useState("specs");

  const selectedColor =
    colorChoice.id === id && colorChoice.color
      ? colorChoice.color
      : product?.colors?.[0] || "#F1EBDD";

  const setSelectedColor = (color) => setColorChoice({ id, color });

  if (!product) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-5xl px-5 py-24 text-center">
        <h1 className="font-display text-4xl">Product not found</h1>
        <p className="mt-2 text-sm text-[#85847b]">
          This piece might have been archived or moved.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#24241f] px-6 text-xs font-semibold uppercase tracking-[0.14em] text-white"
        >
          Return to shop
        </Link>
      </main>
    );
  }

  const isMug = product.id === "custom-mug";
  const colorName = COLOR_NAMES[selectedColor] || selectedColor;

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#85847b]">
        <Link to="/shop" className="hover:text-[#24241f] transition-colors">
          Collection
        </Link>
        <span>/</span>
        <span className="text-[#7c8566] font-medium">{product.category}</span>
        <span>/</span>
        <span className="truncate text-[#24241f]">{product.name}</span>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start md:gap-12 lg:gap-16">
        {/* Left Column: 3D Studio & Photo Switcher */}
        <div className="min-w-0">
          <div className="relative overflow-hidden rounded-md border border-black/[0.06] bg-[#eeece5] shadow-xs">
            {/* View Mode Pill Toggle */}
            <div className="absolute right-3.5 top-3.5 z-10 flex items-center gap-1 rounded-full border border-black/[0.06] bg-white/85 p-1 shadow-sm backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide transition-all ${
                  viewMode === "3d"
                    ? "bg-[#24241f] text-white shadow-xs"
                    : "text-[#686b5c] hover:text-[#24241f]"
                }`}
              >
                <Rotate3D size={13} className={viewMode === "3d" ? "text-white" : "text-[#7c8566]"} />
                <span>3D Studio</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("photo")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide transition-all ${
                  viewMode === "photo"
                    ? "bg-[#24241f] text-white shadow-xs"
                    : "text-[#686b5c] hover:text-[#24241f]"
                }`}
              >
                <Eye size={13} />
                <span>Photo</span>
              </button>
            </div>

            {viewMode === "3d" ? (
              <Suspense
                fallback={<ViewerFallback image={product.image} name={product.name} />}
              >
                <div className="relative aspect-[4/4.2] max-h-[580px] overflow-hidden">
                  {isMug ? (
                    <MugViewer mugColor={selectedColor} finish="glossy" />
                  ) : (
                    <ProductViewer
                      productId={product.id}
                      color={selectedColor}
                      finish="glossy"
                    />
                  )}
                </div>
              </Suspense>
            ) : (
              <img
                src={product.image}
                alt={product.name}
                fetchPriority="high"
                className="aspect-[4/4.2] max-h-[580px] w-full object-cover"
              />
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-[#85847b]">
            <span className="flex items-center gap-1.5">
              <Rotate3D size={13} className="text-[#7c8566]" />
              <span>Drag to rotate 360° · Scroll to zoom</span>
            </span>
            <span>Realistic PBR Shader</span>
          </div>
        </div>

        {/* Right Column: Details & Customization CTAs */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7c8566]">
              {product.category}
            </span>
            {product.badge && (
              <span className="rounded-full bg-[#24241f] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
                {product.badge}
              </span>
            )}
          </div>

          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-[#24241f] sm:text-4xl lg:text-5xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-bold tabular-nums text-[#24241f]">
              ₹{product.price}
            </span>
            <span className="text-xs text-[#85847b]">
              Inclusive of bespoke 3D personalization
            </span>
          </div>

          <p className="mt-5 text-sm leading-7 text-[#686b5c]">
            {product.description}
          </p>

          {/* Color Palette Selector */}
          <div className="mt-8 rounded-lg border border-black/[0.08] bg-white/60 p-5 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#24241f]">
                Palette: <span className="font-normal text-[#7c8566]">{colorName}</span>
              </p>
              <span className="text-[10px] font-medium tracking-[0.1em] text-[#7c8566]">
                Live in 3D
              </span>
            </div>

            <div className="mt-3.5 flex flex-wrap gap-3">
              {product.colors.map((color) => {
                const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    type="button"
                    title={COLOR_NAMES[color] || color}
                    onClick={() => {
                      setSelectedColor(color);
                      if (viewMode !== "3d") setViewMode("3d");
                    }}
                    className={`h-9 w-9 rounded-full border shadow-2xs transition-all ${
                      isSelected
                        ? "scale-110 border-[#24241f] ring-2 ring-[#24241f]/30 ring-offset-2"
                        : "border-black/20 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                );
              })}
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() =>
              navigate(
                `/customize/${product.id}?color=${encodeURIComponent(selectedColor)}`
              )
            }
            className="group mt-6 flex h-14 w-full items-center justify-between rounded-sm bg-[#24241f] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-md transition-all hover:bg-[#515449] active:scale-[0.99]"
          >
            <span className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-[#c8a858]" />
              <span>3D Customise and Buy</span>
            </span>
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </button>

          {/* Trust Value Badges */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-y border-black/[0.08] py-4 text-xs text-[#85847b]">
            <div className="flex items-center gap-2">
              <Check size={15} className="text-[#7c8566] shrink-0" />
              <span>Typography &amp; Image Wrap</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-[#7c8566] shrink-0" />
              <span>Authentic Precision Materials</span>
            </div>
          </div>

          {/* Spec & Details Tabs */}
          <div className="mt-8">
            <div className="flex border-b border-black/10">
              {[
                { id: "specs", label: "Specifications" },
                { id: "craft", label: "Atelier Craft" },
                { id: "shipping", label: "Complimentary Delivery" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 pr-6 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-[#24241f] text-[#24241f]"
                      : "text-[#85847b] hover:text-[#24241f]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="py-4 text-xs leading-6 text-[#686b5c]">
              {activeTab === "specs" && (
                <p>
                  Built with industrial-grade PBR rendering models matching real dimensional tolerances.
                  Features high-density metallic components, precision surface textures, and UV mapping.
                </p>
              )}
              {activeTab === "craft" && (
                <p>
                  Every bespoke piece is inspected in our studio. We employ direct multi-layer sublimation
                  and laser-etching techniques to ensure lifetime durability without peeling.
                </p>
              )}
              {activeTab === "shipping" && (
                <div className="flex items-start gap-2">
                  <Truck size={16} className="text-[#7c8566] shrink-0 mt-0.5" />
                  <p>
                    Complimentary express tracked shipping on all customized studio orders.
                    Dispatched within 24 to 48 hours in luxury recycled bespoke packaging.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
