
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";
import Customizer from "./pages/Customizer";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import { CartProvider, useCart } from "./hooks/useCart.jsx";

function PlaceholderPage({ title }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-5 py-20">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#7c8566]">
        FORME STUDIO
      </p>
      <h1 className="mt-4 font-display text-5xl tracking-[-0.06em]">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-[#85847b]">
        We're building this part of the experience next.
      </p>
      <Link to="/shop" className="mt-7 border-b border-black pb-1 text-xs">
        Continue shopping
      </Link>
    </main>
  );
}

function AppContent() {
  const { cartCount } = useCart();

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#24241f] overflow-x-hidden">
      <Header cartCount={cartCount} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/customize/:id" element={<Customizer />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
        <Route path="*" element={<PlaceholderPage title="Page not found" />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}
