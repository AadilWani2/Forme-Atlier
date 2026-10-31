import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "../data/products";
import { useCart } from "../hooks/useCart.jsx";

const money = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

function Detail({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-4 py-1 text-xs">
      <span className="text-[#85847b]">{label}</span>
      <span className="max-w-[70%] font-medium text-right text-[#24241f]">{value}</span>
    </div>
  );
}

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, cartCount } =
    useCart();

  if (!items.length) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eeece5] shadow-xs">
          <ShoppingBag size={28} strokeWidth={1.5} className="text-[#686b5c]" />
        </div>
        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7c8566]">
          Your Atelier Selection
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-[-0.05em] sm:text-5xl text-[#24241f]">
          Your bag is empty.
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-6 text-[#85847b]">
          Explore the bespoke collection and create a personalized piece in our 3D Studio.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex h-12 items-center gap-3 rounded-sm bg-[#24241f] px-7 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#515449] transition-all shadow-sm"
        >
          <span>Explore Collection</span>
          <ArrowRight size={15} />
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1240px] px-4 py-8 pb-20 sm:px-8 sm:py-12 lg:px-12">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-xs font-medium text-[#85847b] hover:text-[#24241f] transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Continue browsing collection</span>
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7c8566]">
            <Sparkles size={11} className="text-[#c8a858]" />
            <span>Forme Atelier Bag</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-[#24241f] sm:text-4xl">
            Shopping Bag
            <span className="ml-3 text-lg font-normal text-[#85847b]">
              ({cartCount} {cartCount === 1 ? "piece" : "pieces"})
            </span>
          </h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-[#85847b] underline underline-offset-4 hover:text-[#24241f]"
        >
          Clear bag
        </button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* Items List */}
        <div className="space-y-6">
          {items.map((item) => {
            const product = products.find((entry) => entry.id === item.productId);
            const design = item.customization || {};

            return (
              <article
                key={item.cartId}
                className="grid grid-cols-[105px_minmax(0,1fr)] gap-4 rounded-lg border border-black/[0.08] bg-white/70 p-4 shadow-xs sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-6 sm:p-5"
              >
                {/* Item Thumbnail */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-[#eeece5] border border-black/[0.05]">
                  <img
                    src={product?.image || item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  {design.uploadedImage && (
                    <div className="absolute bottom-2 right-2 h-10 w-10 overflow-hidden rounded border border-white bg-white shadow-xs">
                      <img
                        src={design.uploadedImage}
                        alt="Uploaded artwork"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#85847b]">
                          {item.category}
                        </p>
                        <h2 className="mt-0.5 font-display text-lg font-medium text-[#24241f] sm:text-xl">
                          {item.name}
                        </h2>
                      </div>
                      <p className="shrink-0 text-base font-bold tabular-nums text-[#24241f]">
                        {money(item.price * item.quantity)}
                      </p>
                    </div>

                    {/* Saved Customizations */}
                    {Object.keys(design).length > 0 && (
                      <div className="mt-3.5 rounded-md border border-black/[0.06] bg-[#faf9f6] p-3 text-xs">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7c8566]">
                            <Sparkles size={11} className="text-[#c8a858]" />
                            <span>Bespoke Specifications</span>
                          </span>
                        </div>

                        <div className="mb-2 flex flex-wrap gap-2">
                          {(design.productColor || design.mugColor) && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-2.5 py-0.5 text-[10px] font-medium text-[#24241f]">
                              <span
                                className="h-2.5 w-2.5 rounded-full border border-black/20"
                                style={{
                                  backgroundColor:
                                    design.productColor || design.mugColor,
                                }}
                              />
                              <span>Selected Tone</span>
                            </span>
                          )}
                          {design.finish && (
                            <span className="rounded-full border border-black/10 bg-white px-2.5 py-0.5 text-[10px] font-medium capitalize text-[#24241f]">
                              {design.finish} Finish
                            </span>
                          )}
                        </div>

                        <Detail
                          label="Personal Text"
                          value={
                            design.personalText
                              ? `"${design.personalText.split("\n").filter(Boolean).join(" · ")}"`
                              : undefined
                          }
                        />
                        <Detail label="Typography" value={design.textFont} />
                        <Detail
                          label="Artwork"
                          value={
                            design.uploadName ||
                            (design.uploadedImage ? "Custom Artwork" : undefined)
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions & Quantity Stepper */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                    <Link
                      to={`/customize/${item.productId}?edit=${encodeURIComponent(
                        item.cartId
                      )}`}
                      className="text-xs font-semibold text-[#7c8566] underline underline-offset-4 hover:text-[#24241f] transition-colors"
                    >
                      Edit 3D Design
                    </Link>

                    <div className="flex items-center gap-4">
                      <div className="flex h-8 items-center rounded-sm border border-black/15 bg-white">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            updateQuantity(item.cartId, item.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center text-[#24241f] disabled:opacity-25"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="min-w-7 text-center text-xs font-semibold tabular-nums text-[#24241f]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(item.cartId, item.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center text-[#24241f]"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.cartId)}
                        className="inline-flex items-center gap-1 text-xs text-[#85847b] hover:text-red-700 transition-colors"
                        title="Remove piece"
                      >
                        <Trash2 size={13} />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Order Summary Aside */}
        <aside className="rounded-lg border border-black/[0.08] bg-white/70 p-6 shadow-xs backdrop-blur-md lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-medium tracking-tight text-[#24241f]">
            Order Summary
          </h2>

          <div className="mt-5 space-y-3 border-b border-black/10 pb-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-[#85847b]">Items Subtotal</span>
              <span className="font-semibold tabular-nums text-[#24241f]">
                {money(subtotal)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#85847b]">3D Customization</span>
              <span className="font-medium text-[#7c8566]">Complimentary</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#85847b]">Express Delivery</span>
              <span className="font-medium text-[#7c8566]">Free</span>
            </div>
          </div>

          <div className="flex justify-between gap-4 py-5 text-base font-bold text-[#24241f]">
            <span>Total</span>
            <span className="tabular-nums text-xl">{money(subtotal)}</span>
          </div>

          <Link
            to="/checkout"
            className="flex h-13 w-full items-center justify-center gap-2 rounded-sm bg-[#24241f] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-md transition-all hover:bg-[#515449] active:scale-[0.99]"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={15} />
          </Link>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#85847b]">
            <Truck size={13} className="text-[#7c8566]" />
            <span>Complimentary studio packaging &amp; insured shipping</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
