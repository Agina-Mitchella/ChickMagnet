import React, { useState } from 'react';
import { User, Package, ShieldCheck, FileText, Activity, Truck, AlertTriangle, Calculator, ChevronRight, CheckCircle2, Clock, Search, ExternalLink, LayoutDashboard, Settings, Crown, Layers } from 'lucide-react';
import { BuyerType } from '../types';

interface AccountDashboardProps {
  currentUser?: { name: string; email: string; buyerType?: BuyerType; role?: string } | null;
  buyerType: BuyerType;
  userOrders?: any[];
  onOpenTraceability: (batchId?: string) => void;
  onOpenWholesale: () => void;
  onOpenClaims: () => void;
  onNavigateToShop: () => void;
  onOpenAdmin?: () => void;
  onOpenBusinessPlan?: () => void;
  onSwitchRole?: (newRole: 'ADMIN' | 'BUYER' | 'KEEPER') => void;
}

export default function AccountDashboard({
  currentUser,
  buyerType,
  userOrders = [],
  onOpenTraceability,
  onOpenWholesale,
  onOpenClaims,
  onNavigateToShop,
  onOpenAdmin,
  onOpenBusinessPlan,
  onSwitchRole
}: AccountDashboardProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'tools' | 'calculator'>('orders');
  
  // Calculator State
  const [eggCount, setEggCount] = useState<number>(100);
  const [hatchRate, setHatchRate] = useState<number>(85);
  const [mortalityRate, setMortalityRate] = useState<number>(3);

  // Mock Active & Past Orders
  const sampleOrders = [
    {
      id: 'ORD-2026-CHX88',
      date: '2026-08-01',
      items: '100x Kenbro Day-Old Chicks (Vaccinated)',
      status: 'In Transit',
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      total: 13500,
      batchId: 'BATCH-2026-CHX9',
      fulfillment: 'Live Climate Express',
      eta: 'Today, 2:30 PM'
    },
    {
      id: 'ORD-2026-EG910',
      date: '2026-07-28',
      items: '5 Trays Fertile Kienyeji Hatching Eggs (150 Eggs)',
      status: 'Delivered',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      total: 6000,
      batchId: 'BATCH-2026-EG30',
      fulfillment: 'Chilled Express Van',
      eta: 'Delivered Jul 29'
    }
  ];

  const userDisplayName = currentUser?.name || 'Agina';
  const userEmail = currentUser?.email || 'uxagina@gmail.com';
  const effectiveBuyerType = currentUser?.buyerType || buyerType;
  const userRole = currentUser?.role || 'ADMIN';
  const isAdmin = userRole === 'ADMIN' || userEmail.toLowerCase() === 'uxagina@gmail.com' || userEmail.toLowerCase().includes('admin') || userEmail.toLowerCase() === 'manyaos7@gmail.com';

  // Hatchability Calculator Logic
  const expectedChicks = Math.floor(eggCount * (hatchRate / 100));
  const expectedSurvivingPoultry = Math.floor(expectedChicks * (1 - mortalityRate / 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-emerald-950 font-sans">
      
      {/* Account Banner */}
      <div className="bg-gradient-to-r from-[#123524] via-[#0b2217] to-[#17442f] text-amber-50 rounded-3xl p-6 sm:p-8 border border-emerald-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-2xl shadow-lg border-2 border-amber-300">
              {isAdmin ? '👑' : userDisplayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-black text-amber-300">{userDisplayName}</h1>
                <span className="bg-amber-400 text-emerald-950 text-[10px] font-mono uppercase font-black px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  <span>Role: {userRole}</span>
                </span>
                <span className="bg-emerald-800/80 text-amber-300 text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full border border-emerald-700">
                  {effectiveBuyerType === 'wholesale' ? '🏢 Commercial Wholesale (Net-30)' : '🐥 Retail & Homesteader'}
                </span>
              </div>
              <p className="text-xs text-emerald-300/90 font-mono mt-1">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap self-stretch md:self-auto">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-102"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Open Admin Dashboard</span>
              </button>
            )}

            {onOpenBusinessPlan && (
              <button
                onClick={onOpenBusinessPlan}
                className="bg-[#0b2217] hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Farm Plan</span>
              </button>
            )}

            <button
              onClick={onNavigateToShop}
              className="bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700 text-amber-200 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Shop Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Relocated Order Tools Navigation Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-emerald-950 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-700" />
            <span>Order & Farm Management Tools</span>
          </h2>
          <span className="text-xs text-emerald-800 font-mono font-bold">Account Context Tools</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Tool 0: Admin Dashboard Portal */}
          <div 
            onClick={onOpenAdmin}
            className="bg-gradient-to-br from-amber-50 to-amber-100/60 border-2 border-amber-400/80 hover:border-amber-500 p-5 rounded-2xl shadow-sm transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-xs">
              <LayoutDashboard className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-emerald-950 group-hover:text-amber-900 flex items-center justify-between">
                <span>Admin & CMS Control</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-800 group-hover:text-amber-950" />
              </h3>
              <p className="text-xs text-emerald-900/90 mt-1 leading-relaxed">
                Manage live products, orders, pricing, brand logos, CMS announcements, and inventory.
              </p>
            </div>
            <span className="inline-block text-[10px] font-mono font-black text-amber-950 bg-amber-300/80 px-2 py-0.5 rounded border border-amber-400">
              Master Admin Mode
            </span>
          </div>

          {/* Tool 1: Batch Traceability */}
          <div 
            onClick={() => onOpenTraceability()}
            className="bg-white hover:bg-emerald-50/80 border border-emerald-200 p-5 rounded-2xl shadow-xs transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              🔍
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-emerald-950 group-hover:text-emerald-800 flex items-center justify-between">
                <span>Batch Traceability</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:text-emerald-800" />
              </h3>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Look up batch IDs for vaccination records, hatch dates, lay dates, and lab clearances.
              </p>
            </div>
            <span className="inline-block text-[10px] font-mono font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded">
              Bio-Security Clearance
            </span>
          </div>

          {/* Tool 2: Mortality & Claims */}
          <div 
            onClick={onOpenClaims}
            className="bg-white hover:bg-rose-50/80 border border-emerald-200 hover:border-rose-300 p-5 rounded-2xl shadow-xs transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              📜
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-emerald-950 group-hover:text-rose-900 flex items-center justify-between">
                <span>Mortality Claims</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:text-rose-700" />
              </h3>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Submit claims for transit mortality within 24–48 hours of box arrival with photo evidence.
              </p>
            </div>
            <span className="inline-block text-[10px] font-mono font-bold text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded">
              Live Arrival Policy
            </span>
          </div>

          {/* Tool 3: Wholesale Portal */}
          <div 
            onClick={onOpenWholesale}
            className="bg-white hover:bg-amber-50/80 border border-emerald-200 hover:border-amber-300 p-5 rounded-2xl shadow-xs transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              🏢
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-emerald-950 group-hover:text-amber-900 flex items-center justify-between">
                <span>Wholesale & Net-30</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:text-amber-700" />
              </h3>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Manage standing recurring orders, credit limits, and Net-30 commercial invoices.
              </p>
            </div>
            <span className="inline-block text-[10px] font-mono font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
              Commercial Credit
            </span>
          </div>

          {/* Tool 4: Hatchability Calculator */}
          <div 
            onClick={() => setActiveTab('calculator')}
            className="bg-white hover:bg-emerald-50/80 border border-emerald-200 p-5 rounded-2xl shadow-xs transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              🧮
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-emerald-950 group-hover:text-emerald-800 flex items-center justify-between">
                <span>Hatch Calculator</span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-600 group-hover:text-emerald-800" />
              </h3>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Calculate expected chick yields and brood survival rates from fertile hatching egg orders.
              </p>
            </div>
            <span className="inline-block text-[10px] font-mono font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded">
              Farm Planning Tool
            </span>
          </div>

        </div>
      </div>

      {/* Section View Tabs: Orders vs Yield Calculator */}
      <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex border-b border-emerald-200 gap-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 font-serif font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'border-emerald-800 text-emerald-950'
                : 'border-transparent text-emerald-700 hover:text-emerald-950'
            }`}
          >
            Recent Orders & Live Tracking ({sampleOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`pb-3 font-serif font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'border-emerald-800 text-emerald-950'
                : 'border-transparent text-emerald-700 hover:text-emerald-950'
            }`}
          >
            🧮 Hatchability & Yield Calculator
          </button>
        </div>

        {/* Tab 1: Orders & Tracking */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {[...userOrders, ...sampleOrders].map(order => (
              <div 
                key={order.id} 
                className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-emerald-950">{order.id}</span>
                    <span className="text-xs text-emerald-800 font-mono">• {order.date}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="font-medium text-sm text-emerald-950">{order.items}</div>
                  
                  <div className="text-xs text-emerald-800 flex flex-wrap items-center gap-3 bg-white/70 p-2.5 rounded-xl border border-emerald-200/80">
                    <span>Fulfillment: <strong className="text-emerald-950">{order.fulfillment}</strong></span>
                    <span className="text-emerald-300">•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <span>Assigned Delivery Window:</span>
                      <strong className="text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-[11px]">
                        {order.eta}
                      </strong>
                    </span>
                  </div>

                  {order.deliverySlots && Object.keys(order.deliverySlots).length > 1 && (
                    <div className="text-[11px] font-mono space-y-1 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80">
                      <div className="font-bold text-amber-950">Dispatched Vehicle Slots:</div>
                      {Object.entries(order.deliverySlots).map(([grp, slot]: any) => (
                        <div key={grp} className="flex justify-between text-emerald-900">
                          <span className="uppercase font-bold text-[10px]">
                            {grp === 'live-climate' ? '🐥 Live Transport' : grp === 'chilled-express' ? '❄️ Chilled Van' : grp === 'frozen-deep' ? '🧊 Deep Freeze' : '📦 Dry Goods'}:
                          </span>
                          <span className="font-bold text-amber-900">{slot}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  <button
                    onClick={() => onOpenTraceability(order.batchId)}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer flex items-center gap-1 border border-emerald-300"
                  >
                    <span>Trace Batch</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={onOpenClaims}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-950 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer border border-rose-300"
                  >
                    Claim Loss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Hatchability & Yield Calculator */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-base text-emerald-950">
                Fertile Egg Hatchability Estimator
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Enter your batch quantity to estimate expected hatched chicks based on verified ChickMagnet breeding egg viability metrics.
              </p>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-emerald-950 font-bold mb-1">Fertile Eggs Incubated:</label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={eggCount}
                    onChange={(e) => setEggCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl font-bold text-emerald-950 focus:outline-none focus:border-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-emerald-950 font-bold mb-1">Estimated Hatchability Rate (%):</label>
                  <input
                    type="number"
                    min="50"
                    max="99"
                    value={hatchRate}
                    onChange={(e) => setHatchRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl font-bold text-emerald-950 focus:outline-none focus:border-emerald-800"
                  />
                  <p className="text-[10px] text-emerald-700 mt-0.5">ChickMagnet Fertile Egg Average: 85%–92%</p>
                </div>

                <div>
                  <label className="block text-emerald-950 font-bold mb-1">Expected Brood Mortality Buffer (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={mortalityRate}
                    onChange={(e) => setMortalityRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl font-bold text-emerald-950 focus:outline-none focus:border-emerald-800"
                  />
                </div>
              </div>
            </div>

            {/* Calculator Results Box */}
            <div className="bg-[#123524] text-amber-50 rounded-2xl p-6 border border-emerald-800 space-y-4">
              <h4 className="font-serif font-bold text-lg text-amber-300 border-b border-emerald-800 pb-2">
                Projected Hatch Output
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-[#0b2217] p-3 rounded-xl border border-emerald-800">
                  <span className="text-emerald-400 block text-[10px] uppercase font-bold">Hatched Chicks</span>
                  <strong className="text-2xl text-amber-300 font-serif">{expectedChicks}</strong>
                  <span className="text-[10px] text-emerald-300/80 block mt-0.5">from {eggCount} eggs</span>
                </div>

                <div className="bg-[#0b2217] p-3 rounded-xl border border-emerald-800">
                  <span className="text-emerald-400 block text-[10px] uppercase font-bold">Mature Flock Target</span>
                  <strong className="text-2xl text-emerald-300 font-serif">{expectedSurvivingPoultry}</strong>
                  <span className="text-[10px] text-emerald-300/80 block mt-0.5">at {100 - mortalityRate}% survival</span>
                </div>
              </div>

              <div className="bg-[#071710] p-3 rounded-xl border border-emerald-800 text-[11px] text-emerald-200 leading-relaxed">
                💡 <strong>Incubation Tip:</strong> Store fertile hatching eggs between 12°C–15°C before setting. Turn eggs 3-5 times daily for optimal embryo development.
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
