import React from 'react';
import { ShieldCheck, Truck, Activity, Award, CheckCircle2, FileText, Heart, Globe } from 'lucide-react';

export default function AboutLore() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-emerald-950">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#123524] to-[#0b2217] text-amber-50 rounded-3xl p-8 sm:p-12 border border-emerald-800 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 font-mono text-xs px-3 py-1 rounded-full border border-amber-500/30">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            KEBS & DVS Bio-Secure Certified Poultry Platform
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl font-black text-amber-300 tracking-tight leading-tight">
            ChickMagnet: The Standard for Modern Poultry & Hatchery Logistics
          </h1>

          <p className="text-sm text-emerald-200 leading-relaxed">
            ChickMagnet connects vetted commercial hatcheries, smallholder poultry farmers, and top HORECA buyers across East Africa. From day-old chick climate transport to chilled dressed chicken weight-tolerance packing, every transaction is backed by batch traceability and bio-security clearance.
          </p>
        </div>

        <div className="absolute right-4 bottom-4 opacity-10 text-9xl select-none font-serif">
          🐔
        </div>
      </div>

      {/* 4 Pillars of ChickMagnet */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            🐥
          </div>
          <h3 className="font-serif font-bold text-base text-emerald-950">Live Climate Transit</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ventilated, temperature-stabilized vehicles designed specifically for day-old chicks and point-of-lay pullets, reducing transit stress and mortality.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg">
            ❄️
          </div>
          <h3 className="font-serif font-bold text-base text-emerald-950">Cold-Chain Accuracy</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Air-chilled fresh dressed poultry (0-4°C) and frozen wings (-18°C) delivered with pre-authorization weight tolerance adjustments.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
            📜
          </div>
          <h3 className="font-serif font-bold text-base text-emerald-950">Batch Traceability</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every hatch and slaughter lot features a unique Batch ID detailing vaccination records, farm location, lay dates, and lab clearances.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-lg">
            🏢
          </div>
          <h3 className="font-serif font-bold text-base text-emerald-950">HORECA Net-30</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dedicated commercial procurement for hotels, restaurants, and butcheries with standing recurring contracts and automated invoicing.
          </p>
        </div>
      </div>

    </div>
  );
}
