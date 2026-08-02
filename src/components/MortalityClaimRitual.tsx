import React, { useState } from 'react';
import { X, HelpCircle, Upload, CheckCircle2, ShieldCheck, Scale, FileText, ArrowRight, DollarSign } from 'lucide-react';
import { MOCK_MORTALITY_CLAIMS } from '../data/products';
import { MortalityClaim } from '../types';

interface MortalityClaimRitualProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'claim' | 'invoice';
}

export default function MortalityClaimRitual({
  isOpen,
  onClose,
  initialTab = 'claim'
}: MortalityClaimRitualProps) {
  const [activeTab, setActiveTab] = useState<'claim' | 'invoice'>(initialTab);
  const [claims, setClaims] = useState<MortalityClaim[]>(MOCK_MORTALITY_CLAIMS);

  // Claim Form State
  const [orderId, setOrderId] = useState('ORD-2026-CHX88');
  const [batchId, setBatchId] = useState('BATCH-2026-CHX9');
  const [breed, setBreed] = useState('Kenbro Day-Old Chicks');
  const [affectedQty, setAffectedQty] = useState(2);
  const [description, setDescription] = useState('2 day-old chicks were found unviable upon box opening at transit drop-off.');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Post-Delivery Weight Adjustment Invoice Audit Mock Data
  const sampleWeightInvoices = [
    {
      id: 'INV-2026-8801',
      orderId: 'ORD-2026-CHX88',
      date: '2026-07-28',
      item: 'Air-Chilled Whole Dressed Broilers (Case of 5)',
      estimatedWeightKg: 10.0,
      estimatedPrice: 6500,
      actualScaleWeightKg: 9.55,
      actualPrice: 6207.50,
      adjustmentDifference: -292.50,
      status: 'refunded_to_mpesa'
    },
    {
      id: 'INV-2026-8742',
      orderId: 'ORD-2026-CHX42',
      date: '2026-07-22',
      item: 'Fresh Raw Chicken Wings (5kg Bucket)',
      estimatedWeightKg: 5.0,
      estimatedPrice: 3800,
      actualScaleWeightKg: 5.12,
      actualPrice: 3891.20,
      adjustmentDifference: 91.20,
      status: 'billed_from_preauth'
    }
  ];

  if (!isOpen) return null;

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const newClaim: MortalityClaim = {
      id: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId,
      batchId,
      breed,
      affectedQty: Number(affectedQty),
      incidentDate: new Date().toISOString().split('T')[0],
      photoEvidenceUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=400&q=80',
      description,
      status: 'approved_credit',
      refundAmount: Number(affectedQty) * 135,
      claimDate: new Date().toISOString().split('T')[0]
    };

    setClaims([newClaim, ...claims]);
    setSubmittedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#123524] text-amber-50 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-emerald-800 shadow-2xl relative p-5 sm:p-8 space-y-6">
        
        {/* Header & Post-Delivery Flow Navigation */}
        <div className="flex items-center justify-between border-b border-emerald-800 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Post-Delivery Resolution Portal
            </span>
            <h2 className="font-serif font-black text-xl text-amber-300 mt-0.5">
              After-the-Fact Order Services
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-900 text-emerald-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-[#0b2217] p-1.5 rounded-2xl border border-emerald-800 flex gap-2 text-xs">
          <button
            onClick={() => setActiveTab('claim')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'claim'
                ? 'bg-amber-400 text-emerald-950 shadow-md'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>24h Live Bird Mortality Claim</span>
          </button>

          <button
            onClick={() => setActiveTab('invoice')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'invoice'
                ? 'bg-amber-400 text-emerald-950 shadow-md'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Post-Delivery Scale Weight Invoices</span>
          </button>
        </div>

        {/* TAB 1: LIVE BIRD MORTALITY CLAIM FORM */}
        {activeTab === 'claim' && (
          <div className="space-y-4">
            {submittedSuccess ? (
              <div className="bg-[#0b2217] p-6 rounded-2xl border border-emerald-800 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-serif font-bold text-lg text-amber-300">Transit Claim Approved Instantly!</h3>
                <p className="text-xs text-emerald-200 font-mono max-w-md mx-auto">
                  Your mortality-in-transit claim for {affectedQty} bird(s) has been verified against transit climate telemetry logs. A credit refund of <strong>Ksh {(affectedQty * 135).toLocaleString()}</strong> has been posted to your account.
                </p>
                <button
                  onClick={() => setSubmittedSuccess(false)}
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 px-5 py-2.5 rounded-xl font-bold text-xs font-mono cursor-pointer"
                >
                  Submit Another Claim
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitClaim} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-emerald-300 font-mono mb-1">Order ID</label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full bg-[#0b2217] border border-emerald-700 rounded-xl px-3 py-2 text-amber-300 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-300 font-mono mb-1">Batch ID</label>
                    <input
                      type="text"
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      className="w-full bg-[#0b2217] border border-emerald-700 rounded-xl px-3 py-2 text-amber-300 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-300 font-mono mb-1">Breed / Type</label>
                    <input
                      type="text"
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      className="w-full bg-[#0b2217] border border-emerald-700 rounded-xl px-3 py-2 text-amber-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-300 font-mono mb-1">Affected Count (Unviable Birds)</label>
                    <input
                      type="number"
                      min="1"
                      value={affectedQty}
                      onChange={(e) => setAffectedQty(Number(e.target.value))}
                      className="w-full bg-[#0b2217] border border-emerald-700 rounded-xl px-3 py-2 text-amber-300 font-mono"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-emerald-300 font-mono mb-1">Description of Issue</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-[#0b2217] border border-emerald-700 rounded-xl px-3 py-2 text-amber-300"
                      required
                    />
                  </div>
                </div>

                {/* Photo Upload Simulator */}
                <div className="border-2 border-dashed border-emerald-700 bg-[#0b2217] p-4 rounded-2xl text-center text-xs space-y-1">
                  <Upload className="w-5 h-5 text-amber-400 mx-auto" />
                  <div className="text-emerald-200 font-bold">Photo Evidence Attached</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Image #CHX-LOG-9912.JPG • Timestamped within 24h window</div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider font-mono shadow-md cursor-pointer"
                >
                  Submit Transit Claim for Instant Store Credit
                </button>
              </form>
            )}

            {/* Claim History */}
            {claims.length > 0 && (
              <div className="pt-4 border-t border-emerald-800 space-y-2">
                <h4 className="font-bold text-xs text-amber-300 font-serif">Recent Claim Records</h4>
                <div className="space-y-2 text-xs font-mono">
                  {claims.map(c => (
                    <div key={c.id} className="bg-[#0b2217] p-3 rounded-xl border border-emerald-800 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-amber-300">{c.breed} ({c.affectedQty} birds)</div>
                        <div className="text-[10px] text-emerald-400">Order: {c.orderId} • Batch: {c.batchId}</div>
                      </div>
                      <div className="text-right">
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          Credit: Ksh {c.refundAmount?.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-slate-400">{c.claimDate}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: POST-DELIVERY SCALE WEIGHT INVOICE AUDIT */}
        {activeTab === 'invoice' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Scale-Weighed Final Packed Invoices</span>
              </div>
              <p className="text-[11px] text-emerald-300 leading-relaxed">
                Review actual packed scale weights vs initial estimates. Any differences are automatically refunded or adjusted on your card / M-Pesa account.
              </p>
            </div>

            <div className="space-y-3">
              {sampleWeightInvoices.map(inv => (
                <div key={inv.id} className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800 space-y-3">
                  <div className="flex justify-between items-center border-b border-emerald-800 pb-2">
                    <div>
                      <span className="font-bold text-amber-300 text-sm">{inv.id}</span>
                      <span className="text-[10px] text-emerald-400 ml-2">Order: {inv.orderId}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.adjustmentDifference < 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {inv.status === 'refunded_to_mpesa' ? 'Refund Processed' : 'Packed Charge'}
                    </span>
                  </div>

                  <div className="font-bold text-emerald-100">{inv.item}</div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] bg-[#123524] p-3 rounded-xl border border-emerald-800">
                    <div>
                      <span className="text-emerald-400 block text-[10px]">Estimated Weight</span>
                      <span className="text-white font-bold">{inv.estimatedWeightKg} kg</span>
                      <span className="block text-[10px] text-slate-400">(Ksh {inv.estimatedPrice.toLocaleString()})</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 block text-[10px]">Actual Packed Scale</span>
                      <span className="text-amber-300 font-bold">{inv.actualScaleWeightKg} kg</span>
                      <span className="block text-[10px] text-slate-400">(Ksh {inv.actualPrice.toLocaleString()})</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-emerald-400 block text-[10px]">Scale Adjustment</span>
                      <span className={`font-bold ${inv.adjustmentDifference < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {inv.adjustmentDifference < 0 ? `- Ksh ${Math.abs(inv.adjustmentDifference).toFixed(2)}` : `+ Ksh ${inv.adjustmentDifference.toFixed(2)}`}
                      </span>
                      <span className="block text-[10px] text-emerald-300">
                        {inv.adjustmentDifference < 0 ? 'Refunded' : 'Billed'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
