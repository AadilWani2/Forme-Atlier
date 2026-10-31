import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Layers,
  Rotate3D,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#eeece5] border-b border-black/[0.06]">
        <div className="mx-auto grid min-h-[640px] max-w-[1440px] md:grid-cols-2 lg:min-h-[720px]">
          <div className="flex flex-col justify-center px-5 py-14 sm:px-8 md:py-24 lg:px-16">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-[#7c8566]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#686b5c]">
                The Bespoke Atelier
              </span>
            </div>

            <h1 className="max-w-xl font-display text-[clamp(3.2rem,6.8vw,6.4rem)] font-medium leading-[0.94] tracking-[-0.075em] text-[#24241f]">
              Ordinary
              <br />
              objects.
              <br />
              <span className="font-serif italic font-normal text-[#7c8566]">
                Uniquely yours.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-sm leading-7 text-[#686b5c] sm:text-base sm:leading-8">
              Bespoke everyday essentials crafted for personal ritual. Custom
              colors, authentic tactile materials, and custom text previewed in
              real-time 3D.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6">
              <Link
                to="/shop"
                className="inline-flex h-12 items-center gap-4 rounded-sm bg-[#24241f] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-all hover:bg-[#515449] hover:shadow-md"
              >
                <span>Explore Pieces</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/customize/custom-bottle"
                className="inline-flex h-12 items-center gap-2 rounded-sm border border-black/15 bg-white/60 px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#24241f] backdrop-blur-xs transition-all hover:border-black/35 hover:bg-white"
              >
                <Rotate3D size={15} className="text-[#7c8566]" />
                <span>3D Customise and Buy</span>
              </Link>
            </div>

            <div className="mt-14 hidden items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#85847b] md:flex">
              <ArrowDown size={14} className="animate-bounce" />
              <span>Scroll to discover collection</span>
            </div>
          </div>

          {/* Hero Studio Visual */}
          <div className="relative min-h-[380px] overflow-hidden md:min-h-full">
            <img
              src="/images/hero-stationery.jpg"
              alt="Bespoke customizable stationery, diary, pen, and bottle on an atelier desk"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-md bg-[#faf9f6]/92 px-4 py-3 backdrop-blur-md border border-white/60 shadow-xs sm:left-8 sm:right-auto sm:min-w-64">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#7c8566] ring-4 ring-[#7c8566]/20" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#24241f]">
                    Real-time Studio
                  </span>
                  <span className="text-[10px] text-[#85847b]">
                    Instant 360° Raycasted Preview
                  </span>
                </div>
              </div>
              <Sparkles size={14} className="text-[#c8a858]" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection Grid */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 md:py-24 lg:px-12">
        <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7c8566]">
              <Sparkles size={12} className="text-[#c8a858]" />
              <span>Featured Editions</span>
            </div>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.06em] sm:text-5xl">
              Curated Essentials
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 self-start text-xs font-semibold uppercase tracking-[0.14em] text-[#24241f] hover:text-[#7c8566] transition-colors sm:self-auto"
          >
            <span>View All Pieces</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 lg:gap-x-8">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Editorial Statement Banner */}
      <section className="relative overflow-hidden bg-[#e8e9df] px-5 py-20 sm:px-8 md:py-28 text-center border-y border-black/[0.06]">
        <div className="mx-auto max-w-4xl">
          <span className="inline-block rounded-full border border-black/10 bg-white/50 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#686b5c]">
            Forme Philosophy
          </span>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-3xl font-medium leading-[1.1] tracking-[-0.06em] sm:text-5xl lg:text-6xl text-[#24241f]">
            The best things in life are the ones that quietly feel like yours.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-[#686b5c] sm:text-base">
            We reject mass conformity. Every vessel, diary, and instrument is
            shaped by your eye, your initials, and your story.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex h-12 items-center gap-4 rounded-sm bg-[#24241f] px-7 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#515449] transition-all shadow-sm"
          >
            <span>Start Customizing</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* 3-Step Atelier Process */}
      <section className="mx-auto grid max-w-[1440px] gap-8 px-4 py-16 sm:px-8 md:grid-cols-3 lg:gap-12 lg:px-12 lg:py-24">
        {[
          {
            number: "01",
            icon: Layers,
            title: "Select your canvas",
            description: "Choose a tactile everyday essential engineered for durability and quiet refinement.",
          },
          {
            number: "02",
            icon: Rotate3D,
            title: "3D Customization",
            description: "Interact directly with 3D models. Add custom text, swatches, wrap artwork, and metallic finishes.",
          },
          {
            number: "03",
            icon: Zap,
            title: "Direct Crafting",
            description: "Every order is customized bespoke with precision laser and print accuracy.",
          },
        ].map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="flex flex-col justify-between rounded-lg border border-black/[0.07] bg-white/50 p-6 sm:p-8 transition-shadow hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold tracking-[0.18em] text-[#7c8566]">
                    {step.number}
                  </span>
                  <Icon size={18} className="text-[#85847b]" />
                </div>
                <h3 className="mt-6 font-display text-xl font-medium tracking-tight text-[#24241f]">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-xs leading-6 text-[#85847b] sm:text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
