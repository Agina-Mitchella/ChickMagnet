import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Wheat, 
  ShieldAlert, 
  ClipboardList, 
  CheckCircle2, 
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
  Edit3,
  Save,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useFarmPlanData } from '../utils/cms';

interface BusinessPlanHubProps {
  onClose?: () => void;
  defaultTab?: 'snapshot' | 'feed' | 'vaccines' | 'equipment' | 'sops' | 'marketing';
}

export default function BusinessPlanHub({ onClose, defaultTab = 'snapshot' }: BusinessPlanHubProps) {
  const { data, updateField } = useFarmPlanData();
  const [activeTab, setActiveTab] = useState<'snapshot' | 'feed' | 'vaccines' | 'equipment' | 'sops' | 'marketing'>(defaultTab);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local edit states initialized from live CMS data
  const [editSunkCost, setEditSunkCost] = useState(data.sunkCost);
  const [editInitialPlaced, setEditInitialPlaced] = useState(data.initialPlaced);
  const [editCurrentLive, setEditCurrentLive] = useState(data.currentLive);
  const [editMortalityCount, setEditMortalityCount] = useState(data.mortalityCount);
  const [editFutureBufferPct, setEditFutureBufferPct] = useState(data.futureBufferPct);
  const [editRemainingCostR, setEditRemainingCostR] = useState(data.remainingCostR);
  const [editProfitTier1, setEditProfitTier1] = useState(data.targetProfitTier1);
  const [editProfitTier2, setEditProfitTier2] = useState(data.targetProfitTier2);
  const [editProfitTier3, setEditProfitTier3] = useState(data.targetProfitTier3);
  const [editStarterBags, setEditStarterBags] = useState(data.starterBagsOnHand);
  const [editStarterKgPerBag, setEditStarterKgPerBag] = useState(data.starterKgPerBag);
  const [editDailyIntakeKg, setEditDailyIntakeKg] = useState(data.starterDailyIntakeKg);
  const [editFeedSupplier, setEditFeedSupplier] = useState(data.feedSupplier);
  const [editCostStarter, setEditCostStarter] = useState(data.costStarterBag);
  const [editCostGrower, setEditCostGrower] = useState(data.costGrowerBag);
  const [editCostFinisher, setEditCostFinisher] = useState(data.costFinisherBag);
  const [editLocationName, setEditLocationName] = useState(data.farmLocation);
  const [editHarvestDays, setEditHarvestDays] = useState(data.harvestDays);
  const [editWeightMin, setEditWeightMin] = useState(data.weightMin);
  const [editWeightMax, setEditWeightMax] = useState(data.weightMax);
  const [editDeliveryRadius, setEditDeliveryRadius] = useState(data.deliveryRadiusKm);
  const [editPitchTemplate, setEditPitchTemplate] = useState(data.pitchScriptTemplate);

  // Dynamic lists state
  const [vaxList, setVaxList] = useState(data.vaccinationSchedule);
  const [housingList, setHousingList] = useState(data.housingSpecs);
  const [sopsList, setSopsList] = useState(data.dailySops);

  // Interactive Live Calculator values (from either live CMS or local user tweak)
  const [sliderRemainingCostR, setSliderRemainingCostR] = useState(data.remainingCostR);
  const [activeProfitTier, setActiveProfitTier] = useState(data.activeProfitTarget);

  // Real-time computed values for active viewing
  const activeSaleable = Math.round(data.currentLive * (1 - data.futureBufferPct / 100));
  const activeRemainingCost = activeSaleable * sliderRemainingCostR;
  const activeTotalRevenue = data.sunkCost + activeProfitTier + activeRemainingCost;
  const activePricePerBird = activeSaleable > 0 ? Math.round(activeTotalRevenue / activeSaleable) : 0;

  // Marketing Pitch Copy State
  const [copiedPitch, setCopiedPitch] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.pitchScript);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  const handleSaveAllParameters = async () => {
    await updateField('fp_sunk_cost', editSunkCost);
    await updateField('fp_initial_placed', editInitialPlaced);
    await updateField('fp_current_live', editCurrentLive);
    await updateField('fp_mortality_count', editMortalityCount);
    await updateField('fp_future_buffer_pct', editFutureBufferPct);
    await updateField('fp_remaining_cost_r', editRemainingCostR);
    await updateField('fp_target_profit_tier_1', editProfitTier1);
    await updateField('fp_target_profit_tier_2', editProfitTier2);
    await updateField('fp_target_profit_tier_3', editProfitTier3);
    await updateField('fp_active_profit_target', activeProfitTier);
    await updateField('fp_starter_bags_on_hand', editStarterBags);
    await updateField('fp_starter_kg_per_bag', editStarterKgPerBag);
    await updateField('fp_starter_daily_intake_kg', editDailyIntakeKg);
    await updateField('fp_feed_supplier', editFeedSupplier);
    await updateField('fp_cost_starter_bag', editCostStarter);
    await updateField('fp_cost_grower_bag', editCostGrower);
    await updateField('fp_cost_finisher_bag', editCostFinisher);
    await updateField('fp_farm_location', editLocationName);
    await updateField('fp_harvest_days', editHarvestDays);
    await updateField('fp_weight_min', editWeightMin);
    await updateField('fp_weight_max', editWeightMax);
    await updateField('fp_delivery_radius_km', editDeliveryRadius);
    await updateField('fp_pitch_script_template', editPitchTemplate);
    await updateField('fp_vaccination_schedule_json', vaxList);
    await updateField('fp_housing_specs_json', housingList);
    await updateField('fp_daily_sops_json', sopsList);

    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 selection:bg-amber-400 selection:text-emerald-950">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Live Dynamic Farm Business Plan & Operations Hub
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950 tracking-tight font-serif">
                {data.farmTitle}
              </h1>
              <p className="text-slate-600 text-sm mt-1 max-w-3xl">
                {data.farmSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border shadow-xs ${
                  isEditing 
                    ? 'bg-amber-400 text-emerald-950 border-amber-300' 
                    : 'bg-emerald-900 hover:bg-emerald-800 text-white border-emerald-950'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Cancel Edit Mode' : 'Edit Farm Plan Parameters'}
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200 flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Exit
                </button>
              )}
            </div>
          </div>

          {saveSuccess && (
            <div className="mt-4 bg-emerald-100 text-emerald-900 border border-emerald-300 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Farm Plan & Financial Equations updated successfully in Firestore CMS!</span>
            </div>
          )}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-xs text-emerald-800 font-semibold block">Current Flock Status</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-bold text-slate-900">{data.currentLive}</span>
                <span className="text-xs text-slate-500">/ {data.initialPlaced} live</span>
              </div>
              <span className="text-[11px] text-slate-600 mt-0.5 block">{data.mortalityCount} mortalities ({data.mortalityPct}% loss)</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-xs text-emerald-800 font-semibold block">Sunk Cash Invested</span>
              <div className="text-xl font-bold text-slate-900 mt-1">Ksh. {data.sunkCost.toLocaleString()}</div>
              <span className="text-[11px] text-slate-600 mt-0.5 block">Feed, housing & chicks</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-xs text-emerald-800 font-semibold block">Conservative Saleable</span>
              <div className="text-xl font-bold text-slate-900 mt-1">~{activeSaleable} birds</div>
              <span className="text-[11px] text-slate-600 mt-0.5 block">Allows +{data.futureBufferPct}% future buffer</span>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
              <span className="text-xs text-amber-900 font-semibold block">Target Price / Bird</span>
              <div className="text-xl font-bold text-amber-900 mt-1">Ksh. {activePricePerBird.toLocaleString()}</div>
              <span className="text-[11px] text-amber-800 mt-0.5 block">Achieves Ksh. {(activeProfitTier/1000).toFixed(0)}k profit</span>
            </div>
          </div>
        </div>

        {/* Global Admin Edit Modal / Drawer (when isEditing is true) */}
        {isEditing && (
          <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800 space-y-6">
            <div className="flex justify-between items-center border-b border-emerald-800/80 pb-4">
              <div>
                <h3 className="text-lg font-bold font-serif text-amber-300 flex items-center gap-2">
                  <Edit3 className="w-5 h-5" /> Edit Master Farm Plan & Business Equation
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Update any underlying farm metric below. Changes sync instantly across the entire platform with zero code changes.
                </p>
              </div>
              <button
                onClick={handleSaveAllParameters}
                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save All Changes to CMS
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-emerald-200 font-semibold">Initial Chicks Placed:</label>
                <input
                  type="number"
                  value={editInitialPlaced}
                  onChange={(e) => setEditInitialPlaced(Number(e.target.value))}
                  className="w-full bg-emerald-900/80 border border-emerald-700 text-white rounded-xl p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-emerald-200 font-semibold">Current Live Birds:</label>
                <input
                  type="number"
                  value={editCurrentLive}
                  onChange={(e) => setEditCurrentLive(Number(e.target.value))}
                  className="w-full bg-emerald-900/80 border border-emerald-700 text-white rounded-xl p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-emerald-200 font-semibold">Mortality Count:</label>
                <input
                  type="number"
                  value={editMortalityCount}
                  onChange={(e) => setEditMortalityCount(Number(e.target.value))}
                  className="w-full bg-emerald-900/80 border border-emerald-700 text-white rounded-xl p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-emerald-200 font-semibold">Sunk Cash Invested (Ksh):</label>
                <input
                  type="number"
                  value={editSunkCost}
                  onChange={(e) => setEditSunkCost(Number(e.target.value))}
                  className="w-full bg-emerald-900/80 border border-emerald-700 text-white rounded-xl p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-emerald-200 font-semibold">Future Mortality Buffer (%):</label>
                <input
                  type="number"
                  value={editFutureBufferPct}
                  onChange={(e) => setEditFutureBufferPct(Number(e.target.value))}
                  className="w-full bg-emerald-900/80 border border-emerald-700 text-white rounded-xl p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-emerald-200 font-semibold">Remaining Cost R / Bird (Ksh):</label>
                <input
                  type="number"
                  value={editRemainingCostR}
                  onChange={(e) => setEditRemainingCostR(Number(e.target.value))}
                  className="w-full bg-emerald-900/80 border border-emerald-700 text-white rounded-xl p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-emerald-200 font-semibold">Profit Tier 1 (Ksh):</label>
                <input
                  type="number"
                  value={editProfitTier1}
                  onChange={(e) => setEditProfitTier1(Number(e.target.value))}
                  className="w-full bg-emerald-900/80 border border-emerald-700 text-white rounded-xl p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-emerald-200 font-semibold">Profit Tier 2 (Ksh):</label>
                <input
                  type="number"
                  value={editProfitTier2}
                  onChange={(e) => setEditProfitTier2(Number(e.target.value))}
                  className="w-full bg-emerald-900/80 border border-emerald-700 text-white rounded-xl p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-emerald-200 font-semibold">Profit Tier 3 (Ksh):</label>
                <input
                  type="number"
                  value={editProfitTier3}
                  onChange={(e) => setEditProfitTier3(Number(e.target.value))}
                  className="w-full bg-emerald-900/80 border border-emerald-700 text-white rounded-xl p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-emerald-200 font-semibold">Starter Bags on Hand (50kg):</label>
                <input
                  type="number"
                  step="0.5"
                  value={editStarterBags}
                  onChange={(e) => setEditStarterBags(Number(e.target.value))}
                  className="w-full bg-emerald-900/80 border border-emerald-700 text-white rounded-xl p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-emerald-200 font-semibold">Daily Intake / Bird (kg):</label>
                <input
                  type="number"
                  step="0.005"
                  value={editDailyIntakeKg}
                  onChange={(e) => setEditDailyIntakeKg(Number(e.target.value))}
                  className="w-full bg-emerald-900/80 border border-emerald-700 text-white rounded-xl p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-emerald-200 font-semibold">Farm Location Name:</label>
                <input
                  type="text"
                  value={editLocationName}
                  onChange={(e) => setEditLocationName(e.target.value)}
                  className="w-full bg-emerald-900/80 border border-emerald-700 text-white rounded-xl p-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-emerald-900 hover:bg-emerald-800 text-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Close Editor
              </button>
              <button
                onClick={handleSaveAllParameters}
                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs px-6 py-2 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save All Changes to CMS
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
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
                    ? 'bg-amber-400 text-emerald-950 shadow-xs' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
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
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
                <div>
                  <h3 className="text-lg font-bold text-emerald-950 font-serif flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-700" />
                    Target Pricing Calculator (Business Plan Equation)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Adjust remaining cost per bird to finish (feed, meds, power, labor, dressing) and profit goal to calculate exact required sale price.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {/* Remaining Cost R Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-700 font-semibold">Remaining Cost "R" / Bird:</span>
                      <span className="text-emerald-950 font-bold text-sm">Ksh. {sliderRemainingCostR}</span>
                    </div>
                    <input 
                      type="range" 
                      min={300} 
                      max={700} 
                      step={25}
                      value={sliderRemainingCostR}
                      onChange={(e) => setSliderRemainingCostR(Number(e.target.value))}
                      className="w-full accent-emerald-700 bg-slate-200 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Ksh. 300 (low cost)</span>
                      <span>Ksh. 500 (standard plan)</span>
                      <span>Ksh. 700 (high dressing)</span>
                    </div>
                  </div>

                  {/* Target Profit Select */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-700 font-semibold block">Desired Profit Tier:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { amount: data.targetProfitTier1, label: `+Ksh ${(data.targetProfitTier1/1000).toFixed(0)}k (20%)` },
                        { amount: data.targetProfitTier2, label: `+Ksh ${(data.targetProfitTier2/1000).toFixed(0)}k (23%)` },
                        { amount: data.targetProfitTier3, label: `+Ksh ${(data.targetProfitTier3/1000).toFixed(0)}k (30%)` }
                      ].map(tier => (
                        <button
                          key={tier.amount}
                          onClick={() => setActiveProfitTier(tier.amount)}
                          className={`px-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            activeProfitTier === tier.amount 
                              ? 'bg-amber-400 text-emerald-950 shadow-xs' 
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {tier.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calculated Result Breakdown */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-xs text-emerald-800 uppercase tracking-wider font-bold">Recommended Farm-Gate Target Price</span>
                      <div className="text-3xl font-extrabold text-emerald-950 mt-1 font-serif">
                        Ksh. {activePricePerBird.toLocaleString()} <span className="text-sm font-normal text-slate-600">/ bird</span>
                      </div>
                    </div>
                    <div className="bg-white border border-emerald-200 px-3 py-2 rounded-xl text-xs text-emerald-900 font-medium">
                      Target Range: <strong className="text-emerald-950">Ksh. {activePricePerBird - 20} – {activePricePerBird + 30}</strong> (Up to Ksh. {activePricePerBird + 300} if dressed)
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-3 border-t border-emerald-200/60">
                    <div>
                      <span className="text-slate-600 block">Total Revenue Goal:</span>
                      <span className="font-bold text-slate-900">Ksh. {activeTotalRevenue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Remaining Costs Total:</span>
                      <span className="font-bold text-slate-900">Ksh. {activeRemainingCost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Net Profit Realized:</span>
                      <span className="font-bold text-emerald-800">Ksh. {activeProfitTier.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Business Plan Matrix Table */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 mb-2 font-serif">Master Business Plan Price Matrix (Reference Table)</h4>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-xs text-left text-slate-700">
                      <thead className="bg-slate-50 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="p-3">Remaining Cost R/bird</th>
                          <th className="p-3 text-emerald-900">+Ksh. {(data.targetProfitTier1/1000).toFixed(0)}k profit</th>
                          <th className="p-3 text-amber-900 bg-amber-50">+Ksh. {(data.targetProfitTier2/1000).toFixed(0)}k profit</th>
                          <th className="p-3 text-emerald-900">+Ksh. {(data.targetProfitTier3/1000).toFixed(0)}k profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        <tr className={sliderRemainingCostR === 400 ? 'bg-emerald-50' : ''}>
                          <td className="p-3 font-semibold text-slate-900">Ksh. 400</td>
                          <td className="p-3">Ksh. {Math.round((data.sunkCost + data.targetProfitTier1 + activeSaleable * 400) / activeSaleable).toLocaleString()}</td>
                          <td className="p-3 font-bold text-slate-900">Ksh. {Math.round((data.sunkCost + data.targetProfitTier2 + activeSaleable * 400) / activeSaleable).toLocaleString()}</td>
                          <td className="p-3">Ksh. {Math.round((data.sunkCost + data.targetProfitTier3 + activeSaleable * 400) / activeSaleable).toLocaleString()}</td>
                        </tr>
                        <tr className={sliderRemainingCostR === 500 ? 'bg-amber-50 font-bold text-amber-950' : ''}>
                          <td className="p-3 font-semibold text-amber-900">Ksh. 500 (Target R)</td>
                          <td className="p-3">Ksh. {Math.round((data.sunkCost + data.targetProfitTier1 + activeSaleable * 500) / activeSaleable).toLocaleString()}</td>
                          <td className="p-3 text-amber-950 bg-amber-100 font-bold">Ksh. {Math.round((data.sunkCost + data.targetProfitTier2 + activeSaleable * 500) / activeSaleable).toLocaleString()}</td>
                          <td className="p-3 text-emerald-900">Ksh. {Math.round((data.sunkCost + data.targetProfitTier3 + activeSaleable * 500) / activeSaleable).toLocaleString()}</td>
                        </tr>
                        <tr className={sliderRemainingCostR === 600 ? 'bg-emerald-50' : ''}>
                          <td className="p-3 font-semibold text-slate-900">Ksh. 600</td>
                          <td className="p-3">Ksh. {Math.round((data.sunkCost + data.targetProfitTier1 + activeSaleable * 600) / activeSaleable).toLocaleString()}</td>
                          <td className="p-3 font-bold text-slate-900">Ksh. {Math.round((data.sunkCost + data.targetProfitTier2 + activeSaleable * 600) / activeSaleable).toLocaleString()}</td>
                          <td className="p-3">Ksh. {Math.round((data.sunkCost + data.targetProfitTier3 + activeSaleable * 600) / activeSaleable).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Action Directives Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-emerald-950 font-serif flex items-center gap-2">
                    <Info className="w-5 h-5 text-amber-500" />
                    Business Plan Key Takeaways
                  </h3>

                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <strong className="text-emerald-950 block mb-1">Target Action Rule:</strong>
                      Keep remaining costs <span className="text-emerald-900 font-bold">R ≤ {data.remainingCostR}/bird</span> and target <span className="text-emerald-900 font-bold">Ksh. {activePricePerBird}–{activePricePerBird + 50} per bird</span> farm-gate.
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <strong className="text-emerald-950 block mb-1">Dressed Premium Option:</strong>
                      Selling dressed (gutted & chilled) commands a <span className="text-emerald-900 font-bold">+10–20% premium</span> (Ksh. {activePricePerBird + 150}–{activePricePerBird + 350}/bird) to offset processing bags & ice.
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <strong className="text-emerald-950 block mb-1">Optional Egg Route (120-180 Pullets):</strong>
                      Retain 120–180 top pullets at week 17 for eggs. Target 50–65% peak lay (60–110 eggs/hen/month) sold at Ksh. 15–20 each.
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900">
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
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Starter Bag Inventory & Coverage Analysis
                  </span>
                  <h3 className="text-xl font-bold text-emerald-950 font-serif">
                    You have {data.starterBagsOnHand} Bags of Starter Feed ({data.starterKgOnHand} kg)
                  </h3>
                  <p className="text-xs text-slate-700">
                    At {data.currentLive} birds, typical starter consumption for weeks 1–4 is <strong className="text-slate-900">~610 kg</strong>. Your {data.starterKgOnHand} kg covers <strong className="text-amber-900 font-bold">~{data.starterDaysCovered} days</strong> of starter.
                  </p>
                </div>

                <div className="bg-amber-400 text-emerald-950 px-4 py-3 rounded-2xl text-xs font-extrabold space-y-1 shadow-xs shrink-0">
                  <div>RECOMMENDED ACTION:</div>
                  <div>Place follow-on order for 7–8 starter bags or transition grower batch now!</div>
                </div>
              </div>
            </div>

            {/* Nutrition Specs Table & Intake Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Nutrition Specs */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-emerald-950 font-serif flex items-center gap-2">
                  <Wheat className="w-5 h-5 text-emerald-700" />
                  1.1 Feed Nutrition Specs & Supplier ({data.feedSupplier})
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex justify-between font-bold text-emerald-950">
                      <span>Starter (0–4 Wks) — Ksh {data.costStarterBag.toLocaleString()} / 50kg</span>
                      <span className="text-emerald-800">20–21% Protein</span>
                    </div>
                    <p className="text-slate-600 mt-1">2,900–3,000 kcal/kg, coccidiostat included.</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex justify-between font-bold text-emerald-950">
                      <span>Grower (5–14 Wks) — Ksh {data.costGrowerBag.toLocaleString()} / 50kg</span>
                      <span className="text-emerald-800">17–18% Protein</span>
                    </div>
                    <p className="text-slate-600 mt-1">2,800–2,900 kcal/kg. Balanced skeletal growth.</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex justify-between font-bold text-emerald-950">
                      <span>Finisher (15–20 Wks - Meat Path) — Ksh {data.costFinisherBag.toLocaleString()} / 50kg</span>
                      <span className="text-emerald-800">15–16% Protein</span>
                    </div>
                    <p className="text-slate-600 mt-1">2,900–3,000 kcal/kg. Target FCR {data.targetFCR}.</p>
                  </div>
                </div>
              </div>

              {/* Daily Intake Targets */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-emerald-950 font-serif flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-500" />
                  1.2 Daily Feed Intake Targets ({data.currentLive} Birds)
                </h3>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 text-xs">
                  <table className="w-full text-left text-slate-700">
                    <thead className="bg-slate-50 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-3">Age Period</th>
                        <th className="p-3">Target Intake</th>
                        <th className="p-3 text-emerald-900">Total Flock Daily</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      <tr><td className="p-2.5 font-medium text-slate-900">Week 1</td><td className="p-2.5">15–20 g</td><td className="p-2.5 font-bold text-slate-900">{(data.currentLive * 0.0175).toFixed(1)} kg</td></tr>
                      <tr><td className="p-2.5 font-medium text-slate-900">Week 2</td><td className="p-2.5">25–35 g</td><td className="p-2.5 font-bold text-slate-900">{(data.currentLive * 0.03).toFixed(1)} kg</td></tr>
                      <tr><td className="p-2.5 font-medium text-slate-900">Week 3</td><td className="p-2.5">40–50 g</td><td className="p-2.5 font-bold text-slate-900">{(data.currentLive * 0.045).toFixed(1)} kg</td></tr>
                      <tr><td className="p-2.5 font-medium text-slate-900">Week 4</td><td className="p-2.5">55–65 g</td><td className="p-2.5 font-bold text-slate-900">{(data.currentLive * 0.06).toFixed(1)} kg</td></tr>
                      <tr className="bg-amber-50/50"><td className="p-2.5 font-medium text-amber-900">Weeks 5–8</td><td className="p-2.5">70–95 g</td><td className="p-2.5 font-bold text-amber-900">{(data.currentLive * 0.082).toFixed(1)} kg</td></tr>
                      <tr><td className="p-2.5 font-medium text-slate-900">Weeks 9–12</td><td className="p-2.5">95–110 g</td><td className="p-2.5 font-bold text-slate-900">{(data.currentLive * 0.102).toFixed(1)} kg</td></tr>
                      <tr className="bg-emerald-50/50"><td className="p-2.5 font-medium text-emerald-950">Weeks 17–20</td><td className="p-2.5">125–140 g</td><td className="p-2.5 font-bold text-emerald-950">{(data.currentLive * 0.132).toFixed(1)} kg</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: VACCINATION & HEALTH SCHEDULE */}
        {activeTab === 'vaccines' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-emerald-950 font-serif flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-700" />
                  2.1 Kenya Step-by-Step Vaccination Schedule (Editable in CMS)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Standard avian health protection protocol for Improved Kienyeji flocks in Kenya.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.vaccinationSchedule.map((vac) => (
                  <div key={vac.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">{vac.dayOrWeek}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{vac.route}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{vac.vaccine}</div>
                    <p className="text-xs text-slate-600">{vac.instructions}</p>
                    {vac.notes && <p className="text-[11px] text-amber-800 font-medium">{vac.notes}</p>}
                  </div>
                ))}
              </div>

              {/* Water Vaccination Rules Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3 text-xs text-slate-800">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2 font-serif">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  How to Vaccinate Right (Water Method SOP)
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
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
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-emerald-950 font-serif flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-500" />
                  3) Housing Space & Equipment Requirements ({data.currentLive} Birds)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Required feeder and drinker counts calculated for your current flock size.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.housingSpecs.map((spec) => (
                  <div key={spec.id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                    <h4 className="font-bold text-emerald-950 text-sm font-serif">{spec.label}</h4>
                    <div className="text-lg font-bold text-emerald-900">{spec.value}</div>
                    <p className="text-xs text-slate-600">{spec.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ATTENDANT SOP & DAILY TIMETABLE */}
        {activeTab === 'sops' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-emerald-950 font-serif flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-emerald-700" />
                  4) Daily Attendant Routine & Checklist (Job Title: Poultry Attendant)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Key Outcomes: Healthy birds, accurate records, zero feed/water outages.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.dailySops.map((sop) => (
                  <div key={sop.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">{sop.time}</span>
                      {sop.critical && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold uppercase">Mandatory</span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-900">{sop.task}</div>
                    <p className="text-xs text-slate-600">{sop.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SALES & PITCH SCRIPT */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-emerald-950 font-serif flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-amber-500" />
                  5) Marketing & Presales Pitch Script Generator
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Use this simple call/text pitch script when reaching out to butcheries, hotels, WhatsApp groups, and churches.
                </p>
              </div>

              {/* Pitch Script Output Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative space-y-3">
                <div className="flex justify-between items-center text-xs text-emerald-950 font-bold uppercase">
                  <span className="font-serif">WhatsApp & Call Script Output</span>
                  <button
                    onClick={copyToClipboard}
                    className="bg-amber-400 hover:bg-amber-500 text-emerald-950 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedPitch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPitch ? 'Copied to Clipboard!' : 'Copy Pitch Script'}
                  </button>
                </div>

                <p className="text-sm font-mono text-slate-800 bg-white p-4 rounded-xl leading-relaxed border border-slate-200">
                  "{data.pitchScript}"
                </p>

                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
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
