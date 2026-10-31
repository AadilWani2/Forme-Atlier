import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, PackageCheck, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { products } from "../data/products";
import { useCart } from "../hooks/useCart.jsx";

const money = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;
const DELIVERY_OPTIONS = [
  { id: "standard", name: "Standard delivery", detail: "Arrives in 5–7 business days", price: 0 },
  { id: "express", name: "Express delivery", detail: "Arrives in 2–3 business days", price: 99 },
];
const initialForm = {
  fullName: "", email: "", phone: "", address: "", apartment: "", city: "", state: "", postalCode: "", country: "India", notes: "",
};

function Field({ label, name, value, onChange, error, required = false, type = "text", autoComplete, placeholder }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-semibold text-[#57574f]">{label}{required && <span className="ml-1 text-[#7c8566]">*</span>}</span>
      <input
        type={type} name={name} value={value} onChange={onChange} required={required}
        autoComplete={autoComplete} placeholder={placeholder}
        aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined}
        className={`h-12 w-full rounded-md border bg-white/80 px-3.5 text-sm outline-none transition placeholder:text-[#b0aea4] focus:border-[#7c8566] focus:ring-1 focus:ring-[#7c8566] ${error ? "border-red-500" : "border-black/15 hover:border-black/30"}`}
      />
      {error && <span id={`${name}-error`} className="mt-1 block text-xs font-medium text-red-700">{error}</span>}
    </label>
  );
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [delivery, setDelivery] = useState("standard");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDelivery = DELIVERY_OPTIONS.find((option) => option.id === delivery) || DELIVERY_OPTIONS[0];
  const shipping = selectedDelivery.price;
  const total = subtotal + shipping;
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + Number(item.quantity || 1), 0), [items]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  };

  const validate = () => {
    const next = {};
    const requiredFields = ["fullName", "email", "phone", "address", "city", "state", "postalCode", "country"];
    requiredFields.forEach((key) => {
      if (!String(form[key] || "").trim()) next[key] = "This field is required.";
    });
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    const digits = form.phone.replace(/\D/g, "");
    if (form.phone.trim() && (digits.length < 10 || digits.length > 15)) {
      next.phone = "Enter a valid phone number (10–15 digits).";
    }
    if (form.postalCode.trim() && form.country === "India" && !/^\d{6}$/.test(form.postalCode.trim())) {
      next.postalCode = "Enter a valid 6-digit PIN code.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const placeDemoOrder = (event) => {
    event.preventDefault();
    setFormError("");
    if (!items.length) {
      setFormError("Your bag is empty. Add an item before continuing.");
      return;
    }
    if (!validate()) {
      setFormError("Please check the highlighted fields and try again.");
      const firstInvalid = document.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    setIsSubmitting(true);
    const orderId = `FM-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const order = {
      orderId,
      createdAt: new Date().toISOString(),
      customer: { ...form, fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() },
      delivery: { ...selectedDelivery, addressLabel: [form.address, form.apartment, form.city, form.state, form.postalCode, form.country].filter(Boolean).join(", ") },
      items: items.map((item) => ({ ...item })),
      subtotal,
      shipping,
      total,
      payment: "Demo checkout — no payment collected",
      isDemo: true,
    };
    try {
      const savedOrders = JSON.parse(localStorage.getItem("forme-studio-demo-orders-v1") || "[]");
      localStorage.setItem("forme-studio-demo-orders-v1", JSON.stringify([order, ...(Array.isArray(savedOrders) ? savedOrders : [])].slice(0, 25)));
      localStorage.setItem("forme-studio-last-order-v1", JSON.stringify(order));
      clearCart();
      navigate(`/order-confirmation/${orderId}`, { state: { order } });
    } catch (error) {
      console.error("Could not save demo order in this browser.", error);
      setFormError("This browser could not save the demo order. Please free up browser storage and try again.");
      setIsSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eeece5]"><PackageCheck size={25} strokeWidth={1.4} /></div>
        <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-[#7c8566]">Checkout</p>
        <h1 className="mt-3 font-display text-4xl tracking-[-0.06em]">Your bag is empty.</h1>
        <p className="mt-3 text-sm leading-6 text-[#85847b]">Add something personal to your bag before checkout.</p>
        <Link to="/shop" className="mt-7 inline-flex h-12 items-center gap-3 bg-[#24241f] px-6 text-sm text-white">Explore the collection <ArrowRight size={16} /></Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 pb-16 sm:px-8 sm:py-12 lg:px-12">
      <Link to="/cart" className="inline-flex items-center gap-2 text-xs text-[#85847b] hover:text-[#24241f]"><ArrowLeft size={15} /> Return to bag</Link>
      <div className="mt-6 border-b border-black/10 pb-6 sm:mt-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#7c8566]">FORME STUDIO · SECURE-STYLE DEMO</p>
        <h1 className="mt-2 font-display text-4xl tracking-[-0.06em] sm:text-5xl">A few details.</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#85847b]">Tell us where your order should go. This is a frontend showcase—no real order or payment is sent.</p>
      </div>

      <form onSubmit={placeDemoOrder} noValidate className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-14">
        <div className="space-y-9">
          <section>
            <div className="mb-5 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8e9df] text-xs">01</span><div><h2 className="font-display text-xl">Contact details</h2><p className="mt-1 text-xs text-[#85847b]">For demo order information only.</p></div></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="fullName" value={form.fullName} onChange={onChange} error={errors.fullName} required autoComplete="name" placeholder="Your name" />
              <Field label="Email address" name="email" value={form.email} onChange={onChange} error={errors.email} required type="email" autoComplete="email" placeholder="you@example.com" />
              <Field label="Phone number" name="phone" value={form.phone} onChange={onChange} error={errors.phone} required type="tel" autoComplete="tel" placeholder="10-digit phone number" />
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8e9df] text-xs">02</span><div><h2 className="font-display text-xl">Delivery address</h2><p className="mt-1 text-xs text-[#85847b]">Choose where your package would be delivered.</p></div></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field label="Street address" name="address" value={form.address} onChange={onChange} error={errors.address} required autoComplete="street-address" placeholder="House number and street name" /></div>
              <div className="sm:col-span-2"><Field label="Apartment, suite, landmark (optional)" name="apartment" value={form.apartment} onChange={onChange} autoComplete="address-line2" placeholder="Apartment, floor, nearby landmark" /></div>
              <Field label="City" name="city" value={form.city} onChange={onChange} error={errors.city} required autoComplete="address-level2" placeholder="City" />
              <Field label="State / region" name="state" value={form.state} onChange={onChange} error={errors.state} required autoComplete="address-level1" placeholder="State" />
              <Field label="PIN / postal code" name="postalCode" value={form.postalCode} onChange={onChange} error={errors.postalCode} required autoComplete="postal-code" placeholder={form.country === "India" ? "6-digit PIN code" : "Postal code"} />
              <label className="block"><span className="mb-2 block text-xs font-semibold text-[#57574f]">Country <span className="ml-1 text-[#7c8566]">*</span></span><select name="country" value={form.country} onChange={onChange} required className={`h-12 w-full rounded-md border bg-white/80 px-3.5 text-sm outline-none transition focus:border-[#7c8566] focus:ring-1 focus:ring-[#7c8566] ${errors.country ? "border-red-500" : "border-black/15 hover:border-black/30"}`}><option>India</option><option>United States</option><option>United Kingdom</option><option>Canada</option><option>Australia</option><option>United Arab Emirates</option><option>Other</option></select>{errors.country && <span className="mt-1 block text-xs text-red-700">{errors.country}</span>}</label>
              <div className="sm:col-span-2"><label className="block"><span className="mb-2 block text-xs font-semibold text-[#57574f]">Delivery note (optional)</span><textarea name="notes" value={form.notes} onChange={onChange} rows={3} maxLength={300} placeholder="Anything useful for the delivery (max 300 characters)" className="w-full resize-y rounded-md border border-black/15 bg-white/80 px-3.5 py-3 text-sm outline-none placeholder:text-[#b0aea4] transition focus:border-[#7c8566] focus:ring-1 focus:ring-[#7c8566]" /></label></div>
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8e9df] text-xs">03</span><div><h2 className="font-display text-xl">Delivery method</h2><p className="mt-1 text-xs text-[#85847b]">Select the delivery speed for this demo.</p></div></div>
            <div className="space-y-3">
              {DELIVERY_OPTIONS.map((option) => (
                <label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${delivery === option.id ? "border-[#7c8566] bg-[#f0f1e9] shadow-xs" : "border-black/15 bg-white/40 hover:border-black/30"}`}>
                  <input type="radio" name="delivery" value={option.id} checked={delivery === option.id} onChange={() => setDelivery(option.id)} className="mt-1 accent-[#7c8566]" />
                  <Truck size={17} className="mt-0.5 shrink-0 text-[#7c8566]" />
                  <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{option.name}</span><span className="mt-1 block text-xs text-[#85847b]">{option.detail}</span></span>
                  <span className="text-sm tabular-nums">{option.price ? money(option.price) : "Free"}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="border border-[#d8dccd] bg-[#f0f1e9] p-4 sm:p-5">
            <div className="flex items-start gap-3"><LockKeyhole size={17} className="mt-0.5 shrink-0 text-[#7c8566]" /><div><p className="text-sm font-medium">Demo checkout · no payment</p><p className="mt-1 text-xs leading-5 text-[#6f7065]">Placing this demo order only saves the entered details in this browser's local storage. No payment details are requested, and nothing is sent to a server.</p></div></div>
          </div>
          {formError && <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p>}
          <button type="submit" disabled={isSubmitting} className="flex h-13 w-full items-center justify-center gap-3 bg-[#24241f] px-5 py-4 text-sm text-white transition hover:bg-[#515449] disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:min-w-[260px]">{isSubmitting ? "Creating demo order…" : "Place demo order"}<ArrowRight size={16} /></button>
          <p className="text-[11px] leading-5 text-[#85847b]">By continuing, you acknowledge this is a portfolio demonstration, not a live store transaction.</p>
        </div>

        <aside className="border border-black/10 bg-white/55 p-5 sm:p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl">Your order</h2><span className="text-xs text-[#85847b]">{itemCount} {itemCount === 1 ? "item" : "items"}</span></div>
          <div className="mt-5 max-h-[380px] space-y-4 overflow-y-auto border-b border-black/10 pb-5">
            {items.map((item) => {
              const product = products.find((entry) => entry.id === item.productId);
              return <div key={item.cartId} className="flex gap-3"><div className="relative h-[76px] w-[66px] shrink-0 overflow-hidden bg-[#eeece5]"><img src={product?.image || item.image} alt={item.name} className="h-full w-full object-cover" />{item.customization?.uploadedImage && <img src={item.customization.uploadedImage} alt="Custom artwork" className="absolute bottom-1 right-1 h-6 w-6 border border-white bg-white object-contain" />}</div><div className="min-w-0 flex-1"><p className="text-sm leading-5">{item.name}</p><p className="mt-1 text-xs text-[#85847b]">Qty {item.quantity}</p>{item.customization?.personalText && <p className="mt-1 truncate text-[11px] text-[#85847b]">Text: {item.customization.personalText}</p>}</div><p className="shrink-0 text-sm tabular-nums">{money(item.price * item.quantity)}</p></div>;
            })}
          </div>
          <div className="space-y-3 border-b border-black/10 py-5 text-sm"><div className="flex justify-between gap-4"><span className="text-[#85847b]">Subtotal</span><span className="tabular-nums">{money(subtotal)}</span></div><div className="flex justify-between gap-4"><span className="text-[#85847b]">{selectedDelivery.name}</span><span className="tabular-nums">{shipping ? money(shipping) : "Free"}</span></div></div>
          <div className="flex items-center justify-between gap-4 py-5"><div><p className="text-sm font-medium">Total</p><p className="mt-1 text-[11px] text-[#85847b]">Inclusive of demo shipping</p></div><p className="font-display text-2xl tabular-nums">{money(total)}</p></div>
          <div className="flex items-center gap-2 text-[11px] text-[#85847b]"><Check size={14} className="text-[#7c8566]" /> Your cart is saved in this browser</div>
        </aside>
      </form>
    </main>
  );
}
