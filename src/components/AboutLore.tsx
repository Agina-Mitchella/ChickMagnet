import React, { useState } from 'react';
import { ShieldCheck, Truck, Activity, Award, CheckCircle2, HelpCircle, ChevronDown, Lock } from 'lucide-react';

export default function AboutLore() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does ChickMagnet guarantee 100% Live Arrival for Day-Old Chicks?',
      a: 'Chicks are packed in specially ventilated, temperature-insulated transport boxes with extra thermal bedding and nutrient gel. In the rare event of mortality, our 24-48 hour Live Arrival Guarantee provides instant credit or replacement.'
    },
    {
      q: 'What bio-security measures are taken at partner hatcheries?',
      a: 'All partner hatcheries undergo monthly blood tests and bio-security audits by certified veterinary officers (DVS & KEBS). Every batch is assigned a unique Batch ID detailing parent flock health, vaccination history, and lay dates.'
    },
    {
      q: 'How does Wholesale Net-30 work for commercial buyers?',
      a: 'Verified HORECA businesses (hotels, butcheries, institutions) can apply for Net-30 credit terms. Once approved, standing recurring orders are dispatched automatically with 30-day payment invoicing.'
    },
    {
      q: 'How are fresh dressed poultry weights handled for billing?',
      a: 'Fresh dressed birds vary slightly in scale weight. Cards or mobile money payments are pre-authorized, and final billing is automatically adjusted down to the exact packed scale weight at cold-chain packing.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-emerald-950 font-sans">
      
      {/* 1. Hero Banner: About ChickMagnet */}
      <div id="about" className="bg-gradient-to-r from-[#123524] to-[#0b2217] text-amber-50 rounded-3xl p-8 sm:p-12 border border-emerald-800 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 font-mono text-xs px-3 py-1 rounded-full border border-amber-500/30">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            📍 Headquartered in Kisii, Kenya • KEBS & DVS Bio-Secure Certified
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl font-black text-amber-300 tracking-tight leading-tight">
            ChickMagnet: Kisii's Premier Modern Poultry & Hatchery Hub
          </h1>

          <p className="text-sm text-emerald-200 leading-relaxed">
            Based in Kisii, Kenya, ChickMagnet connects vetted commercial hatcheries, smallholder poultry farmers, and top HORECA buyers across East Africa. From day-old chick climate transport originating from our Kisii hatchery facilities to chilled dressed chicken weight-tolerance packing, every transaction is backed by batch traceability and bio-security clearance.
          </p>
        </div>

        <div className="absolute right-4 bottom-4 opacity-10 text-9xl select-none font-serif">
          🐔
        </div>
      </div>

      {/* 4 Pillars of ChickMagnet */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            🐥
          </div>
          <h3 className="font-serif font-bold text-base text-emerald-950">Live Bird Transport</h3>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Ventilated, temperature-stabilized vehicles designed specifically for day-old chicks and point-of-lay pullets, reducing transit stress and mortality.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            ❄️
          </div>
          <h3 className="font-serif font-bold text-base text-emerald-950">Cold-Chain Accuracy</h3>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Air-chilled fresh dressed poultry (0-4°C) and frozen cuts (-18°C) delivered with scale-weight accuracy and cold-chain integrity.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
            📜
          </div>
          <h3 className="font-serif font-bold text-base text-emerald-950">Batch Traceability</h3>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Every hatch and slaughter lot features a unique Batch ID detailing vaccination records, farm location, lay dates, and lab clearances.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            🏢
          </div>
          <h3 className="font-serif font-bold text-base text-emerald-950">HORECA Net-30</h3>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Dedicated commercial procurement for hotels, restaurants, and butcheries with standing recurring contracts and automated invoicing.
          </p>
        </div>
      </div>

      {/* 2. CONSOLIDATED PAGE: Quality & Guarantees */}
      <div id="quality-guarantees" className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-xs space-y-8 scroll-mt-8">
        <div className="border-b border-emerald-200 pb-4">
          <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider block mb-1">Unified Assurance Policy</span>
          <h2 className="font-serif text-2xl font-bold text-emerald-950 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>Quality, Biosecurity & Live Arrival Guarantees</span>
          </h2>
          <p className="text-xs text-emerald-800 mt-1">
            Consolidated standards governing live chick transit, hatchery bio-security, KEBS/DVS certifications, and climate transport schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section A: Live Arrival Guarantee */}
          <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-2">
            <h3 className="font-serif font-bold text-base text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>48-Hour Live Arrival Guarantee</span>
            </h3>
            <p className="text-xs text-emerald-900 leading-relaxed">
              We guarantee 100% viable live arrival for all day-old chick and pullet shipments. If any loss occurs during transit or within 24–48 hours of box opening, submit photo evidence to receive immediate account credit or replacement stock.
            </p>
          </div>

          {/* Section B: Biosecurity & NPIP / DVS Standards */}
          <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-2">
            <h3 className="font-serif font-bold text-base text-emerald-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>Bio-Security & DVS Certification</span>
            </h3>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Parent flocks are tested clean for Avian Influenza, Salmonella Pullorum, and Newcastle Disease. Every box is issued official Department of Veterinary Services (DVS) transit clearance permits before leaving the hatchery.
            </p>
          </div>

          {/* Section C: Climate-Controlled Express Transit */}
          <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 space-y-2">
            <h3 className="font-serif font-bold text-base text-amber-950 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-700" />
              <span>Climate-Controlled Express Vehicles</span>
            </h3>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Day-old chicks travel in temperature-regulated, oxygen-circulated vans at an optimal 32°C–34°C. Fresh dressed poultry is transported in dedicated 0°C–4°C refrigerated cold-chain vehicles.
            </p>
          </div>

          {/* Section D: Hatchery Dispatch & Shipping Schedule */}
          <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-2">
            <h3 className="font-serif font-bold text-base text-emerald-950 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-700" />
              <span>Hatchery Dispatch & Delivery Schedule</span>
            </h3>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Chicks hatch every Tuesday and Friday morning at our Kisii central hatchery and are dispatched within 6 hours of hatching to ensure maximum vitality. Direct regional climate express drop-offs serve Kisii County, Nairobi, Eldoret, Kisumu, Kitale, and Nakuru routes.
            </p>
          </div>

        </div>
      </div>

      {/* 3. FAQs & Support Team */}
      <div id="faqs" className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-xs space-y-6 scroll-mt-8">
        <div className="border-b border-emerald-200 pb-4">
          <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider block mb-1">Help & Information</span>
          <h2 className="font-serif text-2xl font-bold text-emerald-950 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-emerald-700" />
            <span>Frequently Asked Questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="border border-emerald-200 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4 bg-emerald-50/60 hover:bg-emerald-100/70 flex items-center justify-between gap-4 font-serif font-bold text-sm text-emerald-950 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-emerald-700 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="p-4 bg-white text-xs text-emerald-900 leading-relaxed border-t border-emerald-200">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Terms & Privacy Policy Section */}
      <div id="terms-privacy" className="bg-emerald-50/80 rounded-3xl border border-emerald-200 p-8 space-y-6 scroll-mt-8">
        <div className="border-b border-emerald-200 pb-4">
          <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider block mb-1">Legal & Operational Governance</span>
          <h2 className="font-serif text-xl font-bold text-emerald-950 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-700" />
            <span>Terms of Service & Privacy Protection</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-emerald-900 leading-relaxed">
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 space-y-2">
            <h3 className="font-bold text-emerald-950 text-sm">Terms of Service Overview</h3>
            <p>
              By placing an order on ChickMagnet, buyers agree to abide by bio-security receiving procedures, including inspecting live chick boxes upon arrival and reporting any discrepancies within 24–48 hours. Wholesale Net-30 accounts agree to settle commercial invoices within agreed 30-day payment windows.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200 space-y-2">
            <h3 className="font-bold text-emerald-950 text-sm">Privacy & Data Security</h3>
            <p>
              ChickMagnet safeguards buyer delivery addresses, phone numbers, M-Pesa transaction identifiers, and commercial invoicing records under strict data protection guidelines. We do not sell user data to third parties.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
