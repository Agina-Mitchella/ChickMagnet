import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

interface StorefrontHeroProps {
  onExploreProducts: () => void;
}

export default function StorefrontHero({ onExploreProducts }: StorefrontHeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-emerald-950 shadow-[0_28px_80px_rgba(18,53,36,0.22)] sm:min-h-[480px] lg:min-h-[520px] lg:rounded-[2.5rem]">
      <picture className="absolute inset-0 block h-full w-full">
        <source media="(max-width: 639px)" srcSet="/images/hero-commercial-farm-mobile.jpg" />
        <img
          src="/images/hero-commercial-farm-desktop.jpg"
          alt="A representative modern commercial poultry barn with automated feeding and watering lines"
          fetchPriority="high"
          className="h-full w-full object-cover object-center sm:object-[58%_50%]"
        />
      </picture>

      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(4,24,15,0.14)_0%,transparent_42%)]" />

      <div className="relative z-10 flex min-h-[520px] items-end p-5 sm:min-h-[480px] sm:items-center sm:p-8 lg:min-h-[520px] lg:p-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl rounded-[1.75rem] border border-white/15 bg-[#071c13]/58 p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl supports-[not_(backdrop-filter:blur(1px))]:bg-[#071c13]/90 sm:p-8 lg:p-10"
        >
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-300">From ChickMagnet</p>
          <h1 className="max-w-xl text-[2.15rem] font-extrabold leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl lg:text-[3.5rem]">
            Quality and Affordable Poultry Products For Wholesale and Retail
          </h1>
          <button
            type="button"
            onClick={onExploreProducts}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-extrabold text-emerald-950 shadow-[0_12px_28px_rgba(245,158,11,0.3)] transition-transform hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
          >
            Explore Products
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
