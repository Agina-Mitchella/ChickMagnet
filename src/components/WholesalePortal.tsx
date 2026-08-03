import React, { useState } from 'react';
import { X, FileText, CheckCircle2, Calendar, Award, CreditCard, Download, Plus, RefreshCw } from 'lucide-react';
import { MOCK_WHOLESALE_ORDERS } from '../data/products';
import { WholesaleStandingOrder } from '../types';

interface WholesalePortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WholesalePortal({
  isOpen,
  onClose
}: WholesalePortalProps) {
  const [standingOrders, setStandingOrders] = useState<WholesaleStandingOrder[]>(MOCK_WHOLESALE_ORDERS);
  const [newOrderModal, setNewOrderModal] = useState(false);
  
  // New Standing Order Form
  const [businessName, setBusinessName] = useState('Safari Park Hotel & Casino');
  const [contactPerson, setContactPerson] = useState('Executive Chef Antonio');
  const [frequency, setFrequency] = useState<'weekly' | 'bi-weekly' | 'monthly'>('weekly');
  const [itemsSummary, setItemsSummary] = useState('300x Dressed Chicken (1.5kg), 100kg Fresh Raw Wings');

  if (!isOpen) return null;

  const handleAddStandingOrder = () => {
    const newOrd: WholesaleStandingOrder = {
      id: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
      businessName,
      contactPerson,
      email: 'procurement@safaripark.co.ke',
      frequency,
      itemsSummary,
      nextDeliveryDate: '2026-08-05',
      monthlySpendKsh: 420000,
      paymentTerms: 'NET-30 Invoiced',
      status: 'active'
    };

    setStandingOrders([newOrd, ...standingOrders]);
    setNewOrderModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#123524] text-amber-50 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-emerald-800 shadow-2xl relative p-5 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-emerald-950 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-black text-xl text-amber-300">
                ChickMagnet Wholesale & HORECA Portal
              </h2>
              <p className="text-xs text-emerald-300 font-mono">
                Net-30 Invoiced Accounts • Standing Order Subscriptions • Bulk Tier Savings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-900 text-emerald-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Commercial Credit Status Banner */}
        <div className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="space-y-1">
            <div className="text-emerald-400 font-bold uppercase text-[11px]">Approved Credit Limit</div>
            <div className="text-amber-300 font-serif font-black text-2xl">Ksh 500,000</div>
            <div className="text-emerald-300 text-[10px]">Net-30 Invoicing Terms Active • 0% Interest</div>
          </div>

          <div className="space-y-1 text-right">
            <div className="text-emerald-400 font-bold uppercase text-[11px]">Active Standing Subscriptions</div>
            <div className="text-white font-bold text-lg">{standingOrders.length} Recurring Contracts</div>
            <div className="text-emerald-300 text-[10px]">Weekly Auto-Fulfillment Scheduled</div>
          </div>
        </div>

        {/* Standing Orders Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2 font-serif">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              Active Standing Orders (Auto-Recurring Deliveries)
            </h3>
            <button
              onClick={() => setNewOrderModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-emerald-950 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Standing Template</span>
            </button>
          </div>

          {/* List of Orders */}
          <div className="space-y-3">
            {standingOrders.map(order => (
              <div key={order.id} className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-300 text-sm font-serif">{order.businessName}</span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/40">
                      {order.id}
                    </span>
                  </div>
                  <div className="text-emerald-200 font-mono text-[11px]">{order.itemsSummary}</div>
                  <div className="text-emerald-300/80 text-[10px] font-mono">Contact: {order.contactPerson} ({order.email})</div>
                </div>

                <div className="text-right space-y-1 font-mono text-[11px]">
                  <div className="text-amber-300 font-bold">Ksh {order.monthlySpendKsh.toLocaleString()} / mo</div>
                  <div className="text-emerald-300">Next Slot: {order.nextDeliveryDate}</div>
                  <span className="inline-block bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold text-[10px]">
                    {order.paymentTerms}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal for Creating Standing Template */}
        {newOrderModal && (
          <div className="bg-[#0b2217] p-5 rounded-2xl border border-amber-500/40 space-y-3">
            <h4 className="font-bold text-sm text-amber-300 font-serif">Setup New Standing Contract Template</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-emerald-300 font-mono mb-1">HORECA Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-[#123524] border border-emerald-700 rounded-xl px-3 py-2 text-amber-50"
                />
              </div>
              <div>
                <label className="block text-emerald-300 font-mono mb-1">Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full bg-[#123524] border border-emerald-700 rounded-xl px-3 py-2 text-amber-50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-emerald-300 font-mono mb-1">Standing Items & Quantities</label>
                <input
                  type="text"
                  value={itemsSummary}
                  onChange={(e) => setItemsSummary(e.target.value)}
                  className="w-full bg-[#123524] border border-emerald-700 rounded-xl px-3 py-2 text-amber-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setNewOrderModal(false)}
                className="px-4 py-2 bg-[#123524] text-emerald-300 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStandingOrder}
                className="px-4 py-2 bg-amber-500 text-emerald-950 font-bold rounded-xl text-xs"
              >
                Save Contract Template
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
