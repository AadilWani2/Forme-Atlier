import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Layers,
  Maximize2,
  Palette,
  Pipette,
  Plus,
  Rotate3D,
  ShoppingBag,
  Sparkles,
  Type,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { products } from "../data/products";
import { useCart } from "../hooks/useCart.jsx";
import {
  FONT_OPTIONS,
  TEXT_COLOR_PALETTE,
  TEXT_STYLE_OPTIONS,
  TEXT_WEIGHT_OPTIONS,
  TEXT_TRANSFORM_OPTIONS,
} from "../constants/textOptions";

const MugViewer = lazy(() => import("../three/MugViewer"));
const ProductViewer = lazy(() => import("../three/ProductViewer"));

const mugColors = [
  { name: "Ivory", value: "#F1EBDD" },
  { name: "Olive", value: "#7C8566" },
  { name: "Terracotta", value: "#C97960" },
  { name: "Charcoal", value: "#292929" },
  { name: "Pink", value: "#DCA6A1" },
  { name: "Sky Blue", value: "#A9C8D8" },
  { name: "White", value: "#FFFFFF" },
  { name: "Navy", value: "#263B59" },
];

function Swatches({ label, value, options, onChange }) {
  const currentOption = options.find(
    (item) => item.value.toLowerCase() === (value || "").toLowerCase()
  );
  const displayName = currentOption?.name ?? "Custom Tone";

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#24241f]">{label}</h2>
          <p className="mt-0.5 text-xs text-[#7C8566] font-medium">{displayName}</p>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="product-color-custom"
            className="relative flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-black/15 bg-white px-2.5 text-[11px] font-medium shadow-xs transition hover:border-[#7C8566]"
            title="Pick custom color"
          >
            <input
              id="product-color-custom"
              type="color"
              value={value?.startsWith("#") ? value : "#FFFFFF"}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            <span
              className="h-3.5 w-3.5 rounded-full border border-black/20"
              style={{ backgroundColor: value }}
            />
            <Pipette size={11} className="text-[#85847b]" />
            <span className="hidden sm:inline text-[#85847b]">Pipette</span>
          </label>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2.5">
        {options.map((option) => {
          const isSelected =
            (value || "").toLowerCase() === option.value.toLowerCase();
          return (
            <button
              key={option.value}
              type="button"
              title={option.name}
              aria-label={`${label}: ${option.name}`}
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-2xs transition-all ${
                isSelected
                  ? "scale-110 border-[#24241f] ring-2 ring-[#24241f]/30 ring-offset-2"
                  : "border-black/15 hover:scale-105"
              }`}
              style={{ backgroundColor: option.value }}
            >
              {isSelected && (
                <Check
                  size={15}
                  className={
                    ["#292929", "#7C8566", "#C97960", "#263B59"].includes(
                      option.value.toUpperCase()
                    )
                      ? "text-white"
                      : "text-[#24241f]"
                  }
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function Customizer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addItem, updateItem } = useCart();
  const product = products.find((item) => item.id === id);
  const searchParams = new URLSearchParams(window.location.search);
  const editId = searchParams.get("edit");
  const editingItem = items.find(
    (item) => item.cartId === editId && item.productId === id
  );
  const savedDesign = editingItem?.customization || {};

  const [mugColor, setMugColor] = useState(
    savedDesign.productColor ||
      savedDesign.mugColor ||
      searchParams.get("color") ||
      product?.colors?.[0] ||
      "#F1EBDD"
  );
  const [finish, setFinish] = useState(savedDesign.finish || "glossy");
  const initialText = savedDesign.personalText ?? searchParams.get("text") ?? "";
  const [textLines, setTextLines] = useState(() => {
    if (!initialText) return [""];
    const split = String(initialText).split(/\r?\n/);
    return split.length > 0 ? split : [""];
  });

  const personalText = useMemo(() => {
    return textLines.join("\n");
  }, [textLines]);

  const setPersonalText = (val) => {
    if (!val) {
      setTextLines([""]);
    } else {
      setTextLines(String(val).split(/\r?\n/));
    }
  };
  const [textColor, setTextColor] = useState(savedDesign.textColor || "#292929");
  const [textFont, setTextFont] = useState(savedDesign.textFont || "sans");
  const [textOrientation, setTextOrientation] = useState(
    () =>
      savedDesign.textOrientation ||
      (id === "custom-pen" ? "vertical" : "horizontal")
  );
  const [textStyle, setTextStyle] = useState(savedDesign.textStyle || "none");
  const [textWeight, setTextWeight] = useState(savedDesign.textWeight || "600");
  const [textTransform, setTextTransform] = useState(
    savedDesign.textTransform || "none"
  );
  const [textSpacing, setTextSpacing] = useState(savedDesign.textSpacing ?? 0);
  const [textSize, setTextSize] = useState(savedDesign.textSize || 76);
  const [textScale, setTextScale] = useState(savedDesign.textScale || 1);
  const [textPosition, setTextPosition] = useState(
    () =>
      savedDesign.textPosition || {
        x: 0.5,
        y: id === "custom-notebook" ? 0.25 : 0.5,
      }
  );

  const [imageScale, setImageScale] = useState(savedDesign.imageScale || 1);
  const [imagePosition, setImagePosition] = useState(
    () =>
      savedDesign.imagePosition || {
        x: 0.5,
        y: id === "custom-notebook" ? 0.28 : 0.5,
      }
  );
  const [imageMode, setImageMode] = useState(
    savedDesign.imageMode || (id === "custom-mug" || id === "custom-bottle" ? "full-wrap" : "decal")
  );
  const [imageFit, setImageFit] = useState(savedDesign.imageFit || "cover");
  const [imageOpacity, setImageOpacity] = useState(savedDesign.imageOpacity ?? 1);
  const [imageBlendMode, setImageBlendMode] = useState(
    savedDesign.imageBlendMode || "normal"
  );
  const [imageFilter, setImageFilter] = useState(savedDesign.imageFilter || "none");

  const [selectedDesign, setSelectedDesign] = useState("text");
  const [uploadedImage, setUploadedImage] = useState(
    () => savedDesign.uploadedImage || searchParams.get("image") || ""
  );
  const [uploadName, setUploadName] = useState(
    () =>
      savedDesign.uploadName ||
      (searchParams.get("image") ? searchParams.get("image").split("/").pop() : "")
  );
  const [uploadError, setUploadError] = useState("");
  const [activeStudioTab, setActiveStudioTab] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return "palette";
    }
    return "all";
  });
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);

  useEffect(() => {
    if (!uploadedImage || !uploadedImage.startsWith("blob:")) return undefined;
    return () => URL.revokeObjectURL(uploadedImage);
  }, [uploadedImage]);

  const colorOptions = useMemo(() => {
    const namedColors = {
      "#292929": "Charcoal",
      "#E7E2D7": "Alabaster",
      "#7C8566": "Olive",
      "#C97960": "Terracotta",
      "#C8B69A": "Sand",
      "#F1EBDD": "Ivory",
      "#D7C4A3": "Champagne",
      "#FFFFFF": "White",
      "#263B59": "Navy",
      "#DCA6A1": "Pink",
      "#A9C8D8": "Sky Blue",
    };
    const list = [
      ...(product?.colors || []).map((val) => ({
        name: namedColors[val.toUpperCase()] || val,
        value: val,
      })),
      ...mugColors,
    ];
    return list.filter(
      (item, index, self) =>
        self.findIndex(
          (other) => other.value.toLowerCase() === item.value.toLowerCase()
        ) === index
    );
  }, [product]);

  const samplePresets = useMemo(() => {
    if (product?.id === "custom-pen") {
      return ["Signed with Love", "Always Curious\nEst. 2026", "Make Ideas Happen", "J. Doe\nAtelier"];
    }
    if (product?.id === "custom-bottle") {
      return ["Stay Hydrated", "Form & Flow\nDaily Ritual", "Keep Moving", "Forme Studio\n001 / 100"];
    }
    if (product?.id === "custom-notebook") {
      return ["Personal Diary\nPrivate & Sacred", "Ideas & Notes", "Daily Reflections\n2026", "Chapter One"];
    }
    if (product?.id === "custom-keychain") {
      return ["Home Sweet Home", "Drive Safe\nWith Love", "Adventure Awaits", "F.S.\n2026"];
    }
    return ["Good Morning\nCoffee First", "Warm & Cozy", "Made for You", "Atelier Forme\nBespoke"];
  }, [product?.id]);

  if (!product) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-5xl px-5 py-24">
        <h1 className="font-display text-4xl">Product not found</h1>
        <Link to="/shop" className="mt-5 inline-block border-b border-black pb-1 text-sm">
          Return to shop
        </Link>
      </main>
    );
  }

  const isMug = product.id === "custom-mug";
  const isCylinder = product.id === "custom-mug" || product.id === "custom-bottle" || product.id === "custom-pen";

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Choose an image smaller than 8 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () =>
      setUploadError("This image could not be read. Please try another file.");
    reader.onload = () => {
      const source = new Image();
      source.onerror = () =>
        setUploadError("This image could not be processed. Please try another file.");
      source.onload = () => {
        const maxDimension = 1200;
        const ratio = Math.min(1, maxDimension / Math.max(source.width, source.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(source.width * ratio));
        canvas.height = Math.max(1, Math.round(source.height * ratio));
        const context = canvas.getContext("2d");
        if (!context) {
          setUploadError("Your browser could not process this image.");
          return;
        }
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/webp", 0.85);
        setUploadedImage(compressed);
        setUploadName(file.name);
        setUploadError("");
        setSelectedDesign("image");
      };
      source.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setUploadedImage("");
    setUploadName("");
    setUploadError("");
  }

  function handleAddToBag() {
    const cartId =
      globalThis.crypto?.randomUUID?.() ||
      `forme-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const cartItem = {
      cartId: editingItem?.cartId || cartId,
      productId: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      customization: {
        productColor: mugColor,
        mugColor,
        finish,
        personalText,
        textColor,
        textFont,
        textOrientation,
        textStyle,
        textWeight,
        textTransform,
        textSpacing,
        textSize,
        textScale,
        textPosition,
        uploadedImage,
        uploadName,
        imageScale,
        imagePosition,
        imageMode,
        imageFit,
        imageOpacity,
        imageBlendMode,
        imageFilter,
      },
    };
    if (editingItem) updateItem(editingItem.cartId, cartItem);
    else addItem(cartItem);
    navigate("/cart");
  }

  return (
    <main className="mx-auto max-w-[1440px] px-3 py-3 pb-28 sm:px-8 sm:py-8 sm:pb-28 lg:px-12 lg:pb-16">
      {/* Mobile Top Navigation & Summary */}
      <div className="flex sm:hidden items-center justify-between pb-3 border-b border-black/[0.06] mb-3">
        <Link
          to={`/product/${product.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#85847b] active:text-[#24241f]"
        >
          <ArrowLeft size={14} />
          <span>Product</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#24241f] truncate max-w-[160px]">{product.name}</span>
          <span className="rounded-full bg-[#24241f] px-2 py-0.5 text-[10px] font-bold text-white tabular-nums">₹{product.price}</span>
        </div>
      </div>

      {/* Desktop Breadcrumbs & Headline */}
      <Link
        to={`/product/${product.id}`}
        className="hidden sm:inline-flex items-center gap-2 text-xs text-[#85847b] hover:text-[#24241f]"
      >
        <ArrowLeft size={15} />
        Back to product
      </Link>

      <div className="hidden sm:block mb-5 mt-4 sm:mb-8 sm:mt-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#7C8566]">
          Make it personal
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-[-0.06em] sm:mt-3 sm:text-5xl">
          Make it yours.
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#85847b] sm:mt-3">
          Choose a color, add your custom text, or upload your own artwork.
        </p>
      </div>

      <div className="grid min-w-0 gap-5 pb-8 sm:gap-8 sm:pb-16 lg:grid-cols-[1.25fr_0.85fr] xl:grid-cols-[1.32fr_0.8fr] lg:gap-12">
        <div className="min-w-0 self-start lg:sticky lg:top-24">
          <div className="relative overflow-hidden rounded-lg border border-black/[0.07] bg-[#eeece5] shadow-xs">
            {/* Top 3D Interactive Badge */}
            <div className="absolute left-3 top-3 z-10 flex items-center gap-2 sm:left-3.5 sm:top-3.5">
              <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#24241f] shadow-xs backdrop-blur-md border border-black/[0.04] sm:px-3 sm:py-1 sm:text-[10px]">
                <Sparkles size={11} className="text-[#c8a858]" />
                <span>3D Canvas</span>
              </span>
            </div>

            {/* Mobile Expand / Compact toggle */}
            <button
              type="button"
              onClick={() => setIsCanvasExpanded((v) => !v)}
              aria-label={isCanvasExpanded ? "Compact 3D view" : "Expand 3D view"}
              className="sm:hidden absolute right-2.5 top-2.5 z-10 flex h-7 items-center gap-1 rounded-full bg-white/90 px-2.5 text-[9px] font-semibold uppercase tracking-wider text-[#24241f] shadow-xs backdrop-blur-md border border-black/10 transition active:scale-95"
            >
              <Maximize2 size={10} className={isCanvasExpanded ? "rotate-180" : ""} />
              <span>{isCanvasExpanded ? "Compact" : "Expand"}</span>
            </button>

            <Suspense
              fallback={
                <div className={`relative w-full ${isCanvasExpanded ? "h-[280px]" : "h-[175px]"} sm:h-[260px] lg:h-[380px] xl:h-[420px]`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain p-4"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-xs">
                    <span className="rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-[#24241f] shadow-sm">
                      Loading 3D preview…
                    </span>
                  </div>
                </div>
              }
            >
              <div className={`transition-all duration-300 w-full ${
                isCanvasExpanded
                  ? "h-[280px] sm:h-[360px]"
                  : "h-[175px] sm:h-[260px] md:h-[320px] lg:h-[380px] xl:h-[420px]"
              }`}>
                {isMug ? (
                  <MugViewer
                    mugColor={mugColor}
                    personalText={personalText}
                    textColor={textColor}
                    textSize={textSize}
                    textScale={textScale}
                    textPosition={textPosition}
                    textOrientation={textOrientation}
                    textFont={textFont}
                    textStyle={textStyle}
                    textWeight={textWeight}
                    textTransform={textTransform}
                    textSpacing={textSpacing}
                    uploadedImage={uploadedImage}
                    imageScale={imageScale}
                    imagePosition={imagePosition}
                    imageMode={imageMode}
                    imageFit={imageFit}
                    imageOpacity={imageOpacity}
                    imageBlendMode={imageBlendMode}
                    imageFilter={imageFilter}
                    finish={finish}
                    selectedDesign={selectedDesign}
                    onSelectDesign={setSelectedDesign}
                    onTextPositionChange={setTextPosition}
                    onTextScaleChange={setTextScale}
                    onImagePositionChange={setImagePosition}
                    onImageScaleChange={setImageScale}
                  />
                ) : (
                  <ProductViewer
                    productId={product.id}
                    color={mugColor}
                    finish={finish}
                    personalText={personalText}
                    textColor={textColor}
                    textFont={textFont}
                    textSize={textSize}
                    textScale={textScale}
                    textPosition={textPosition}
                    textOrientation={textOrientation}
                    textStyle={textStyle}
                    textWeight={textWeight}
                    textTransform={textTransform}
                    textSpacing={textSpacing}
                    uploadedImage={uploadedImage}
                    imageScale={imageScale}
                    imagePosition={imagePosition}
                    imageMode={imageMode}
                    imageFit={imageFit}
                    imageOpacity={imageOpacity}
                    imageBlendMode={imageBlendMode}
                    imageFilter={imageFilter}
                    selectedDesign={selectedDesign}
                    onSelectDesign={setSelectedDesign}
                    onTextPositionChange={setTextPosition}
                    onTextScaleChange={setTextScale}
                    onImagePositionChange={setImagePosition}
                    onImageScaleChange={setImageScale}
                  />
                )}
              </div>
            </Suspense>

            {/* Bottom floating rotation pill */}
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-center pointer-events-none">
              <span className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#686b5c] shadow-xs backdrop-blur-md border border-black/[0.04]">
                <Rotate3D size={12} className="text-[#7c8566]" />
                <span className="sm:hidden">Drag 360° · Pinch zoom</span>
                <span className="hidden sm:inline">Drag to rotate 360° · Scroll to zoom</span>
              </span>
            </div>
          </div>

          <p className="mt-2 text-center text-[11px] text-[#85847b]">
            ✨ Tip: You can drag your text directly across the 3D model.
          </p>
        </div>

        {/* Right Scrollable Panel */}
        <div className="min-w-0">
          <div className="hidden sm:flex items-start justify-between gap-4 border-b border-black/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7c8566]">
                  {product.category}
                </span>
                <span className="h-1 w-1 rounded-full bg-black/25" />
                <span className="text-[10px] text-[#85847b]">Bespoke 3D Edition</span>
              </div>
              <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-[#24241f] sm:text-3xl">
                {product.name}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold tabular-nums text-[#24241f]">₹{product.price}</p>
              <p className="text-[10px] text-[#7c8566]">Complimentary setup</p>
            </div>
          </div>

          {/* Studio Navigation Tabs */}
          <div className="mt-2 sm:mt-4 flex items-center gap-1.5 sm:gap-2 overflow-x-auto border-b border-black/10 pb-2.5 text-xs scrollbar-none">
            {[
              { id: "palette", label: "Palette & Finish", icon: Palette },
              {
                id: "text",
                label: "Add Text",
                icon: Type,
                active: Boolean(personalText?.trim()),
              },
              {
                id: "image",
                label: "Artwork & Wrap",
                icon: ImagePlus,
                active: Boolean(uploadedImage),
              },
              { id: "all", label: "All Options", icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeStudioTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveStudioTab(tab.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                    isSelected
                      ? "bg-[#24241f] text-white shadow-xs"
                      : "border border-black/10 bg-white/60 text-[#686b5c] hover:border-black/30 hover:bg-white"
                  }`}
                >
                  <Icon
                    size={13}
                    className={isSelected ? "text-white" : "text-[#7c8566]"}
                  />
                  <span>{tab.label}</span>
                  {tab.active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c8a858]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-6 py-5 sm:space-y-7 sm:py-7">
            {/* Color Swatches & Material Finish */}
            {(activeStudioTab === "all" || activeStudioTab === "palette") && (
              <div className="space-y-6">
                <Swatches
                  label={`${product.name} color`}
                  value={mugColor}
                  options={colorOptions}
                  onChange={setMugColor}
                />

                {/* Material Finish */}
                <section className="border-t border-black/10 pt-5">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#24241f]">
                    Material finish
                  </h2>
                  <p className="mt-1 text-xs text-[#85847b]">
                    Choose the surface texture and realistic sheen.
                  </p>

                  <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      {
                        id: "glossy",
                        name: "Glossy",
                        detail: "Smooth & reflective",
                      },
                      {
                        id: "matte",
                        name: "Matte",
                        detail: "Soft touch & low-shine",
                      },
                      {
                        id: "satin",
                        name: "Satin",
                        detail: "Subtle sheen",
                      },
                      {
                        id: "metallic",
                        name: "Metallic",
                        detail: "Reflective luster",
                      },
                      ...(isMug
                        ? [
                            {
                              id: "glass",
                              name: "Clear Glass",
                              detail: "Translucent finish",
                            },
                            {
                              id: "frosted",
                              name: "Frosted",
                              detail: "Soft frosted glass",
                            },
                          ]
                        : []),
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={finish === option.id}
                        onClick={() => setFinish(option.id)}
                        className={`rounded-md border p-3 text-left transition-all ${
                          finish === option.id
                            ? "border-[#24241f] bg-[#eeece5] ring-1 ring-[#24241f] shadow-xs"
                            : "border-black/10 bg-white/40 hover:border-black/30 hover:bg-white"
                        }`}
                      >
                        <span className="block text-xs font-semibold text-[#24241f]">
                          {option.name}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-[#85847b]">
                          {option.detail}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* Add Text Section */}
            {(activeStudioTab === "all" || activeStudioTab === "text") && (
              <section className={activeStudioTab === "all" ? "border-t border-black/10 pt-6" : ""}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type size={16} />
                    <h2 className="text-sm font-medium">Add Text</h2>
                    {textLines.filter((l) => l.trim()).length > 0 && (
                      <span className="rounded-full bg-[#eeece5] px-2 py-0.5 text-[10px] font-semibold text-[#7c8566]">
                        {textLines.filter((l) => l.trim()).length}{" "}
                        {textLines.filter((l) => l.trim()).length === 1 ? "line" : "lines"}
                      </span>
                    )}
                  </div>
                  {personalText.trim() && (
                    <button
                      type="button"
                      onClick={() => setPersonalText("")}
                      className="text-xs text-[#85847b] hover:text-[#24241f]"
                    >
                      Clear all text
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#85847b]">
                    <span>Text lines (rendered one after another)</span>
                    <span className="text-[10px] text-[#7c8566]">Up to 4 stacked lines</span>
                  </div>

                  {textLines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="flex h-11 w-8 shrink-0 items-center justify-center rounded-sm bg-[#eeece5] text-[10px] font-bold text-[#85847b] border border-black/10">
                        0{idx + 1}
                      </span>
                      <input
                        type="text"
                        maxLength={35}
                        value={line}
                        onChange={(e) => {
                          const next = [...textLines];
                          next[idx] = e.target.value;
                          setTextLines(next);
                        }}
                        onFocus={() => setSelectedDesign("text")}
                        placeholder={
                          idx === 0
                            ? "Line 1: Main text or name"
                            : idx === 1
                            ? "Line 2: Subtitle or year"
                            : idx === 2
                            ? "Line 3: Edition or location"
                            : `Line ${idx + 1}: Additional text`
                        }
                        className="h-11 flex-1 rounded-sm border border-black/15 bg-white/70 px-3.5 text-sm outline-none transition focus:border-[#7c8566] focus:bg-white"
                      />
                      {textLines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = textLines.filter((_, i) => i !== idx);
                            setTextLines(next.length > 0 ? next : [""]);
                          }}
                          title="Remove this line"
                          className="flex h-11 w-9 shrink-0 items-center justify-center rounded-sm border border-black/10 text-[#85847b] hover:border-black/30 hover:text-[#24241f] hover:bg-white"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}

                  {textLines.length < 4 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTextLines([...textLines, ""]);
                        setSelectedDesign("text");
                      }}
                      className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-dashed border-black/20 bg-white/40 text-xs font-semibold text-[#24241f] transition hover:border-[#7c8566] hover:bg-white hover:text-[#7c8566]"
                    >
                      <Plus size={14} />
                      <span>Add another text line (renders one after another)</span>
                    </button>
                  )}

                  {!personalText.trim() && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-[#85847b]">
                      <span>Try:</span>
                      {samplePresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setPersonalText(preset);
                            setSelectedDesign("text");
                          }}
                          className="rounded-full border border-black/10 bg-[#faf9f6] px-2.5 py-0.5 hover:border-black/30 hover:text-[#24241f] transition"
                        >
                          "{preset.replace("\n", " / ")}"
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              {/* Font Selection */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#24241f]">
                    Font style
                  </span>
                  <span className="text-[11px] text-[#85847b]">
                    {FONT_OPTIONS.find((f) => f.id === textFont)?.name}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => {
                        setTextFont(font.id);
                        setSelectedDesign("text");
                      }}
                      className={`group relative flex flex-col items-start justify-between rounded border p-2.5 text-left transition ${
                        textFont === font.id
                          ? "border-[#24241f] bg-[#eeece5] ring-1 ring-[#24241f]"
                          : "border-black/10 bg-white hover:border-black/30"
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-wider text-[#85847b]">
                        {font.category}
                      </span>
                      <span
                        className="mt-1 line-clamp-1 text-base text-[#24241f]"
                        style={{ fontFamily: font.family }}
                      >
                        {personalText.trim() || font.preview}
                      </span>
                      <span className="mt-1 text-[10px] text-[#85847b]">
                        {font.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color Selection */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#24241f]">
                    Text ink color
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#85847b]">
                      {TEXT_COLOR_PALETTE.find(
                        (c) => c.value.toLowerCase() === textColor.toLowerCase()
                      )?.label || textColor}
                    </span>
                    <label
                      htmlFor="text-color-custom"
                      className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-black/20 text-[10px] shadow-xs"
                      style={{ backgroundColor: textColor }}
                      title="Custom Color"
                    >
                      <input
                        id="text-color-custom"
                        type="color"
                        value={textColor}
                        onChange={(e) => {
                          setTextColor(e.target.value);
                          setSelectedDesign("text");
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-2">
                  {TEXT_COLOR_PALETTE.map((swatch) => {
                    const isSelected =
                      textColor.toLowerCase() === swatch.value.toLowerCase();
                    return (
                      <button
                        key={swatch.value}
                        type="button"
                        onClick={() => {
                          setTextColor(swatch.value);
                          setSelectedDesign("text");
                        }}
                        title={swatch.label}
                        className={`relative h-7 w-7 rounded-full border transition hover:scale-110 ${
                          swatch.border
                        } ${
                          isSelected
                            ? "ring-2 ring-[#24241f] ring-offset-2"
                            : ""
                        }`}
                        style={{ backgroundColor: swatch.value }}
                      >
                        {isSelected && (
                          <Check
                            size={13}
                            className={`absolute inset-0 m-auto ${
                              swatch.value === "#FFFFFF"
                                ? "text-black"
                                : "text-white"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Treatment & Effects */}
              <div className="mt-5">
                <span className="block text-xs font-medium text-[#24241f]">
                  Text style &amp; treatment
                </span>
                <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {TEXT_STYLE_OPTIONS.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        setTextStyle(style.id);
                        setSelectedDesign("text");
                      }}
                      className={`rounded border px-2.5 py-2 text-left transition ${
                        textStyle === style.id
                          ? "border-[#24241f] bg-[#eeece5] text-[#24241f]"
                          : "border-black/10 bg-white text-[#666] hover:border-black/30"
                      }`}
                    >
                      <span className="block text-xs font-medium">
                        {style.label}
                      </span>
                      <span className="mt-0.5 block line-clamp-1 text-[10px] text-[#85847b]">
                        {style.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography Formatting: Weight, Case, Spacing */}
              <div className="mt-5 rounded-sm border border-black/10 bg-[#faf9f6] p-3.5 space-y-3.5">
                {/* Text Orientation: Horizontal or Vertical */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="block text-[11px] font-medium text-[#24241f]">
                      Text orientation
                    </span>
                    <span className="text-[10px] text-[#85847b]">
                      {textOrientation === "vertical"
                        ? "Vertical (along length)"
                        : "Horizontal (across width)"}
                    </span>
                  </div>
                  <div className="mt-1.5 grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setTextOrientation("horizontal");
                        setSelectedDesign("text");
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded border py-1.5 font-medium transition ${
                        textOrientation === "horizontal"
                          ? "border-[#24241f] bg-white text-[#24241f] shadow-xs"
                          : "border-black/10 bg-transparent text-[#666] hover:border-black/30"
                      }`}
                    >
                      <ArrowRight size={13} />
                      <span>Horizontal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTextOrientation("vertical");
                        setSelectedDesign("text");
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded border py-1.5 font-medium transition ${
                        textOrientation === "vertical"
                          ? "border-[#24241f] bg-white text-[#24241f] shadow-xs"
                          : "border-black/10 bg-transparent text-[#666] hover:border-black/30"
                      }`}
                    >
                      <ArrowDown size={13} />
                      <span>Vertical</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] text-[#85847b]">
                      Font weight
                    </span>
                    <div className="mt-1.5 grid grid-cols-3 gap-1 text-xs">
                      {TEXT_WEIGHT_OPTIONS.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            setTextWeight(w.id);
                            setSelectedDesign("text");
                          }}
                          className={`rounded border py-1 text-center transition ${
                            textWeight === w.id
                              ? "border-[#24241f] bg-white font-medium text-[#24241f] shadow-xs"
                              : "border-black/10 text-[#666] hover:border-black/30"
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] text-[#85847b]">
                      Letter case
                    </span>
                    <div className="mt-1.5 grid grid-cols-3 gap-1 text-xs">
                      {TEXT_TRANSFORM_OPTIONS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setTextTransform(c.id);
                            setSelectedDesign("text");
                          }}
                          className={`rounded border py-1 text-center transition ${
                            textTransform === c.id
                              ? "border-[#24241f] bg-white font-medium text-[#24241f] shadow-xs"
                              : "border-black/10 text-[#666] hover:border-black/30"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] text-[#85847b]">
                    Letter spacing
                  </span>
                  <div className="mt-1.5 grid grid-cols-3 gap-1 text-xs">
                    {[
                      { label: "Normal", value: 0 },
                      { label: "Spaced", value: 2 },
                      { label: "Wide", value: 5 },
                    ].map((sp) => (
                      <button
                        key={sp.label}
                        type="button"
                        onClick={() => {
                          setTextSpacing(sp.value);
                          setSelectedDesign("text");
                        }}
                        className={`rounded border py-1 text-center transition ${
                          textSpacing === sp.value
                            ? "border-[#24241f] bg-white font-medium text-[#24241f] shadow-xs"
                            : "border-black/10 text-[#666] hover:border-black/30"
                        }`}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sizing & Positioning */}
              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="text-size" className="text-xs text-[#85847b]">
                      Font size
                    </label>
                    <span className="text-xs font-medium">{textSize}px</span>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1.5 text-xs">
                    {[
                      { label: "S", size: 48 },
                      { label: "M", size: 76 },
                      { label: "L", size: 112 },
                      { label: "XL", size: 156 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setTextSize(preset.size)}
                        className={`rounded border py-1 font-medium transition ${
                          Math.abs(textSize - preset.size) < 14
                            ? "border-[#24241f] bg-[#eeece5] text-[#24241f]"
                            : "border-black/10 bg-white text-[#666] hover:border-black/30"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <input
                    id="text-size"
                    type="range"
                    min="32"
                    max="180"
                    step="2"
                    value={textSize}
                    onChange={(event) => setTextSize(Number(event.target.value))}
                    className="mt-2.5 w-full accent-[#7C8566]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="text-scale" className="text-xs text-[#85847b]">
                      Scale text
                    </label>
                    <span className="text-xs font-medium">
                      {Math.round(textScale * 100)}%
                    </span>
                  </div>
                  <input
                    id="text-scale"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.05"
                    value={textScale}
                    onChange={(event) => {
                      setTextScale(Number(event.target.value));
                      setSelectedDesign("text");
                    }}
                    className="mt-2.5 w-full accent-[#7C8566]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#85847b]">
                      Horizontal alignment
                    </span>
                    <span className="text-[11px] text-[#85847b]">
                      {Math.round(textPosition.x * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs min-[420px]:grid-cols-4">
                    {(isCylinder
                      ? [
                          { label: "Front", x: 0.5 },
                          { label: "Right", x: 0.75 },
                          { label: "Back", x: 1.0 },
                          { label: "Left", x: 0.25 },
                        ]
                      : [
                          { label: "Left", x: 0.25 },
                          { label: "Center", x: 0.5 },
                          { label: "Right", x: 0.75 },
                          { label: "Reset", x: 0.5 },
                        ]
                    ).map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setTextPosition((prev) => ({ ...prev, x: preset.x }));
                          setSelectedDesign("text");
                        }}
                        className={`rounded border py-1.5 font-medium transition ${
                          Math.abs(textPosition.x - preset.x) < 0.08
                            ? "border-[#24241f] bg-[#eeece5] text-[#24241f]"
                            : "border-black/10 bg-transparent text-[#666] hover:border-black/30"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <input
                    id="text-pos-x"
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={textPosition.x}
                    onChange={(e) =>
                      setTextPosition((prev) => ({
                        ...prev,
                        x: Number(e.target.value),
                      }))
                    }
                    className="mt-2 w-full accent-[#7C8566]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#85847b]">
                      Vertical position
                    </span>
                    <span className="text-[11px] text-[#85847b]">
                      {Math.round(textPosition.y * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5 text-xs">
                    {[
                      { label: "Top", y: 0.25 },
                      { label: "Center", y: 0.5 },
                      { label: "Bottom", y: 0.75 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setTextPosition((prev) => ({ ...prev, y: preset.y }));
                          setSelectedDesign("text");
                        }}
                        className={`rounded border py-1.5 font-medium transition ${
                          Math.abs(textPosition.y - preset.y) < 0.08
                            ? "border-[#24241f] bg-[#eeece5] text-[#24241f]"
                            : "border-black/10 bg-transparent text-[#666] hover:border-black/30"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <input
                    id="text-pos-y"
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.02"
                    value={textPosition.y}
                    onChange={(e) =>
                      setTextPosition((prev) => ({
                        ...prev,
                        y: Number(e.target.value),
                      }))
                    }
                    className="mt-2 w-full accent-[#7C8566]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTextPosition({
                        x: 0.5,
                        y: id === "custom-notebook" ? 0.25 : 0.5,
                      });
                      setTextScale(1);
                      setTextSize(64);
                      setTextStyle("none");
                      setTextWeight("600");
                      setTextSpacing(0);
                      setTextTransform("none");
                    }}
                    className="text-xs text-[#85847b] underline underline-offset-4 hover:text-[#24241f]"
                  >
                    Reset text layout
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Photo / Artwork Section */}
          {(activeStudioTab === "all" || activeStudioTab === "image") && (
            <section className={activeStudioTab === "all" ? "border-t border-black/10 pt-6" : ""}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImagePlus size={17} />
                  <h2 className="text-sm font-medium">Add artwork or logo</h2>
                </div>
                {uploadedImage && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-xs text-[#85847b] underline underline-offset-4 hover:text-[#24241f]"
                  >
                    Remove
                  </button>
                )}
              </div>

              <label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-black/25 px-4 py-5 text-center transition hover:border-[#7C8566]">
                <ImagePlus size={21} className="text-[#7C8566]" />
                <span className="mt-2 text-sm font-medium">
                  Choose a photo, graphic, or logo
                </span>
                <span className="mt-1 text-xs text-[#85847b]">
                  PNG, JPG, or WebP · Up to 8 MB
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageUpload}
                  onClick={() => setSelectedDesign("image")}
                  className="sr-only"
                />
              </label>

              {!uploadedImage && (
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedImage("/sample_photo.png");
                      setUploadName("sunset_botanical_wrap.png");
                      setImageMode(isCylinder ? "full-wrap" : "decal");
                      setSelectedDesign("image");
                    }}
                    className="text-xs font-medium text-[#7C8566] underline underline-offset-4 hover:text-[#515449]"
                  >
                    Or try sample botanical artwork
                  </button>
                </div>
              )}

              {uploadError && (
                <p role="alert" className="mt-2 text-xs text-red-700">
                  {uploadError}
                </p>
              )}

              {uploadedImage && (
                <div className="mt-3 flex items-center gap-3 border border-black/10 p-3">
                  <img
                    src={uploadedImage}
                    alt="Your uploaded design"
                    className="h-14 w-14 rounded-sm object-contain"
                  />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium">
                    {uploadName}
                  </span>
                  <button
                    type="button"
                    onClick={removeImage}
                    aria-label="Remove uploaded image"
                    className="p-2 text-[#85847b] hover:text-[#24241f]"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {uploadedImage && (
                <div className="mt-4 space-y-5">
                  {/* Coverage Mode Selection */}
                  <div>
                    <span className="block text-xs font-medium text-[#24241f]">
                      Artwork placement mode
                    </span>
                    <div className="mt-2 grid grid-cols-3 gap-1.5 text-xs">
                      {[
                        { id: "full-wrap", label: isCylinder ? "360° Wrap" : "Full Bleed" },
                        { id: "decal", label: "Placed Decal" },
                        { id: "repeat", label: "Pattern Tile" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            setImageMode(mode.id);
                            setSelectedDesign("image");
                          }}
                          className={`rounded border py-2 font-medium transition ${
                            imageMode === mode.id
                              ? "border-[#24241f] bg-[#eeece5] text-[#24241f]"
                              : "border-black/10 bg-transparent text-[#666] hover:border-black/30"
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode Specific Controls */}
                  {imageMode === "full-wrap" && (
                    <div className="space-y-4 rounded-sm border border-black/10 bg-[#faf9f6] p-3.5">
                      <div>
                        <span className="text-xs text-[#85847b]">
                          Wrap fit style
                        </span>
                        <div className="mt-2 grid grid-cols-3 gap-1.5 text-xs">
                          {[
                            { id: "cover", label: "Cover" },
                            { id: "contain", label: "Fit" },
                            { id: "stretch", label: "Stretch" },
                          ].map((fit) => (
                            <button
                              key={fit.id}
                              type="button"
                              onClick={() => {
                                setImageFit(fit.id);
                                setSelectedDesign("image");
                              }}
                              className={`rounded border py-1.5 transition ${
                                imageFit === fit.id
                                  ? "border-[#24241f] bg-white font-medium text-[#24241f] shadow-xs"
                                  : "border-black/10 text-[#666] hover:border-black/30"
                              }`}
                            >
                              {fit.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Zoom / Scale Wrap */}
                      <div>
                        <div className="flex items-center justify-between">
                          <label htmlFor="wrap-scale" className="text-xs text-[#85847b]">
                            Zoom wrap image
                          </label>
                          <span className="text-xs font-medium">
                            {Math.round(imageScale * 100)}%
                          </span>
                        </div>
                        <input
                          id="wrap-scale"
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.05"
                          value={imageScale}
                          onChange={(e) => {
                            setImageScale(Number(e.target.value));
                            setSelectedDesign("image");
                          }}
                          className="mt-2.5 w-full accent-[#7C8566]"
                        />
                      </div>

                      {/* Vertical position / Framing */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#85847b]">
                            Vertical position
                          </span>
                          <span className="text-[11px] text-[#85847b]">
                            {Math.round(imagePosition.y * 100)}%
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-1.5 text-xs">
                          {[
                            { label: "Top", y: 0.25 },
                            { label: "Center", y: 0.5 },
                            { label: "Bottom", y: 0.75 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setImagePosition((prev) => ({ ...prev, y: preset.y }));
                                setSelectedDesign("image");
                              }}
                              className={`rounded border py-1.5 transition ${
                                Math.abs(imagePosition.y - preset.y) < 0.08
                                  ? "border-[#24241f] bg-white font-medium text-[#24241f] shadow-xs"
                                  : "border-black/10 text-[#666] hover:border-black/30"
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="0.95"
                          step="0.02"
                          value={imagePosition.y}
                          onChange={(e) => {
                            setImagePosition((prev) => ({
                              ...prev,
                              y: Number(e.target.value),
                            }));
                            setSelectedDesign("image");
                          }}
                          className="mt-2 w-full accent-[#7C8566]"
                        />
                      </div>

                      {/* Horizontal Alignment / 360 Rotation */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="block text-xs text-[#85847b]">
                            Wrap rotation (360°)
                          </span>
                          <span className="text-[11px] text-[#85847b]">
                            {Math.round(imagePosition.x * 100)}%
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs min-[420px]:grid-cols-4">
                          {[
                            { label: "Front", x: 0.5 },
                            { label: "Right", x: 0.75 },
                            { label: "Back", x: 1.0 },
                            { label: "Left", x: 0.25 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setImagePosition((prev) => ({ ...prev, x: preset.x }));
                                setSelectedDesign("image");
                              }}
                              className={`rounded border py-1.5 transition ${
                                Math.abs(imagePosition.x - preset.x) < 0.08
                                  ? "border-[#24241f] bg-white font-medium text-[#24241f] shadow-xs"
                                  : "border-black/10 text-[#666] hover:border-black/30"
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.02"
                          value={imagePosition.x}
                          onChange={(e) => {
                            setImagePosition((prev) => ({
                              ...prev,
                              x: Number(e.target.value),
                            }));
                            setSelectedDesign("image");
                          }}
                          className="mt-2 w-full accent-[#7C8566]"
                        />
                      </div>

                      {/* Reset wrap layout button */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setImageScale(1);
                            setImagePosition({ x: 0.5, y: 0.5 });
                            setImageFit("cover");
                            setSelectedDesign("image");
                          }}
                          className="text-xs text-[#85847b] underline underline-offset-4 hover:text-[#24241f]"
                        >
                          Reset wrap layout
                        </button>
                      </div>
                    </div>
                  )}

                  {imageMode === "decal" && (
                    <div className="space-y-4 rounded-sm border border-black/10 bg-[#faf9f6] p-3.5">
                      <div>
                        <div className="flex items-center justify-between">
                          <label htmlFor="image-scale" className="text-xs text-[#85847b]">
                            Resize artwork
                          </label>
                          <span className="text-xs font-medium">
                            {Math.round(imageScale * 100)}%
                          </span>
                        </div>
                        <input
                          id="image-scale"
                          type="range"
                          min="0.2"
                          max="2.5"
                          step="0.05"
                          value={imageScale}
                          onChange={(event) => {
                            setImageScale(Number(event.target.value));
                            setSelectedDesign("image");
                          }}
                          className="mt-2.5 w-full accent-[#7C8566]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#85847b]">
                            Horizontal position
                          </span>
                          <span className="text-[11px] text-[#85847b]">
                            {Math.round(imagePosition.x * 100)}%
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs min-[420px]:grid-cols-4">
                          {(isCylinder
                            ? [
                                { label: "Front", x: 0.5 },
                                { label: "Right", x: 0.75 },
                                { label: "Back", x: 1.0 },
                                { label: "Left", x: 0.25 },
                              ]
                            : [
                                { label: "Left", x: 0.25 },
                                { label: "Center", x: 0.5 },
                                { label: "Right", x: 0.75 },
                                { label: "Center", x: 0.5 },
                              ]
                          ).map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() =>
                                setImagePosition((prev) => ({ ...prev, x: preset.x }))
                              }
                              className={`rounded border py-1.5 transition ${
                                Math.abs(imagePosition.x - preset.x) < 0.08
                                  ? "border-[#24241f] bg-white font-medium text-[#24241f] shadow-xs"
                                  : "border-black/10 text-[#666] hover:border-black/30"
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.02"
                          value={imagePosition.x}
                          onChange={(e) =>
                            setImagePosition((prev) => ({
                              ...prev,
                              x: Number(e.target.value),
                            }))
                          }
                          className="mt-2 w-full accent-[#7C8566]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#85847b]">
                            Vertical position
                          </span>
                          <span className="text-[11px] text-[#85847b]">
                            {Math.round(imagePosition.y * 100)}%
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-1.5 text-xs">
                          {[
                            { label: "Top", y: 0.25 },
                            { label: "Center", y: 0.5 },
                            { label: "Bottom", y: 0.75 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() =>
                                setImagePosition((prev) => ({ ...prev, y: preset.y }))
                              }
                              className={`rounded border py-1.5 transition ${
                                Math.abs(imagePosition.y - preset.y) < 0.08
                                  ? "border-[#24241f] bg-white font-medium text-[#24241f] shadow-xs"
                                  : "border-black/10 text-[#666] hover:border-black/30"
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="0.9"
                          step="0.02"
                          value={imagePosition.y}
                          onChange={(e) =>
                            setImagePosition((prev) => ({
                              ...prev,
                              y: Number(e.target.value),
                            }))
                          }
                          className="mt-2 w-full accent-[#7C8566]"
                        />
                      </div>
                    </div>
                  )}

                  {imageMode === "repeat" && (
                    <div className="rounded-sm border border-black/10 bg-[#faf9f6] p-3.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="pattern-scale" className="text-xs text-[#85847b]">
                          Pattern tile size
                        </label>
                        <span className="text-xs font-medium">
                          {Math.round(imageScale * 100)}%
                        </span>
                      </div>
                      <input
                        id="pattern-scale"
                        type="range"
                        min="0.4"
                        max="2"
                        step="0.05"
                        value={imageScale}
                        onChange={(event) => setImageScale(Number(event.target.value))}
                        className="mt-2.5 w-full accent-[#7C8566]"
                      />
                    </div>
                  )}

                  {/* Opacity Slider */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#24241f]">
                        Artwork opacity
                      </span>
                      <span className="text-xs font-semibold tabular-nums text-[#7C8566]">
                        {Math.round(imageOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      id="image-opacity"
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={imageOpacity}
                      onChange={(event) => setImageOpacity(Number(event.target.value))}
                      className="mt-2 w-full accent-[#7C8566]"
                    />
                  </div>

                  {/* Blend Modes */}
                  <div>
                    <span className="block text-xs font-medium text-[#24241f]">
                      Print ink blend
                    </span>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      {[
                        {
                          id: "normal",
                          name: "Solid Print",
                          desc: "Opaque artwork layer",
                        },
                        {
                          id: "multiply",
                          name: "Glaze Blend",
                          desc: "Inks absorb into body",
                        },
                        {
                          id: "overlay",
                          name: "Vibrant Sheen",
                          desc: "High contrast finish",
                        },
                        {
                          id: "screen",
                          name: "Luminous",
                          desc: "Soft frosted glow",
                        },
                      ].map((blend) => (
                        <button
                          key={blend.id}
                          type="button"
                          onClick={() => setImageBlendMode(blend.id)}
                          className={`border p-2.5 text-left transition ${
                            imageBlendMode === blend.id
                              ? "border-[#24241f] bg-[#eeece5]"
                              : "border-black/10 hover:border-black/30"
                          }`}
                        >
                          <span className="block font-medium text-[#24241f]">
                            {blend.name}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-[#85847b]">
                            {blend.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Filters */}
                  <div>
                    <span className="block text-xs font-medium text-[#24241f]">
                      Photo filter
                    </span>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs min-[420px]:grid-cols-4">
                      {[
                        { id: "none", label: "Original" },
                        { id: "vibrant", label: "Vibrant" },
                        { id: "grayscale", label: "B&W" },
                        { id: "sepia", label: "Warm Sepia" },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => setImageFilter(filter.id)}
                          className={`rounded border py-1.5 text-center font-medium transition ${
                            imageFilter === filter.id
                              ? "border-[#24241f] bg-[#eeece5] text-[#24241f]"
                              : "border-black/10 text-[#666] hover:border-black/30"
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setImageMode(isCylinder ? "full-wrap" : "decal");
                      setImageFit("cover");
                      setImageOpacity(1);
                      setImageBlendMode("normal");
                      setImageFilter("none");
                      setImageScale(1);
                      setImagePosition({ x: 0.5, y: 0.5 });
                    }}
                    className="mt-1 text-xs underline underline-offset-4"
                  >
                    Reset artwork settings
                  </button>
                </div>
              )}

              <p className="mt-3 text-xs leading-5 text-[#85847b]">
                Uploaded artwork and photos are previewed locally in your browser and mapped in real time.
              </p>
            </section>
          )}
          </div>

          {/* Desktop Add to Bag Button */}
          <button
            type="button"
            onClick={handleAddToBag}
            className="hidden lg:flex h-14 w-full items-center justify-between rounded-sm bg-[#24241f] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-md transition-all hover:bg-[#515449] active:scale-[0.99]"
          >
            <span className="flex items-center gap-3">
              <ShoppingBag size={17} />
              <span>{editingItem ? "Save Customized Piece" : "Add to Shopping Bag"}</span>
            </span>
            <span className="tabular-nums font-bold">₹{product.price}</span>
          </button>

          <p className="hidden lg:block mt-3 text-xs leading-5 text-[#85847b]">
            Your design is previewed with real-time raycasted lighting. Complimentary bespoke customization included.
          </p>
        </div>
      </div>

      {/* Luxury Mobile Bottom Sticky Dock */}
      <div className="fixed inset-x-0 bottom-0 z-40 block lg:hidden glass-panel border-t border-black/10 px-4 py-3 pb-safe shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-[#eeece5] border border-black/10">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#24241f]">{product.name}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#7c8566]">
                <span
                  className="h-2.5 w-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: mugColor }}
                />
                <span className="font-semibold tabular-nums text-[#24241f]">
                  ₹{product.price}
                </span>
                {personalText && (
                  <span className="truncate max-w-[85px] text-[10px] text-[#85847b]">
                    · "{personalText.split("\n").filter(Boolean).join(" · ")}"
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToBag}
            className="flex h-11 shrink-0 items-center gap-2 rounded-sm bg-[#24241f] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-md active:bg-[#515449]"
          >
            <ShoppingBag size={15} />
            <span>{editingItem ? "Save" : "Add to Bag"}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
