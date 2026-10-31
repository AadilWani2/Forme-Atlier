import { useMemo, useState } from "react";
import { ArrowRight, Check, Copy, PackageCheck, ShoppingBag } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { products } from "../data/products";

const money = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

function findOrder(orderId, locationOrder) {
  if (locationOrder?.orderId === orderId) return locationOrder;
  try {
    const orders = JSON.parse(localStorage.getItem("forme-studio-demo-orders-v1") || "[]");
    if (Array.isArray(orders)) {
      const match = orders.find((order) => order?.orderId === orderId);
      if (match) return match;
    }
    const last = JSON.parse(localStorage.getItem("forme-studio-last-order-v1") || "null");
    return last?.orderId === orderId ? last : null;
  } catch {
    return null;
  }
}

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const order = useMemo(() => findOrder(orderId, location.state?.order), [orderId, location.state]);
  const [copied, setCopied] = useState(false);

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderId || "");
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (!order) {
    return <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center"><p className="text-[10px] uppercase tracking-[0.2em] text-[#7c8566]">FORME STUDIO</p><h1 className="mt-4 font-display text-4xl tracking-[-0.06em]">Order details unavailable.</h1><p className="mt-3 max-w-md text-sm leading-6 text-[#85847b]">This demo order may have been cleared from this browser. You can still return to the collection and explore the customizer.</p><Link to="/shop" className="mt-7 inline-flex h-12 items-center gap-3 bg-[#24241f] px-6 text-sm text-white">Back to shop <ArrowRight size={16} /></Link></main>;
  }

  return (
    <main className="mx-auto max-w-[1000px] px-4 py-10 pb-20 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e7eadf] text-[#65704f]"><Check size={28} strokeWidth={1.6} /></div>
        <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-[#7c8566]">FORME STUDIO · DEMO ORDER</p>
        <h1 className="mt-3 font-display text-4xl tracking-[-0.06em] sm:text-6xl">Consider it made.</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#77766d]">Thanks, {order.customer?.fullName || "there"}. Your demo order has been saved in this browser. No real order was transmitted and no payment was collected.</p>
        <div className="mx-auto mt-7 inline-flex max-w-full items-center gap-3 border border-black/10 bg-white/60 px-4 py-3"><div className="text-left"><span className="block text-[10px] uppercase tracking-[0.15em] text-[#85847b]">Order reference</span><span className="mt-1 block break-all text-sm font-medium tracking-[0.08em]">{order.orderId}</span></div><button type="button" onClick={copyOrderNumber} aria-label="Copy order reference" className="flex h-9 w-9 shrink-0 items-center justify-center border border-black/10 hover:bg-[#f0f1e9]">{copied ? <Check size={15} /> : <Copy size={15} />}</button></div>
        {copied && <p className="mt-2 text-xs text-[#7c8566]">Order reference copied.</p>}
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-[1fr_300px] md:gap-8">
        <section className="rounded-lg border border-black/10 bg-white/70 p-5 shadow-xs sm:p-7">
          <div className="flex items-center gap-3 border-b border-black/10 pb-5"><PackageCheck size={19} className="text-[#7c8566]" /><div><h2 className="font-display text-xl">Order summary</h2><p className="mt-1 text-xs text-[#85847b]">{new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></div></div>
          <div className="space-y-4 py-5">
            {(order.items || []).map((item, index) => {
              const product = products.find((entry) => entry.id === item.productId);
              return <div key={item.cartId || `${item.productId}-${index}`} className="flex gap-4"><div className="relative h-20 w-[70px] shrink-0 overflow-hidden rounded-md border border-black/10 bg-[#eeece5]"><img src={product?.image || item.image} alt={item.name} className="h-full w-full object-cover" />{item.customization?.uploadedImage && <img src={item.customization.uploadedImage} alt="Custom artwork" className="absolute bottom-1 right-1 h-6 w-6 border border-white bg-white object-contain rounded-xs" />}</div><div className="min-w-0 flex-1"><h3 className="text-sm font-medium">{item.name}</h3><p className="mt-1 text-xs text-[#85847b]">Quantity: {item.quantity}</p>{item.customization?.personalText && <p className="mt-1 truncate text-xs text-[#7c8566] font-medium">Text: "{item.customization.personalText}"</p>}{item.customization?.finish && <p className="mt-1 text-xs capitalize text-[#85847b]">Finish: {item.customization.finish}</p>}</div><p className="shrink-0 text-sm font-semibold tabular-nums">{money(item.price * item.quantity)}</p></div>;
            })}
          </div>
          <div className="space-y-3 border-t border-black/10 pt-5 text-sm"><div className="flex justify-between gap-4"><span className="text-[#85847b]">Subtotal</span><span className="font-medium">{money(order.subtotal)}</span></div><div className="flex justify-between gap-4"><span className="text-[#85847b]">{order.delivery?.name || "Delivery"}</span><span className="font-medium">{order.shipping ? money(order.shipping) : "Free"}</span></div><div className="flex justify-between gap-4 border-t border-black/10 pt-4 text-base font-bold text-[#24241f]"><span>Total</span><span className="tabular-nums">{money(order.total)}</span></div></div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-black/10 bg-white/70 p-5 shadow-xs"><h2 className="font-display text-lg">Delivery details</h2><p className="mt-4 text-sm font-semibold text-[#24241f]">{order.customer?.fullName}</p><p className="mt-2 whitespace-pre-line text-xs leading-6 text-[#77766d]">{[order.delivery?.addressLabel].filter(Boolean).join("\n")}</p><p className="mt-3 break-all text-xs text-[#77766d]">{order.customer?.email}</p><p className="mt-1 text-xs text-[#77766d]">{order.customer?.phone}</p></section>
          <section className="rounded-lg border border-[#d8dccd] bg-[#f0f1e9] p-5"><div className="flex items-center gap-2"><ShoppingBag size={16} className="text-[#7c8566]" /><h2 className="text-sm font-semibold text-[#24241f]">What happens next?</h2></div><p className="mt-3 text-xs leading-6 text-[#6f7065]">In a live atelier, our craftsmen would now prepare your bespoke design for laser etching and dye sublimation.</p><p className="mt-3 border-t border-[#d8dccd] pt-3 text-[11px] font-medium text-[#7c8566]">Studio Status: Showcase Confirmed</p></section>
        </aside>
      </div>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"><Link to="/shop" className="inline-flex h-12 items-center justify-center gap-3 bg-[#24241f] px-6 text-sm text-white transition hover:bg-[#515449]">Continue exploring <ArrowRight size={16} /></Link><Link to="/" className="inline-flex h-12 items-center justify-center border border-black/15 px-6 text-sm hover:bg-white/60">Back to home</Link></div>
    </main>
  );
}
