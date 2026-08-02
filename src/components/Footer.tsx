import React, { useState } from 'react';
import { Feather, ShieldCheck, Truck, Award, ChevronDown, ArrowUp } from 'lucide-react';

interface FooterProps {
  onNavigate?: (tab: any) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [openColumns, setOpenColumns] = useState<Record<number, boolean>>({});

  const toggleColumn = (idx: number) => {
    setOpenColumns(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const navColumns = [
    {
      title: 'Poultry Catalog',
      links: [
        { label: 'Live Chicks & Pullets', tab: 'shop' },
        { label: 'Hatching Eggs', tab: 'shop' },
        { label: 'Rare Breed Turkeys', tab: 'shop' },
        { label: 'Waterfowl & Ducks', tab: 'shop' },
        { label: 'Fresh & Processed Poultry', tab: 'shop' },
      ]
    },
    {
      title: 'Quality & Assurance',
      links: [
        { label: 'Live Arrival Guarantee', tab: 'about' },
        { label: 'NPIP Certification', tab: 'about' },
        { label: 'Biosecurity Standards', tab: 'about' },
        { label: 'Climate-Controlled Transit', tab: 'about' },
        { label: 'Batch Traceability Portal', tab: 'batch-traceability', isTool: true },
      ]
    },
    {
      title: 'Hatchery Info',
      links: [
        { label: 'About ChickMagnet', tab: 'about' },
        { label: 'Certified Partner Farms', tab: 'about' },
        { label: 'Breeder Resources', tab: 'about' },
        { label: 'Shipping Schedule', tab: 'about' },
        { label: 'Customer Reviews', tab: 'about' },
      ]
    },
    {
      title: 'Support & Accounts',
      links: [
        { label: 'Wholesale Orders & Net-30', tab: 'wholesale', isTool: true },
        { label: 'Mortality & Loss Claims', tab: 'mortality-claim', isTool: true },
        { label: 'Hatchability Calculator', tab: 'about', isTool: true },
        { label: 'Order Tracking', tab: 'cart', isTool: true },
        { label: 'FAQs & Support Team', tab: 'about' },
      ]
    }
  ];

  return (
    <footer className="w-full bg-[#0F172A] text-slate-300 font-sans border-t border-slate-800">
      {/* Top Banner */}
      <div className="bg-[#1E293B] border-b border-slate-800 py-3 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 text-xs font-medium">
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> 100% NPIP Certified Clean
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Truck className="w-4 h-4" /> Temperature-Controlled Live Express
            </span>
            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <Award className="w-4 h-4" /> 48-Hour Live Arrival Guarantee
            </span>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12">
        {/* Newsletter section */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-xl font-bold text-white flex items-center justify-center lg:justify-start gap-2">
              <Feather className="w-5 h-5 text-amber-400" /> Subscribe to ChickMagnet
            </h3>
            <p className="text-sm text-slate-400 max-w-xl">
              Get notified when rare breed batches hatch, receive seasonal care guides, and unlock subscriber discounts on bulk orders.
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            {subscribed ? (
              <div className="bg-emerald-950/60 border border-emerald-700/50 rounded-xl p-4 text-center text-emerald-300 text-sm font-medium">
                ✓ Thank you for subscribing! You will receive our next hatch dispatch.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm transition-colors shrink-0 cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {navColumns.map((col, idx) => (
            <div key={idx} className="flex flex-col">
              <button
                onClick={() => toggleColumn(idx)}
                className="flex items-center justify-between w-full text-left sm:cursor-default focus:outline-none pb-2 sm:pb-0"
              >
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {col.title}
                </h4>
                <ChevronDown className={`w-4 h-4 text-slate-400 sm:hidden transition-transform ${openColumns[idx] ? 'rotate-180' : ''}`} />
              </button>

              <ul className={`flex flex-col gap-2.5 mt-3 ${openColumns[idx] ? 'block' : 'hidden sm:flex'}`}>
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <button
                      onClick={() => {
                        if (onNavigate) onNavigate(link.tab);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-sm text-slate-400 hover:text-white transition-colors text-left inline-flex items-center gap-2 group cursor-pointer"
                    >
                      <span>{link.label}</span>
                      {link.isTool && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded group-hover:bg-amber-400/20 transition-colors">
                          Tool
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-[#0B1120] py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-bold text-amber-400 text-base">ChickMagnet</span>
            <span>© {new Date().getFullYear()} ChickMagnet Hatchery Inc. All rights reserved.</span>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 rounded-full text-xs font-medium transition-colors cursor-pointer border border-slate-700"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Back to top</span>
          </button>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-400">
            <span>NPIP Permit #47-9201</span>
            <span>USPS Live Animal Transit Approved</span>
            <span>USDA Inspected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
