import React from 'react';
import { ArrowUp, ChevronRight, Phone, Mail, User, MapPin } from 'lucide-react';
import { useBrandLogo } from '../utils/cms';

interface FooterProps {
  onNavigate?: (tab: string, sectionId?: string) => void;
  onOpenSupport?: () => void;
}

export default function Footer({ onNavigate, onOpenSupport }: FooterProps) {
  const brand = useBrandLogo();
  const companyLinks = [
    { label: 'About ChickMagnet', action: () => onNavigate?.('about', 'about') },
    { label: 'Contact & Support Team', action: () => onOpenSupport ? onOpenSupport() : onNavigate?.('about', 'faqs') },
    { label: 'Frequently Asked Questions (FAQs)', action: () => onNavigate?.('about', 'faqs') },
    { label: 'Shop All Catalog', action: () => onNavigate?.('shop') },
    { label: 'Quality & Guarantees', action: () => onNavigate?.('about', 'quality-guarantees') },
  ];

  return (
    <footer className="w-full bg-[#0b2217] text-emerald-100 font-sans border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12">
        
        {/* Contact Us Card */}
        <div className="bg-[#123524] border border-emerald-800 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-full text-xs font-mono font-bold">
              <Phone className="w-3.5 h-3.5 text-amber-400" /> Direct Contact & Support
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-amber-300 font-serif">
              Contact Us
            </h3>
            <p className="text-xs text-emerald-200/90 max-w-lg">
              Have inquiries about day-old chick availability, custom incubator setups, or commercial wholesale orders in Kisii? Get in touch with us directly.
            </p>
          </div>

          <div className="w-full lg:w-auto bg-[#0b2217] border border-emerald-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center shrink-0 shadow-xs">
                <User className="w-5 h-5 text-emerald-950" />
              </div>
              <div>
                <div className="font-bold text-sm text-amber-300">Steve Logarn Ositu</div>
                <div className="text-emerald-300/80 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-amber-400" /> Kisii, Kenya
                </div>
              </div>
            </div>

            <div className="h-px sm:h-10 w-full sm:w-px bg-emerald-800 my-1 sm:my-0" />

            <div className="space-y-2 font-mono text-xs w-full sm:w-auto">
              <a 
                href="tel:254700356023" 
                className="flex items-center gap-2 text-emerald-100 hover:text-amber-300 transition-colors bg-emerald-950/60 hover:bg-emerald-900/80 px-3 py-1.5 rounded-lg border border-emerald-800/80"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-bold text-amber-300">254700356023</span>
              </a>
              <a 
                href="mailto:manyaos7@gmail.com" 
                className="flex items-center gap-2 text-emerald-100 hover:text-amber-300 transition-colors bg-emerald-950/60 hover:bg-emerald-900/80 px-3 py-1.5 rounded-lg border border-emerald-800/80"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>manyaos7@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="max-w-4xl">
          <div className="flex flex-col space-y-3">
            <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider border-b border-emerald-800 pb-2">
              Company & Hatchery
            </h4>
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {companyLinks.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      item.action();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-sm text-emerald-100 hover:text-amber-300 transition-colors text-left inline-flex items-center gap-2 group cursor-pointer font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-emerald-900 bg-[#071710] py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-emerald-300/70">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            {brand.logoType === 'image' && brand.logoImageUrl ? (
              <img src={brand.logoImageUrl} alt={brand.brandName || 'Logo'} className="h-7 max-w-[140px] object-contain rounded" />
            ) : (
              <span className="font-serif font-black text-amber-400 text-base">{brand.brandName || 'ChickMagnet'}</span>
            )}
            <span>© {new Date().getFullYear()} {brand.brandName || 'ChickMagnet'} Hatchery Ltd (Kisii, Kenya). All rights reserved.</span>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#123524] hover:bg-[#1a4a33] text-amber-300 hover:text-amber-200 rounded-full text-xs font-bold transition-colors cursor-pointer border border-emerald-800"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Back to top</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
