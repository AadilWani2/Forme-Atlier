export const FONT_OPTIONS = [
  {
    id: "sans",
    name: "Modern Sans",
    category: "Clean",
    family: "'DM Sans', sans-serif",
    preview: "Modern Minimal",
    lineHeightMultiplier: 1.25,
  },
  {
    id: "display",
    name: "Clean Display",
    category: "Bold",
    family: "'Manrope', sans-serif",
    preview: "Bold Architecture",
    lineHeightMultiplier: 1.25,
  },
  {
    id: "serif",
    name: "Playfair Luxury",
    category: "Luxury",
    family: "'Playfair Display', Georgia, serif",
    preview: "Classic Elegance",
    lineHeightMultiplier: 1.3,
  },
  {
    id: "cormorant",
    name: "Editorial Serif",
    category: "Editorial",
    family: "'Cormorant Garamond', Garamond, serif",
    preview: "Vogue Editorial",
    lineHeightMultiplier: 1.25,
  },
  {
    id: "cinzel",
    name: "Cinzel Classic",
    category: "Regal",
    family: "'Cinzel', serif",
    preview: "ROMAN CLASSIC",
    lineHeightMultiplier: 1.25,
  },
  {
    id: "script",
    name: "Dancing Script",
    category: "Handwritten",
    family: "'Dancing Script', cursive",
    preview: "Fluid Calligraphy",
    lineHeightMultiplier: 1.35,
  },
  {
    id: "vibes",
    name: "Great Vibes",
    category: "Calligraphy",
    family: "'Great Vibes', cursive",
    preview: "Romantic Script",
    lineHeightMultiplier: 1.45,
  },
  {
    id: "caveat",
    name: "Caveat Casual",
    category: "Casual",
    family: "'Caveat', cursive",
    preview: "Warm Personal Note",
    lineHeightMultiplier: 1.3,
  },
  {
    id: "pacifico",
    name: "Pacifico Retro",
    category: "Retro",
    family: "'Pacifico', cursive",
    preview: "Vintage Brush",
    lineHeightMultiplier: 1.35,
  },
  {
    id: "oswald",
    name: "Oswald Bold",
    category: "Impact",
    family: "'Oswald', sans-serif",
    preview: "STRONG HEADLINE",
    lineHeightMultiplier: 1.2,
  },
  {
    id: "mono",
    name: "Space Mono",
    category: "Technical",
    family: "'Space Mono', monospace",
    preview: "Typewriter / Code",
    lineHeightMultiplier: 1.3,
  },
];

export const FONT_MAP = Object.fromEntries(
  FONT_OPTIONS.map((f) => [f.id, f])
);

export const TEXT_COLOR_PALETTE = [
  { label: "Pitch Black", value: "#111111", border: "border-black/20" },
  { label: "Pure White", value: "#FFFFFF", border: "border-black/20" },
  { label: "Warm Charcoal", value: "#2E2D2A", border: "border-black/20" },
  { label: "Champagne Gold", value: "#C5A059", border: "border-black/20" },
  { label: "Rose Gold", value: "#C78680", border: "border-black/20" },
  { label: "Warm Terracotta", value: "#B85D3D", border: "border-black/20" },
  { label: "Studio Olive", value: "#7C8566", border: "border-black/20" },
  { label: "Royal Slate Navy", value: "#263554", border: "border-black/20" },
  { label: "Deep Forest", value: "#1D4733", border: "border-black/20" },
  { label: "Crimson Red", value: "#A12228", border: "border-black/20" },
  { label: "Neon Coral", value: "#FF5A5F", border: "border-black/20" },
  { label: "Electric Cobalt", value: "#2F54EB", border: "border-black/20" },
];

export const TEXT_STYLE_OPTIONS = [
  { id: "none", label: "Flat Ink", desc: "Clean crisp ceramic print" },
  { id: "outline", label: "Contrasting Outline", desc: "Crisp outline for photo overlays" },
  { id: "shadow", label: "3D Drop Shadow", desc: "Adds subtle floating depth" },
  { id: "glow", label: "Luminous Glow", desc: "Soft radiant halo effect" },
  { id: "embossed", label: "Ceramic Stamp", desc: "Subtle pressed engraved effect" },
];

export const TEXT_WEIGHT_OPTIONS = [
  { id: "400", label: "Regular" },
  { id: "600", label: "Semi-Bold" },
  { id: "800", label: "Bold" },
];

export const TEXT_TRANSFORM_OPTIONS = [
  { id: "none", label: "As Typed" },
  { id: "uppercase", label: "UPPER" },
  { id: "lowercase", label: "lower" },
];
