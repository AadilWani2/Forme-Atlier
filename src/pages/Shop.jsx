import { Search, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { categories, products } from "../data/products";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategoryParam = searchParams.get("category");
  const category =
    currentCategoryParam && categories.includes(currentCategoryParam)
      ? currentCategoryParam
      : "All";

  const [search, setSearch] = useState("");

  const handleCategoryChange = (newCategory) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newCategory === "All") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", newCategory);
    }
    setSearchParams(nextParams);
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  return (
    <main className="mx-auto min-h-[75vh] max-w-[1440px] px-4 py-8 sm:px-8 md:py-16 lg:px-12">
      {/* Header Banner */}
      <div className="border-b border-black/10 pb-8 sm:pb-12">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#7c8566]">
          <Sparkles size={13} className="text-[#c8a858]" />
          <span>Curated Design Atelier</span>
        </div>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.06em] sm:text-6xl lg:text-7xl">
          The Bespoke Collection
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#85847b] sm:mt-4 sm:text-base sm:leading-7">
          Thoughtful objects crafted for everyday ritual. Choose your piece, configure your palette, and personalize every angle in real-time 3D.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 border-b border-black/10 py-5 sm:py-6 md:flex-row md:items-center md:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((item) => {
            const count = item === "All" ? products.length : products.filter((p) => p.category === item).length;
            const isSelected = category === item;
            return (
              <button
                type="button"
                key={item}
                onClick={() => handleCategoryChange(item)}
                aria-pressed={isSelected}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? "border-[#24241f] bg-[#24241f] text-white shadow-xs"
                    : "border-black/10 bg-white/60 text-[#686b5c] hover:border-black/30 hover:bg-white"
                }`}
              >
                <span>{item}</span>
                <span
                  className={`text-[10px] ${
                    isSelected ? "text-white/70" : "text-[#85847b]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative flex h-11 items-center rounded-full border border-black/15 bg-white/70 px-4 transition-all focus-within:border-[#24241f] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#24241f] md:w-72">
          <Search size={16} className="text-[#85847b] shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or category..."
            aria-label="Search products"
            className="w-full bg-transparent px-2.5 text-xs text-[#24241f] outline-none placeholder:text-[#a5a399]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-[#85847b] hover:text-[#24241f]"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between py-5 text-xs text-[#85847b]">
        <span>
          Showing <strong className="font-semibold text-[#24241f]">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "design piece" : "design pieces"}
        </span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-[#7c8566]">
          Real-time 3D Preview Available
        </span>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="my-16 rounded-sm border border-dashed border-black/15 bg-white/50 py-20 text-center">
          <p className="font-display text-2xl font-medium text-[#24241f]">No matching pieces found</p>
          <p className="mt-2 text-sm text-[#85847b]">
            Try adjusting your search criteria or explore another collection.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              handleCategoryChange("All");
            }}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#24241f] px-6 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#515449] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </main>
  );
}
