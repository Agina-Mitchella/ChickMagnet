import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Wheat, 
  ShieldAlert, 
  ClipboardList, 
  CheckCircle2, 
  Truck, 
  DollarSign, 
  Sparkles, 
  Info, 
  Calendar, 
  PhoneCall, 
  Copy, 
  Check, 
  X,
  AlertTriangle,
  Scale,
  Thermometer,
  Feather
} from 'lucide-react';

interface BusinessPlanHubProps {
  onClose?: () => void;
}

export default function BusinessPlanHub({ onClose }: BusinessPlanHubProps) {
  const [activeTab, setActiveTab] = useState<'snapshot' | 'feed' | 'vaccines' | 'equipment' | 'sops' | 'marketing'>('snapshot');

  // Profit Calculator State
  const [remainingCostR, setRemainingCostR] = useState<number>(500); // Ksh per bird
  const [targetProfitTier, setTargetProfitTier] = useState<number>(80000); // 69k, 80k, 104k
  const sunkCost = 346788;
  const initialPlaced = 600;
  const currentLive = 570;
  const conservativeSaleable = 542; // ~5% future mortality margin

  // Formula: Required total revenue = Sunk Cost + Target Profit + (Saleable Birds * Remaining Cost R)
  const totalRemainingCost = conservativeSaleable * remainingCostR;
  const requiredTotalRevenue = sunkCost + targetProfitTier + totalRemainingCost;
  const requiredPricePerBird = Math.round(requiredTotalRevenue / conservativeSaleable);

  // Starter Feed Inventory
  const [starterBagsOnHand, setStarterBagsOnHand] = useState<number>(5.5);
  const starterKgOnHand = starterBagsOnHand * 50; // 275 kg
  const starterDaysCovered = Math.round(starterKgOnHand / (currentLive * 0.035)); // ~14 days

  // Marketing Pitch Copy State
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [locationName, setLocationName] = useState('Naivasha Farm');
  const [introPrice, setIntroPrice] = useState(requiredPricePerBird);
  const [deliveryRadius, setDeliveryRadius] = useState('25');

  const pitchScript = `Hi, we're supplying improved kienyeji birds from ${locationName}. We harvest every Friday and Saturday, dressed or live. Average dressed weight is 1.3–1.6 kg, with excellent flavor and consistent quality. Intro price is Ksh. ${introPrice} per bird. Can I book you for 50–100 birds? We deliver within ${deliveryRadius} km.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pitchScript);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8 selection:bg-amber-400 selection:text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#0b2217] to-slate-900 border border-emerald-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Integrated Farm Business Plan & Operations Hub
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                600-Flock Improved Kienyeji Operational Command
              </h1>
              <p className="text-emerald-200/80 text-sm mt-1">
                Real-time target pricing matrix, feed inventory SOP, vaccination calendar, and daily attendant checklists based on your master farm plan.
              </p>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer border border-slate-700 flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Exit Hub Preview
              </button>
            )}
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-800/60">
            <div className="bg-slate-900/80 border border-emerald-900/60 p-3.5 rounded-xl">
              <span className="text-xs text-emerald-400 font-medium block">Current Flock Status</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-bold text-white">{currentLive}</span>
                <span className="text-xs text-slate-400">/ {initialPlaced} live</span>
              </div>
              <span className="text-[11px] text-emerald-300/80 mt-0.5 block">30 mortalities (5% loss)</span>
            </div>

            <div className="bg-slate-900/80 border border-emerald-900/60 p-3.5 rounded-xl">
              <span className="text-xs text-amber-400 font-medium block">Sunk Cash Invested</span>
              <div className="text-xl font-bold text-amber-300 mt-1">Ksh. {sunkCost.toLocaleString()}</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Feed, housing & chicks</span>
            </div>

            <div className="bg-slate-900/80 border border-emerald-900/60 p-3.5 rounded-xl">
              <span className="text-xs text-emerald-400 font-medium block">Conservative Saleable</span>
              <div className="text-xl font-bold text-white">~{conservativeSaleable} birds</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Allows +5% future buffer</span>
            </div>

            <div className="bg-slate-900/80 border border-emerald-900/60 p-3.5 rounded-xl">
              <span className="text-xs text-amber-400 font-medium block">Target Price / Bird</span>
              <div className="text-xl font-bold text-amber-400 mt-1">Ksh. {requiredPricePerBird}</div>
              <span className="text-[11px] text-amber-200/80 mt-0.5 block">Achieves Ksh. {(targetProfitTier/1000).toFixed(0)}k profit</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'snapshot', label: '0) Financials & Target Price', icon: Calculator },
            { id: 'feed', label: '1) Feed Plan & Starter Inventory', icon: Wheat },
            { id: 'vaccines', label: '2) Vaccination & Health Schedule', icon: ShieldAlert },
            { id: 'equipment', label: '3) Housing & Equipment Guide', icon: Scale },
            { id: 'sops', label: '4) Attendant SOP & Daily Timetable', icon: ClipboardList },
            { id: 'marketing', label: '5) Sales & Pitch Script', icon: PhoneCall },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 0: FINANCIAL SNAPSHOT & TARGET PRICING */}
        {activeTab === 'snapshot' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Interactive Calculator */}
              <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Target Pricing Calculator (Business Plan Equation)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Adjust remaining cost per bird to finish (feed, meds, power, labor, dressing) and profit goal to calculate exact required sale price.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
                  {/* Remaining Cost R Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Remaining Cost "R" / Bird:</span>
                      <span className="text-amber-400 font-bold text-sm">Ksh. {remainingCostR}</span>
                    </div>
                    <input 
                      type="range" 
                      min={300} 
                      max={700} 
                      step={25}
                      value={remainingCostR}
                      onChange={(e) => setRemainingCostR(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Ksh. 300 (low cost)</span>
                      <span>Ksh. 500 (standard plan)</span>
                      <span>Ksh. 700 (high dressing)</span>
                    </div>
                  </div>

                  {/* Target Profit Select */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-medium block">Desired Profit Tier:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { amount: 69000, label: '+Ksh 69k (20%)' },
                        { amount: 80000, label: '+Ksh 80k (23%)' },
                        { amount: 104000, label: '+Ksh 104k (30%)' }
                      ].map(tier => (
                        <button
                          key={tier.amount}
                          onClick={() => setTargetProfitTier(tier.amount)}
                          className={`px-2 py-2 rounded-lg text-xs font-bold transition ${
                            targetProfitTier === tier.amount 
                              ? 'bg-amber-500 text-slate-950' 
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {tier.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calculated Result Breakdown */}
                <div className="bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-600/50 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-xs text-emerald-300 uppercase tracking-wider font-bold">Recommended Farm-Gate Target Price</span>
                      <div className="text-3xl font-extrabold text-amber-300 mt-1">
                        Ksh. {requiredPricePerBird.toLocaleString()} <span className="text-sm font-normal text-slate-300">/ bird</span>
                      </div>
                    </div>
                    <div className="bg-emerald-900/60 border border-emerald-500/40 px-3 py-2 rounded-lg text-xs text-emerald-200">
                      Target Range: <strong className="text-white">Ksh. 1,300 – 1,350</strong> (Up to Ksh. 1,650 if dressed)
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-3 border-t border-emerald-800/60">
                    <div>
                      <span className="text-slate-400 block">Total Revenue Goal:</span>
                      <span className="font-bold text-white">Ksh. {requiredTotalRevenue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Remaining Costs Total:</span>
                      <span className="font-bold text-white">Ksh. {totalRemainingCost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Net Profit Realized:</span>
                      <span className="font-bold text-emerald-400">Ksh. {targetProfitTier.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Business Plan Matrix Table */}
                <div>
                  <h4 className="text-sm font-bold text-slate-200 mb-2">Master Business Plan Price Matrix (Reference Table)</h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-700">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead className="bg-slate-900 text-slate-200 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Remaining Cost R/bird</th>
                          <th className="p-3 text-emerald-400">+Ksh. 69k profit</th>
                          <th className="p-3 text-amber-400 bg-amber-500/10">+Ksh. 80k profit</th>
                          <th className="p-3 text-emerald-300">+Ksh. 104k profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/60 bg-slate-800/40">
                        <tr className={remainingCostR === 400 ? 'bg-emerald-900/30' : ''}>
                          <td className="p-3 font-semibold">Ksh. 400</td>
                          <td className="p-3">Ksh. 1,188</td>
                          <td className="p-3 font-bold text-white">Ksh. 1,208</td>
                          <td className="p-3">Ksh. 1,252</td>
                        </tr>
                        <tr className={remainingCostR === 500 ? 'bg-emerald-900/40 font-bold text-white' : ''}>
                          <td className="p-3 font-semibold text-amber-300">Ksh. 500 (Target R)</td>
                          <td className="p-3">Ksh. 1,293</td>
                          <td className="p-3 text-amber-300 bg-amber-500/10">Ksh. 1,313</td>
                          <td className="p-3 text-emerald-300">Ksh. 1,358</td>
                        </tr>
                        <tr className={remainingCostR === 600 ? 'bg-emerald-900/30' : ''}>
                          <td className="p-3 font-semibold">Ksh. 600</td>
                          <td className="p-3">Ksh. 1,398</td>
                          <td className="p-3 font-bold text-white">Ksh. 1,418</td>
                          <td className="p-3">Ksh. 1,463</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Action Directives Card */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-amber-400" />
                    Business Plan Key Takeaways
                  </h3>

                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80">
                      <strong className="text-amber-300 block mb-1">Target Action Rule:</strong>
                      Keep remaining costs <span className="text-white font-bold">R ≤ 500/bird</span> and target <span className="text-white font-bold">Ksh. 1,300–1,350 per bird</span> farm-gate.
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80">
                      <strong className="text-emerald-300 block mb-1">Dressed Premium Option:</strong>
                      Selling dressed (gutted & chilled) commands a <span className="text-white font-bold">+10–20% premium</span> (Ksh. 1,450–1,650/bird) to offset processing bags & ice.
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80">
                      <strong className="text-amber-300 block mb-1">Optional Egg Route (120-180 Pullets):</strong>
                      Retain 120–180 top pullets at week 17 for eggs. Target 50–65% peak lay (60–110 eggs/hen/month) sold at Ksh. 15–20 each.
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-200">
                  <strong>Notice:</strong> Always re-weigh 10 sample birds weekly to confirm growth rate matches target before setting harvest dates.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 1: FEED PLAN & STARTER BAG COVERAGE */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            
            {/* Starter Bags Alert Header */}
            <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Starter Bag Inventory & Coverage Analysis
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    You have {starterBagsOnHand} Bags of Starter Feed ({starterKgOnHand} kg)
                  </h3>
                  <p className="text-xs text-slate-300">
                    At {currentLive} birds, typical starter consumption for weeks 1–4 is <strong className="text-white">~610 kg</strong>. Your {starterKgOnHand} kg covers <strong className="text-amber-300">~13–16 days</strong> of starter.
                  </p>
                </div>

                <div className="bg-amber-500 text-slate-950 px-4 py-3 rounded-xl text-xs font-extrabold space-y-1">
                  <div>RECOMMENDED ACTION:</div>
                  <div>Place follow-on order for 7–8 starter bags or transition grower batch now!</div>
                </div>
              </div>
            </div>

            {/* Nutrition Specs Table & Intake Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Nutrition Specs */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wheat className="w-5 h-5 text-emerald-400" />
                  1.1 Feed Nutrition Specs (Buy or Mill Targets)
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700">
                    <div className="flex justify-between font-bold text-emerald-300">
                      <span>Starter (0–4 Wks)</span>
                      <span>20–21% Protein</span>
                    </div>
                    <p className="text-slate-400 mt-1">2,900–3,000 kcal/kg, coccidiostat included.</p>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700">
                    <div className="flex justify-between font-bold text-emerald-300">
                      <span>Grower (5–14 Wks)</span>
                      <span>17–18% Protein</span>
                    </div>
                    <p className="text-slate-400 mt-1">2,800–2,900 kcal/kg. Balanced skeletal growth.</p>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700">
                    <div className="flex justify-between font-bold text-amber-300">
                      <span>Finisher (15–20 Wks - Meat Path)</span>
                      <span>15–16% Protein</span>
                    </div>
                    <p className="text-slate-400 mt-1">2,900–3,000 kcal/kg. Maximizes dressed weight (1.3–1.6 kg).</p>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700">
                    <div className="flex justify-between font-bold text-emerald-300">
                      <span>Layer (≥18 Wks - Egg Path)</span>
                      <span>16–18% Protein</span>
                    </div>
                    <p className="text-slate-400 mt-1">2,700–2,800 kcal/kg, Calcium 3.5–4.0% for shell strength.</p>
                  </div>
                </div>
              </div>

              {/* Daily Intake Targets */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  1.2 Daily Feed Intake Targets (Grams / Bird / Day)
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-700 text-xs">
                  <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-900 text-slate-300 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Age Period</th>
                        <th className="p-3">Target Intake</th>
                        <th className="p-3 text-emerald-400">Total Flock Daily ({currentLive} birds)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60 bg-slate-800/40">
                      <tr><td className="p-2.5 font-medium">Week 1</td><td className="p-2.5">15–20 g</td><td className="p-2.5 font-bold text-white">8.5 – 11.4 kg</td></tr>
                      <tr><td className="p-2.5 font-medium">Week 2</td><td className="p-2.5">25–35 g</td><td className="p-2.5 font-bold text-white">14.2 – 20.0 kg</td></tr>
                      <tr><td className="p-2.5 font-medium">Week 3</td><td className="p-2.5">40–50 g</td><td className="p-2.5 font-bold text-white">22.8 – 28.5 kg</td></tr>
                      <tr><td className="p-2.5 font-medium">Week 4</td><td className="p-2.5">55–65 g</td><td className="p-2.5 font-bold text-white">31.3 – 37.0 kg</td></tr>
                      <tr><td className="p-2.5 font-medium text-amber-300">Weeks 5–8</td><td className="p-2.5">70–95 g</td><td className="p-2.5 font-bold text-amber-300">39.9 – 54.1 kg</td></tr>
                      <tr><td className="p-2.5 font-medium">Weeks 9–12</td><td className="p-2.5">95–110 g</td><td className="p-2.5 font-bold text-white">54.1 – 62.7 kg</td></tr>
                      <tr><td className="p-2.5 font-medium">Weeks 13–16</td><td className="p-2.5">110–125 g</td><td className="p-2.5 font-bold text-white">62.7 – 71.2 kg</td></tr>
                      <tr><td className="p-2.5 font-medium text-emerald-300">Weeks 17–20</td><td className="p-2.5">125–140 g</td><td className="p-2.5 font-bold text-emerald-300">71.2 – 79.8 kg</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-400">
                  <strong>Total Lifecycle Feed:</strong> Kienyeji require ~6.5–8.0 kg total feed per bird up to 18–20 weeks (meat path).
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: VACCINATION & HEALTH SCHEDULE */}
        {activeTab === 'vaccines' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  2.1 Kenya Step-by-Step Vaccination Schedule
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Standard avian health protection protocol for Improved Kienyeji flocks in Kenya.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { day: 'Day 1', name: "Marek's", route: 'Hatchery Injection', note: 'Just record in log' },
                  { day: 'Day 7', name: 'Newcastle (Lasota)', route: 'Eye Drop', note: 'Strict warmth' },
                  { day: 'Day 14', name: 'Gumboro (IBD)', route: 'Drinking Water', note: 'Withhold water 1.5h' },
                  { day: 'Day 21', name: 'Gumboro Booster', route: 'Drinking Water', note: 'Mix with skim milk' },
                  { day: 'Day 28', name: 'Newcastle Booster', route: 'Eye Drop / Water', note: 'Lasota / Clone' },
                  { day: 'Week 6', name: 'Fowl Pox', route: 'Wing Stab', note: 'Double needle' },
                  { day: 'Weeks 8–10', name: 'Deworming', route: 'Water / Feed', note: 'Repeat every 8-10 wks' },
                  { day: 'Weeks 16–18', name: 'ND Killed Vaccine', route: 'Injectable (Layers)', note: 'For long term cover' },
                ].map((vac, idx) => (
                  <div key={idx} className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">{vac.day}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{vac.route}</span>
                    </div>
                    <div className="text-sm font-bold text-white">{vac.name}</div>
                    <p className="text-xs text-slate-400">{vac.note}</p>
                  </div>
                ))}
              </div>

              {/* Water Vaccination Rules Box */}
              <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-700/60 rounded-xl p-5 space-y-3 text-xs text-slate-200">
                <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  How to Vaccinate Right (Water Method SOP)
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li><strong>Hold water for 1.5–2 hrs beforehand</strong> so birds are thirsty and drink eagerly.</li>
                  <li><strong>Mix vaccine with cool clean water + skim milk powder (2–4 g/L)</strong> to neutralize chlorine and protect live viruses.</li>
                  <li>Give a measured volume so birds consume the entire vaccine solution within <strong>1 hour</strong>.</li>
                  <li><strong>No disinfectant</strong> in drinkers on vaccine day; rinse drinkers thoroughly with clean water.</li>
                  <li>Record date, batch, expiry, and administrator in the daily log sheet.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HOUSING & EQUIPMENT GUIDE */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  3) Housing Space & Equipment Requirements ({currentLive} Birds)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Required feeder and drinker counts calculated for your current flock size.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Space & Litter */}
                <div className="bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-3">
                  <h4 className="font-bold text-emerald-300 text-sm">3.1 Space & Litter</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li>• <strong>Stocking Density:</strong> 6–8 birds/m² on deep litter.</li>
                    <li>• <strong>Floor Area Required:</strong> 71 – 95 m² housing space.</li>
                    <li>• <strong>Litter Depth:</strong> 8–10 cm clean wood shavings. Top up weekly in wet spots.</li>
                  </ul>
                </div>

                {/* Feeders Requirement */}
                <div className="bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-3">
                  <h4 className="font-bold text-amber-300 text-sm">3.2 Tube Feeders</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li>• <strong>Standard Ratio:</strong> 1 tube feeder per 40 birds.</li>
                    <li>• <strong>Required Count:</strong> 15 tube feeders minimum (Get <strong className="text-amber-400">18 feeders</strong> to reduce crowding).</li>
                    <li>• <strong>Linear Trough Alternative:</strong> 0-2 wks: 2-3 cm/bird, 3-6 wks: 5-6 cm/bird, 13+ wks: 10-12 cm/bird.</li>
                  </ul>
                </div>

                {/* Drinkers Requirement */}
                <div className="bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-3">
                  <h4 className="font-bold text-emerald-300 text-sm">3.3 Bell Drinkers</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li>• <strong>Standard Ratio:</strong> 1 drinker per 60 birds.</li>
                    <li>• <strong>Required Count:</strong> 10 drinkers minimum (Get <strong className="text-emerald-400">12 drinkers</strong>).</li>
                    <li>• <strong>Water Ratio:</strong> Birds drink <strong className="text-white">2–2.5× feed by weight</strong> (40–50 L water for 20 kg feed).</li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ATTENDANT SOP & DAILY TIMETABLE */}
        {activeTab === 'sops' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-emerald-400" />
                  4) Daily Attendant Routine & Checklist (Job Title: Poultry Attendant)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Hours: 6:30 a.m. – 6:30 p.m. | Key Outcomes: Healthy birds, accurate records, zero feed/water outages.
                </p>
              </div>

              {/* Timetable Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { time: '06:30 – 07:00 AM', title: 'Morning Start', desc: 'Water top-up & drinker rinse. 1st Feed (largest meal).' },
                  { time: '12:00 – 13:00 PM', title: 'Midday Check', desc: 'Water top-up in hot hours. 2nd Feed. Check ventilation.' },
                  { time: '16:30 – 17:30 PM', title: 'Late Afternoon', desc: 'Water top-up. 3rd Feed. Observe droppings & bird activity.' },
                  { time: '18:00 – 18:30 PM', title: 'Evening Closing', desc: 'Rake litter, check crop fill, secure feed store, set rodent traps.' }
                ].map((slot, idx) => (
                  <div key={idx} className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{slot.time}</span>
                    <div className="text-sm font-bold text-white">{slot.title}</div>
                    <p className="text-xs text-slate-300">{slot.desc}</p>
                  </div>
                ))}
              </div>

              {/* Daily Checklist Tasks */}
              <div className="bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-200 text-sm">Daily Mandatory Checklist Items</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>1. Open house & count mortalities; record immediately in log sheet.</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>2. Shake feeders to prevent caking and adjust hanging height to back level.</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>3. Rake damp litter; spot-top with fresh dry wood shavings.</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>4. Refresh footbath solution daily outside house door.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: SALES & PITCH SCRIPT */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-amber-400" />
                  6) Marketing & Presales Pitch Script Generator
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Use this simple call/text pitch script when reaching out to butcheries, hotels, WhatsApp groups, and churches.
                </p>
              </div>

              {/* Pitch Customizer Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Farm Location:</label>
                  <input 
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Target Intro Price (Ksh):</label>
                  <input 
                    type="number"
                    value={introPrice}
                    onChange={(e) => setIntroPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Delivery Radius (km):</label>
                  <input 
                    type="text"
                    value={deliveryRadius}
                    onChange={(e) => setDeliveryRadius(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              {/* Pitch Script Output Box */}
              <div className="bg-slate-950 border border-emerald-600/60 rounded-xl p-5 relative space-y-3">
                <div className="flex justify-between items-center text-xs text-emerald-400 font-bold uppercase">
                  <span>WhatsApp & Call Script Output</span>
                  <button
                    onClick={copyToClipboard}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedPitch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPitch ? 'Copied to Clipboard!' : 'Copy Pitch Script'}
                  </button>
                </div>

                <p className="text-sm font-mono text-slate-200 bg-slate-900 p-4 rounded-lg leading-relaxed border border-slate-800">
                  "{pitchScript}"
                </p>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span><strong>Presales & Deposit Strategy:</strong> Offer a Ksh. 50–100 per bird deposit for dressed orders (locks buyer commitment and funds processing paper/bags).</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
