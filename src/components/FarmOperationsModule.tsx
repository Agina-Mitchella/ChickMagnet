import React, { useState } from 'react';
import { 
  Activity, 
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
  Feather,
  Plus,
  Download,
  FileSpreadsheet,
  Users,
  Award,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  PackageCheck,
  Building2,
  Clock,
  UserCheck,
  Calculator
} from 'lucide-react';
import { MOCK_BATCH_TRACE_RECORDS, INITIAL_PRODUCTS } from '../data/products';
import { BatchTraceabilityRecord, Product } from '../types';

interface FlockBatchOps {
  batchId: string;
  breed: string;
  placementDate: string;
  initialPlaced: number;
  mortalityCount: number;
  currentAgeWeeks: number;
  sunkCostKsh: number;
  targetHarvestDate: string;
  status: 'brooding' | 'growing' | 'finishing' | 'harvesting' | 'completed';
  avgWeightKg: number;
  benchmarkWeightKg: number;
  vaccinations: {
    dayOrWeek: string;
    vaccine: string;
    route: string;
    status: 'completed' | 'due' | 'upcoming';
    dateAdministered?: string;
    administeredBy?: string;
    batchNo?: string;
  }[];
}

interface FeedInventoryItem {
  id: string;
  type: 'Starter' | 'Grower' | 'Finisher' | 'Layer Mash';
  bagsOnHand: number; // 50kg bags
  kgPerBag: number;
  minThresholdBags: number;
  dailyIntakePerBirdGrams: number;
}

interface B2BBuyerOrder {
  id: string;
  buyerName: string;
  businessType: 'Butchery' | 'Hotel' | 'Wholesaler' | 'Market Trader' | 'Church Group';
  phone: string;
  targetHarvestDate: string;
  birdQty: number;
  format: 'Live' | 'Dressed';
  agreedPricePerBird: number;
  depositPaidKsh: number;
  status: 'booked' | 'deposit_received' | 'fulfilled' | 'cancelled';
}

interface DressingLogEntry {
  id: string;
  date: string;
  batchId: string;
  liveHarvestedCount: number;
  dressedSuccessCount: number;
  rejectsCount: number;
  totalWeightKg: number;
  avgWeightKg: number;
  supervisor: string;
}

interface StaffTask {
  id: string;
  timeSlot: string;
  title: string;
  description: string;
  role: 'Poultry Attendant' | 'Farm Supervisor';
  category: 'daily' | 'weekly';
  completed: boolean;
  completedAt?: string;
}

export default function FarmOperationsModule() {
  const [activeOpsTab, setActiveOpsTab] = useState<
    'alerts' | 'flocks' | 'feed' | 'vaccines' | 'mortality_weight' | 'staff' | 'b2b_sales' | 'processing' | 'reports'
  >('alerts');

  // Master Traceability Batches Connection
  const [traceRecords, setTraceRecords] = useState<Record<string, BatchTraceabilityRecord>>(MOCK_BATCH_TRACE_RECORDS);

  // 1. FLOCKS & COST TRACKER STATE
  const [flocks, setFlocks] = useState<FlockBatchOps[]>([
    {
      batchId: 'BATCH-2026-KIEN570',
      breed: 'Improved Kienyeji (Naivasha Flock)',
      placementDate: '2026-03-15',
      initialPlaced: 600,
      mortalityCount: 30,
      currentAgeWeeks: 16,
      sunkCostKsh: 346788,
      targetHarvestDate: '2026-08-15',
      status: 'finishing',
      avgWeightKg: 1.42,
      benchmarkWeightKg: 1.50,
      vaccinations: [
        { dayOrWeek: 'Day 1', vaccine: "Marek's Disease", route: 'Hatchery Inject', status: 'completed', dateAdministered: '2026-03-15', administeredBy: 'Dr. Wambugu', batchNo: 'MRK-901' },
        { dayOrWeek: 'Day 7', vaccine: 'Newcastle (Lasota)', route: 'Eye Drop', status: 'completed', dateAdministered: '2026-03-22', administeredBy: 'Attendant Joseph', batchNo: 'NCD-441' },
        { dayOrWeek: 'Day 14', vaccine: 'Gumboro (IBD)', route: 'Drinking Water', status: 'completed', dateAdministered: '2026-03-29', administeredBy: 'Attendant Joseph', batchNo: 'IBD-102' },
        { dayOrWeek: 'Day 21', vaccine: 'Gumboro Booster', route: 'Drinking Water', status: 'completed', dateAdministered: '2026-04-05', administeredBy: 'Attendant Joseph', batchNo: 'IBD-108' },
        { dayOrWeek: 'Day 28', vaccine: 'Newcastle Booster', route: 'Eye Drop / Water', status: 'completed', dateAdministered: '2026-04-12', administeredBy: 'Attendant Joseph', batchNo: 'NCD-882' },
        { dayOrWeek: 'Week 6', vaccine: 'Fowl Pox', route: 'Wing Stab', status: 'completed', dateAdministered: '2026-04-26', administeredBy: 'Dr. Wambugu', batchNo: 'FPX-330' },
        { dayOrWeek: 'Week 10', vaccine: 'Deworming (Piperazine)', route: 'Feed / Water', status: 'completed', dateAdministered: '2026-05-24', administeredBy: 'Attendant Joseph', batchNo: 'DWM-771' },
        { dayOrWeek: 'Week 18', vaccine: 'ND+IB Killed Vaccine', route: 'Intramuscular', status: 'due', dateAdministered: '', administeredBy: '', batchNo: '' }
      ]
    },
    {
      batchId: 'BATCH-2026-CHX9',
      breed: 'Kenbro Heavy Meat Broilers',
      placementDate: '2026-06-01',
      initialPlaced: 400,
      mortalityCount: 8,
      currentAgeWeeks: 8,
      sunkCostKsh: 198000,
      targetHarvestDate: '2026-08-10',
      status: 'growing',
      avgWeightKg: 1.85,
      benchmarkWeightKg: 1.80,
      vaccinations: [
        { dayOrWeek: 'Day 1', vaccine: "Marek's", route: 'Hatchery Inject', status: 'completed', dateAdministered: '2026-06-01', administeredBy: 'Dr. Njeri', batchNo: 'MRK-110' },
        { dayOrWeek: 'Day 7', vaccine: 'Newcastle (Lasota)', route: 'Eye Drop', status: 'completed', dateAdministered: '2026-06-08', administeredBy: 'Attendant Mary', batchNo: 'NCD-332' },
        { dayOrWeek: 'Day 14', vaccine: 'Gumboro (IBD)', route: 'Drinking Water', status: 'completed', dateAdministered: '2026-06-15', administeredBy: 'Attendant Mary', batchNo: 'IBD-550' },
        { dayOrWeek: 'Day 28', vaccine: 'Newcastle Booster', route: 'Drinking Water', status: 'completed', dateAdministered: '2026-06-29', administeredBy: 'Attendant Mary', batchNo: 'NCD-990' }
      ]
    },
    {
      batchId: 'BATCH-2026-POL4',
      breed: 'Kienyeji Point-of-Lay Pullets',
      placementDate: '2026-04-01',
      initialPlaced: 300,
      mortalityCount: 5,
      currentAgeWeeks: 18,
      sunkCostKsh: 285000,
      targetHarvestDate: '2026-09-01',
      status: 'finishing',
      avgWeightKg: 1.55,
      benchmarkWeightKg: 1.60,
      vaccinations: [
        { dayOrWeek: 'Day 1', vaccine: "Marek's", route: 'Hatchery Inject', status: 'completed', dateAdministered: '2026-04-01', administeredBy: 'Dr. Wambugu', batchNo: 'MRK-442' },
        { dayOrWeek: 'Week 6', vaccine: 'Fowl Pox', route: 'Wing Stab', status: 'completed', dateAdministered: '2026-05-12', administeredBy: 'Dr. Wambugu', batchNo: 'FPX-102' },
        { dayOrWeek: 'Week 16', vaccine: 'ND+IB Oil Vaccine', route: 'Injectable', status: 'due', dateAdministered: '', administeredBy: '', batchNo: '' }
      ]
    }
  ]);

  const [selectedBatchId, setSelectedBatchId] = useState<string>('BATCH-2026-KIEN570');

  // Selected Flock derived
  const activeFlock = flocks.find(f => f.batchId === selectedBatchId) || flocks[0];
  const activeLiveCount = activeFlock.initialPlaced - activeFlock.mortalityCount;

  // Live Calculator State
  const [calcRemainingCostR, setCalcRemainingCostR] = useState<number>(500); // Ksh per bird
  const [calcTargetProfitKsh, setCalcTargetProfitKsh] = useState<number>(80000);
  const calcSaleableBirds = Math.max(0, activeLiveCount - Math.round(activeLiveCount * 0.03)); // 3% safety margin
  const calcTotalRemainingCost = calcSaleableBirds * calcRemainingCostR;
  const calcRequiredTotalRev = activeFlock.sunkCostKsh + calcTargetProfitKsh + calcTotalRemainingCost;
  const calcRequiredPricePerBird = calcSaleableBirds > 0 ? Math.round(calcRequiredTotalRev / calcSaleableBirds) : 0;

  // 2. FEED MANAGEMENT STATE
  const [feedInventory, setFeedInventory] = useState<FeedInventoryItem[]>([
    { id: 'f1', type: 'Starter', bagsOnHand: 4.0, kgPerBag: 50, minThresholdBags: 6, dailyIntakePerBirdGrams: 55 },
    { id: 'f2', type: 'Grower', bagsOnHand: 14.5, kgPerBag: 50, minThresholdBags: 8, dailyIntakePerBirdGrams: 95 },
    { id: 'f3', type: 'Finisher', bagsOnHand: 18.0, kgPerBag: 50, minThresholdBags: 10, dailyIntakePerBirdGrams: 125 },
    { id: 'f4', type: 'Layer Mash', bagsOnHand: 22.0, kgPerBag: 50, minThresholdBags: 10, dailyIntakePerBirdGrams: 130 }
  ]);

  // Daily Feeding Schedule
  const [feedingScheduleChecklist, setFeedingScheduleChecklist] = useState([
    { id: 'm1', slot: '06:30 AM (Morning 40%)', amountKg: ((activeLiveCount * 125) / 1000) * 0.4, status: true, note: 'Intake strong, all clean' },
    { id: 'm2', slot: '12:00 PM (Midday 30%)', amountKg: ((activeLiveCount * 125) / 1000) * 0.3, status: true, note: 'Water topped up' },
    { id: 'm3', slot: '16:30 PM (Evening 30%)', amountKg: ((activeLiveCount * 125) / 1000) * 0.3, status: false, note: 'Pending evening feeding' }
  ]);

  // 3. VACCINATION RECORD FORM STATE
  const [vacFormOpen, setVacFormOpen] = useState(false);
  const [selectedVacIndex, setSelectedVacIndex] = useState<number | null>(null);
  const [vacAdministeredBy, setVacAdministeredBy] = useState('Dr. Kennedy Wambugu');
  const [vacBatchNo, setVacBatchNo] = useState('VAC-2026-9921');
  const [vacDate, setVacDate] = useState(new Date().toISOString().split('T')[0]);

  // 4. MORTALITY & WEIGHT LOG STATE
  const [mortalityInputCount, setMortalityInputCount] = useState<number>(1);
  const [mortalityReason, setMortalityReason] = useState<string>('Heat Stress / Culling');

  const [sampledWeightInput, setSampledWeightInput] = useState<number>(1.45);
  const [weightLogs, setWeightLogs] = useState<{ week: number; avgWeightKg: number; targetKg: number; date: string }[]>([
    { week: 4, avgWeightKg: 0.38, targetKg: 0.35, date: '2026-04-12' },
    { week: 8, avgWeightKg: 0.82, targetKg: 0.85, date: '2026-05-10' },
    { week: 12, avgWeightKg: 1.18, targetKg: 1.20, date: '2026-06-07' },
    { week: 16, avgWeightKg: 1.42, targetKg: 1.50, date: '2026-07-05' }
  ]);

  // 5. STAFF TASK STATE
  const [staffTasks, setStaffTasks] = useState<StaffTask[]>([
    { id: 't1', timeSlot: '06:30 AM', title: 'Mortality & Flock Headcount', description: 'Count mortalities, record in log, inspect overall vigor.', role: 'Poultry Attendant', category: 'daily', completed: true, completedAt: '06:35 AM' },
    { id: 't2', timeSlot: '07:00 AM', title: 'Morning Water & Drinker Sanitize', description: 'Rinse bell drinkers, refill fresh cool clean water.', role: 'Poultry Attendant', category: 'daily', completed: true, completedAt: '07:12 AM' },
    { id: 't3', timeSlot: '07:30 AM', title: '1st Morning Feed Distribution', description: 'Distribute 40% daily ration into tube feeders at bird back height.', role: 'Poultry Attendant', category: 'daily', completed: true, completedAt: '07:45 AM' },
    { id: 't4', timeSlot: '12:00 PM', title: 'Midday Ventilation & Temperature Check', description: 'Adjust side curtains, check brooder temperature, 2nd feed (30%).', role: 'Poultry Attendant', category: 'daily', completed: true, completedAt: '12:05 PM' },
    { id: 't5', timeSlot: '16:30 PM', title: '3rd Evening Feed & Dropping Audit', description: 'Distribute remaining 30% feed, inspect fecal consistency.', role: 'Poultry Attendant', category: 'daily', completed: false },
    { id: 't6', timeSlot: '18:00 PM', title: 'Litter Raking & Biosecurity Lockup', description: 'Rake wet spots, refresh footbath, lock feed store & secure doors.', role: 'Poultry Attendant', category: 'daily', completed: false },
    { id: 'tw1', timeSlot: 'Monday 09:00 AM', title: 'Weekly 10-Bird Sample Weighing', description: 'Weigh 10 random birds, log average weight in growth monitor.', role: 'Farm Supervisor', category: 'weekly', completed: true, completedAt: 'Mon 09:30 AM' },
    { id: 'tw2', timeSlot: 'Wednesday 14:00 PM', title: 'Footbath & Biosecurity Refresh', description: 'Empty and sanitize footbaths outside all house entry doors.', role: 'Farm Supervisor', category: 'weekly', completed: false },
    { id: 'tw3', timeSlot: 'Friday 15:00 PM', title: 'Feed Store Inventory Audit', description: 'Physical tally of 50kg bags on hand and reorder check.', role: 'Farm Supervisor', category: 'weekly', completed: false }
  ]);

  // 6. B2B SALES PIPELINE STATE
  const [b2bOrders, setB2bOrders] = useState<B2BBuyerOrder[]>([
    { id: 'B2B-801', buyerName: 'Naivasha Serena Hotel Butchery', businessType: 'Hotel', phone: '+254 712 345 678', targetHarvestDate: '2026-08-14', birdQty: 100, format: 'Dressed', agreedPricePerBird: 1550, depositPaidKsh: 25000, status: 'deposit_received' },
    { id: 'B2B-802', buyerName: 'Kenyatta Avenue Meat Mart', businessType: 'Butchery', phone: '+254 722 987 654', targetHarvestDate: '2026-08-15', birdQty: 150, format: 'Live', agreedPricePerBird: 1350, depositPaidKsh: 30000, status: 'booked' },
    { id: 'B2B-803', buyerName: 'Gilgil Farmers Wholesale Co-op', businessType: 'Wholesaler', phone: '+254 733 112 233', targetHarvestDate: '2026-08-20', birdQty: 200, format: 'Live', agreedPricePerBird: 1300, depositPaidKsh: 50000, status: 'deposit_received' }
  ]);

  const [newOrderFormOpen, setNewOrderFormOpen] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newBuyerPhone, setNewBuyerPhone] = useState('');
  const [newBuyerQty, setNewBuyerQty] = useState(50);
  const [newBuyerPrice, setNewBuyerPrice] = useState(1350);
  const [newBuyerDeposit, setNewBuyerDeposit] = useState(5000);
  const [newBuyerFormat, setNewBuyerFormat] = useState<'Live' | 'Dressed'>('Dressed');

  // 7. PROCESSING DAY LOG STATE
  const [dressingLogs, setDressingLogs] = useState<DressingLogEntry[]>([
    { id: 'DRS-901', date: '2026-07-25', batchId: 'BATCH-2026-KIEN570', liveHarvestedCount: 60, dressedSuccessCount: 58, rejectsCount: 2, totalWeightKg: 87.0, avgWeightKg: 1.50, supervisor: 'Dr. Wambugu' },
    { id: 'DRS-902', date: '2026-07-28', batchId: 'BATCH-2026-CHX9', liveHarvestedCount: 50, dressedSuccessCount: 50, rejectsCount: 0, totalWeightKg: 92.5, avgWeightKg: 1.85, supervisor: 'Joseph Kamau' }
  ]);

  const [dressingInputLive, setDressingInputLive] = useState(50);
  const [dressingInputSuccess, setDressingInputSuccess] = useState(48);
  const [dressingInputRejects, setDressingInputRejects] = useState(2);
  const [dressingInputWeightKg, setDressingInputWeightKg] = useState(72.0);

  // Risk Calculation
  const starterFeed = feedInventory.find(f => f.type === 'Starter');
  const starterBags = starterFeed ? starterFeed.bagsOnHand : 0;
  const starterDaysCovered = Math.round((starterBags * 50 * 1000) / (activeLiveCount * 55 || 1));
  const isStarterFeedLow = starterDaysCovered < 5;
  const isMortalitySpike = activeFlock.mortalityCount / activeFlock.initialPlaced > 0.04;
  const isWeightBehind = activeFlock.avgWeightKg < activeFlock.benchmarkWeightKg;

  // Handlers
  const handleLogMortality = () => {
    if (mortalityInputCount <= 0) return;
    setFlocks(prev => prev.map(f => {
      if (f.batchId === selectedBatchId) {
        return {
          ...f,
          mortalityCount: f.mortalityCount + mortalityInputCount
        };
      }
      return f;
    }));
    setMortalityInputCount(1);
    alert(`Added ${mortalityInputCount} mortality to ${selectedBatchId}. Live count updated to ${activeLiveCount - mortalityInputCount} birds.`);
  };

  const handleLogWeight = () => {
    if (sampledWeightInput <= 0) return;
    const currentWk = activeFlock.currentAgeWeeks;
    setFlocks(prev => prev.map(f => {
      if (f.batchId === selectedBatchId) {
        return { ...f, avgWeightKg: sampledWeightInput };
      }
      return f;
    }));
    setWeightLogs(prev => [
      ...prev,
      { week: currentWk, avgWeightKg: sampledWeightInput, targetKg: activeFlock.benchmarkWeightKg, date: new Date().toISOString().split('T')[0] }
    ]);
    alert(`Logged week ${currentWk} weight sample: ${sampledWeightInput} kg for ${selectedBatchId}.`);
  };

  const handleAdministerVaccine = () => {
    if (selectedVacIndex === null) return;
    setFlocks(prev => prev.map(f => {
      if (f.batchId === selectedBatchId) {
        const updatedVac = [...f.vaccinations];
        updatedVac[selectedVacIndex] = {
          ...updatedVac[selectedVacIndex],
          status: 'completed',
          dateAdministered: vacDate,
          administeredBy: vacAdministeredBy,
          batchNo: vacBatchNo
        };
        return { ...f, vaccinations: updatedVac };
      }
      return f;
    }));

    // LIVE SYNC TO TRACEABILITY RECORDS & STOREFRONT
    if (traceRecords[selectedBatchId]) {
      const updatedTrace = { ...traceRecords[selectedBatchId] };
      const vacItem = activeFlock.vaccinations[selectedVacIndex];
      updatedTrace.vaccinationHistory = [
        ...updatedTrace.vaccinationHistory,
        { vaccine: `${vacItem.vaccine} (${vacBatchNo})`, dateAdministered: vacDate }
      ];
      const updatedMap = {
        ...traceRecords,
        [selectedBatchId]: updatedTrace
      };
      setTraceRecords(updatedMap);
      MOCK_BATCH_TRACE_RECORDS[selectedBatchId] = updatedTrace;

      // Persist to admin batch records storage & fire sync event
      const savedAdminBatches = localStorage.getItem('chickmagnet_admin_batches');
      let adminBatchList: BatchTraceabilityRecord[] = savedAdminBatches ? JSON.parse(savedAdminBatches) : Object.values(MOCK_BATCH_TRACE_RECORDS);
      const existingIdx = adminBatchList.findIndex(b => b.batchId === selectedBatchId);
      if (existingIdx !== -1) {
        adminBatchList[existingIdx] = updatedTrace;
      } else {
        adminBatchList.push(updatedTrace);
      }
      localStorage.setItem('chickmagnet_admin_batches', JSON.stringify(adminBatchList));
      window.dispatchEvent(new Event('chickmagnet_batch_updated'));
    }

    setVacFormOpen(false);
    alert(`Vaccine logged successfully! Data synchronized live with customer traceability portal for ${selectedBatchId}.`);
  };

  const toggleTask = (taskId: string) => {
    setStaffTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
        };
      }
      return t;
    }));
  };

  const handleCreateB2bOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuyerName) return;
    const newOrd: B2BBuyerOrder = {
      id: `B2B-${Math.floor(100 + Math.random() * 900)}`,
      buyerName: newBuyerName,
      businessType: 'Butchery',
      phone: newBuyerPhone || '+254 700 000 000',
      targetHarvestDate: '2026-08-18',
      birdQty: newBuyerQty,
      format: newBuyerFormat,
      agreedPricePerBird: newBuyerPrice,
      depositPaidKsh: newBuyerDeposit,
      status: newBuyerDeposit > 0 ? 'deposit_received' : 'booked'
    };
    setB2bOrders([newOrd, ...b2bOrders]);
    setNewOrderFormOpen(false);
    setNewBuyerName('');
    alert(`B2B Pre-order created for ${newBuyerName}! Deposit of Ksh. ${newBuyerDeposit.toLocaleString()} recorded.`);
  };

  const handleLogDressing = (e: React.FormEvent) => {
    e.preventDefault();
    const avgW = (dressingInputWeightKg / (dressingInputSuccess || 1)).toFixed(2);
    const newEntry: DressingLogEntry = {
      id: `DRS-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      batchId: selectedBatchId,
      liveHarvestedCount: dressingInputLive,
      dressedSuccessCount: dressingInputSuccess,
      rejectsCount: dressingInputRejects,
      totalWeightKg: dressingInputWeightKg,
      avgWeightKg: Number(avgW),
      supervisor: 'Farm Supervisor'
    };
    setDressingLogs([newEntry, ...dressingLogs]);

    // Live sync stock update to storefront products
    const savedProducts = localStorage.getItem('chickmagnet_products');
    let productList: Product[] = savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS;
    const targetIdx = productList.findIndex(p => p.id === 'prod-improved-kienyeji-mature' || p.category === 'fresh-poultry');
    if (targetIdx !== -1) {
      productList[targetIdx] = {
        ...productList[targetIdx],
        stock: productList[targetIdx].stock + dressingInputSuccess
      };
      localStorage.setItem('chickmagnet_products', JSON.stringify(productList));
      window.dispatchEvent(new Event('chickmagnet_products_updated'));
    }

    alert(`Dressing Log Saved! Added ${dressingInputSuccess} dressed birds (${dressingInputWeightKg} kg) to store inventory.`);
  };

  const exportDataCSV = (title: string) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `ChickMagnet Farm Operations - ${title} Report\nDate,Batch,Value\n`;
    csvContent += `${new Date().toLocaleDateString()},${selectedBatchId},${activeLiveCount} Live Birds\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ChickMagnet_${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* Farm Operations Top Bar */}
      <div className="bg-gradient-to-r from-[#071d12] via-[#0c2e1e] to-slate-900 border border-emerald-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Production Command & Operations Module
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Internal Farm Operations Command
            </h1>
            <p className="text-emerald-200/80 text-xs mt-1 max-w-2xl">
              Live flock cost tracking, feed inventory alerts, vaccination schedules, weight sample analytics, daily staff checklists, and B2B sales pipeline — shared directly with customer traceability.
            </p>
          </div>

          {/* Batch Selector Switcher */}
          <div className="bg-slate-900/90 border border-emerald-600/60 p-3 rounded-xl flex items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Flock Batch</span>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="bg-slate-800 text-amber-300 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                {flocks.map(f => (
                  <option key={f.batchId} value={f.batchId}>
                    {f.batchId} - {f.breed} ({f.initialPlaced - f.mortalityCount} live)
                  </option>
                ))}
              </select>
            </div>
            <div className="border-l border-slate-700 pl-3">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">Traceability Sync</span>
              <span className="text-xs text-white font-mono flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Live Synced
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-emerald-800/60">
          <div className="bg-slate-900/80 border border-emerald-900/80 p-3 rounded-xl">
            <span className="text-[11px] text-emerald-400 font-bold block">Live Flock Count</span>
            <div className="text-xl font-extrabold text-white mt-1">
              {activeLiveCount} <span className="text-xs text-slate-400 font-normal">/ {activeFlock.initialPlaced}</span>
            </div>
            <span className="text-[10px] text-emerald-300/80 block mt-0.5">Mortality: {activeFlock.mortalityCount} ({(activeFlock.mortalityCount / activeFlock.initialPlaced * 100).toFixed(1)}%)</span>
          </div>

          <div className="bg-slate-900/80 border border-emerald-900/80 p-3 rounded-xl">
            <span className="text-[11px] text-amber-400 font-bold block">Sunk Cost to Date</span>
            <div className="text-xl font-extrabold text-amber-300 mt-1">
              Ksh. {activeFlock.sunkCostKsh.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Ksh. {Math.round(activeFlock.sunkCostKsh / activeLiveCount)} / live bird</span>
          </div>

          <div className="bg-slate-900/80 border border-emerald-900/80 p-3 rounded-xl">
            <span className="text-[11px] text-emerald-400 font-bold block">Starter Feed Inventory</span>
            <div className={`text-xl font-extrabold mt-1 ${isStarterFeedLow ? 'text-amber-400' : 'text-emerald-300'}`}>
              {starterBags} Bags <span className="text-xs text-slate-400">({starterDaysCovered} days)</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {isStarterFeedLow ? '⚠️ REORDER REQUIRED' : 'Normal coverage'}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-emerald-900/80 p-3 rounded-xl">
            <span className="text-[11px] text-amber-400 font-bold block">Target Sale Price</span>
            <div className="text-xl font-extrabold text-amber-400 mt-1">
              Ksh. {calcRequiredPricePerBird.toLocaleString()}
            </div>
            <span className="text-[10px] text-amber-200/80 block mt-0.5">For Ksh. {(calcTargetProfitKsh/1000).toFixed(0)}k net profit</span>
          </div>

          <div className="bg-slate-900/80 border border-emerald-900/80 p-3 rounded-xl">
            <span className="text-[11px] text-emerald-400 font-bold block">Staff Tasks Done</span>
            <div className="text-xl font-extrabold text-white mt-1">
              {staffTasks.filter(t => t.completed).length} / {staffTasks.length}
            </div>
            <span className="text-[10px] text-emerald-300/80 block mt-0.5">
              {Math.round((staffTasks.filter(t => t.completed).length / staffTasks.length) * 100)}% SOP Completion
            </span>
          </div>
        </div>
      </div>

      {/* Farm Operations Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'alerts', label: '9) Risk Alerts Red Flags', icon: AlertTriangle, badge: (isStarterFeedLow || isMortalitySpike || isWeightBehind) ? '!' : undefined },
          { id: 'flocks', label: '1) Flock & Cost Tracker', icon: Calculator },
          { id: 'feed', label: '2) Feed Inventory & Daily Schedule', icon: Wheat },
          { id: 'vaccines', label: '3) Vaccination & Health Scheduler', icon: ShieldAlert },
          { id: 'mortality_weight', label: '4) Mortality & Weight Logging', icon: Scale },
          { id: 'staff', label: '5) Staff Task Checklist & Bonus', icon: CheckSquare },
          { id: 'b2b_sales', label: '6) B2B Buyer Sales Pipeline', icon: Building2 },
          { id: 'processing', label: '7) Processing Day Log', icon: PackageCheck },
          { id: 'reports', label: '8) Data Exports & Reports', icon: FileSpreadsheet },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeOpsTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveOpsTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                isActive 
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20' 
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MODULE 9: RISK ALERTS & DASHBOARD RED FLAGS */}
      {activeOpsTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  9) Configurable Risk Alerts & Red Flags (Operational Monitoring)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Automated thresholds triggered directly from your farm plan rules to prevent feed shortages, mortality spikes, or growth delays.
                </p>
              </div>
              <span className="bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded-xl text-emerald-400 font-mono">
                System Status: Active Monitoring
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* Alert 1: Feed Warning */}
              <div className={`p-4 rounded-xl border ${isStarterFeedLow ? 'bg-amber-950/60 border-amber-500/80' : 'bg-slate-900/80 border-slate-700'}`}>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Feed Supply Risk</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isStarterFeedLow ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {isStarterFeedLow ? 'CRITICAL ALERT' : 'NORMAL'}
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-2">Starter Feed Inventory</div>
                <p className="text-xs text-slate-300 mt-1">
                  {starterBags} bags on hand ({starterDaysCovered} days remaining). Threshold is 6 bags.
                </p>
                {isStarterFeedLow && (
                  <button 
                    onClick={() => setActiveOpsTab('feed')}
                    className="mt-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg w-full transition cursor-pointer"
                  >
                    Queue Reorder in Feed Manager →
                  </button>
                )}
              </div>

              {/* Alert 2: Mortality Risk */}
              <div className={`p-4 rounded-xl border ${isMortalitySpike ? 'bg-rose-950/60 border-rose-500/80' : 'bg-slate-900/80 border-slate-700'}`}>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Flock Health Risk</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isMortalitySpike ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {isMortalitySpike ? 'ELEVATED MORTALITY' : 'WITHIN TOLERANCE'}
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-2">Mortality Rate ({activeFlock.batchId})</div>
                <p className="text-xs text-slate-300 mt-1">
                  {activeFlock.mortalityCount} birds lost out of {activeFlock.initialPlaced} placed ({(activeFlock.mortalityCount/activeFlock.initialPlaced*100).toFixed(1)}%).
                </p>
                <div className="text-[11px] text-slate-400 mt-2">Target threshold is &lt; 5.0% total mortality over 18 weeks.</div>
              </div>

              {/* Alert 3: Weight Gain Risk */}
              <div className={`p-4 rounded-xl border ${isWeightBehind ? 'bg-amber-950/60 border-amber-500/80' : 'bg-slate-900/80 border-slate-700'}`}>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Growth Performance Risk</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isWeightBehind ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {isWeightBehind ? 'BEHIND BENCHMARK' : 'ON TARGET'}
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-2">Week {activeFlock.currentAgeWeeks} Weight Sampling</div>
                <p className="text-xs text-slate-300 mt-1">
                  Sample avg: <strong className="text-white">{activeFlock.avgWeightKg} kg</strong> vs benchmark <strong className="text-emerald-300">{activeFlock.benchmarkWeightKg} kg</strong>.
                </p>
                <div className="text-[11px] text-slate-400 mt-2">Consider boosting finisher protein ratio if deficit exceeds 100g.</div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODULE 1: FLOCK & COST TRACKER */}
      {activeOpsTab === 'flocks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Break-Even & Pricing Calculator */}
            <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-400" />
                  1) Interactive Flock Cost & Break-Even Pricing Calculator
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Calculates required sale price per bird dynamically using: <strong className="text-slate-200">Sale Price = (Sunk Cost + Target Profit + (Saleable Birds × Remaining Cost R)) ÷ Saleable Birds</strong>
                </p>
              </div>

              {/* Slider Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/70 p-4 rounded-xl border border-slate-700/80">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Remaining Cost "R" / Bird:</span>
                    <span className="text-amber-400 font-bold text-sm">Ksh. {calcRemainingCostR}</span>
                  </div>
                  <input 
                    type="range" 
                    min={300} 
                    max={750} 
                    step={25}
                    value={calcRemainingCostR}
                    onChange={(e) => setCalcRemainingCostR(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Ksh. 300 (Low feed)</span>
                    <span>Ksh. 500 (Standard plan)</span>
                    <span>Ksh. 750 (Dressed+Transport)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-medium block">Target Flock Profit Goal (Ksh):</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { amount: 69000, label: '+69k (20%)' },
                      { amount: 80000, label: '+80k (23%)' },
                      { amount: 104000, label: '+104k (30%)' }
                    ].map(t => (
                      <button
                        key={t.amount}
                        onClick={() => setCalcTargetProfitKsh(t.amount)}
                        className={`px-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                          calcTargetProfitKsh === t.amount ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Result Box */}
              <div className="bg-gradient-to-br from-emerald-950 via-[#0a271b] to-slate-900 border border-emerald-600/60 rounded-xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-xs text-emerald-300 uppercase font-bold tracking-wider">Required Farm-Gate Price Per Bird</span>
                    <div className="text-3xl font-extrabold text-amber-300 mt-1">
                      Ksh. {calcRequiredPricePerBird.toLocaleString()} <span className="text-xs font-normal text-slate-300">/ bird</span>
                    </div>
                  </div>
                  <div className="bg-emerald-900/80 border border-emerald-500/50 px-3.5 py-2.5 rounded-xl text-xs text-emerald-200">
                    <div>Saleable Birds Margin: <strong className="text-white">{calcSaleableBirds} birds</strong></div>
                    <div className="text-[11px] text-emerald-300 mt-0.5">Dressed Market Option: <strong className="text-amber-300">Ksh. {calcRequiredPricePerBird + 150}</strong></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs pt-3 border-t border-emerald-800/60 text-slate-300">
                  <div><span className="text-slate-400 block">Required Revenue:</span><span className="font-bold text-white">Ksh. {calcRequiredTotalRev.toLocaleString()}</span></div>
                  <div><span className="text-slate-400 block">Remaining Costs:</span><span className="font-bold text-white">Ksh. {calcTotalRemainingCost.toLocaleString()}</span></div>
                  <div><span className="text-slate-400 block">Net Profit:</span><span className="font-bold text-emerald-400">Ksh. {calcTargetProfitKsh.toLocaleString()}</span></div>
                </div>
              </div>
            </div>

            {/* Traceability Batch Linkage Info */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Linked Storefront & Traceability Record
              </h3>
              
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Linked Batch ID:</span>
                  <strong className="text-amber-300 font-mono">{activeFlock.batchId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Breed / Lineage:</span>
                  <strong className="text-white">{activeFlock.breed}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <strong className="text-white">Naivasha Farm, Rift Valley</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vaccine Count Logged:</span>
                  <strong className="text-emerald-400 font-bold">{activeFlock.vaccinations.filter(v => v.status === 'completed').length} Vaccines</strong>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Data entered in Farm Operations is linked to batch ID <strong className="text-white">{activeFlock.batchId}</strong>, which directly populates the customer-facing traceability portal and stock levels.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* MODULE 2: FEED MANAGEMENT & INVENTORY */}
      {activeOpsTab === 'feed' && (
        <div className="space-y-6">
          
          {/* Inventory Table & Days Remaining */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Feed Stock */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wheat className="w-5 h-5 text-amber-400" />
                  2.1 Feed Inventory (50kg Bags on Hand)
                </h3>
                <span className="text-xs text-emerald-400 font-bold">Auto-Calculates Coverage</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-700 text-xs">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-900 text-slate-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Feed Type</th>
                      <th className="p-3">Bags (50kg)</th>
                      <th className="p-3">Total Kg</th>
                      <th className="p-3">Days Covered ({activeLiveCount} birds)</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 bg-slate-800/40">
                    {feedInventory.map(item => {
                      const totalKg = item.bagsOnHand * 50;
                      const dailyFlockKg = (activeLiveCount * item.dailyIntakePerBirdGrams) / 1000;
                      const daysLeft = Math.round(totalKg / (dailyFlockKg || 1));
                      const isLow = item.bagsOnHand <= item.minThresholdBags;

                      return (
                        <tr key={item.id} className={isLow ? 'bg-amber-950/20' : ''}>
                          <td className="p-3 font-bold text-white">{item.type}</td>
                          <td className="p-3">
                            <input 
                              type="number" 
                              step="0.5" 
                              value={item.bagsOnHand}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setFeedInventory(prev => prev.map(f => f.id === item.id ? { ...f, bagsOnHand: val } : f));
                              }}
                              className="w-16 bg-slate-900 border border-slate-700 text-amber-300 rounded px-2 py-1 font-bold"
                            />
                          </td>
                          <td className="p-3 font-mono">{totalKg} kg</td>
                          <td className="p-3 font-bold text-emerald-300">~{daysLeft} days</td>
                          <td className="p-3">
                            {isLow ? (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                Low Stock Alert
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-bold text-[10px]">OK</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daily Feeding Schedule Checklist */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-400" />
                2.2 Interactive Staff Feeding Checklist (Daily Meal Split)
              </h3>

              <div className="space-y-3">
                {feedingScheduleChecklist.map(meal => (
                  <div 
                    key={meal.id}
                    onClick={() => {
                      setFeedingScheduleChecklist(prev => prev.map(m => m.id === meal.id ? { ...m, status: !m.status } : m));
                    }}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      meal.status ? 'bg-emerald-950/40 border-emerald-600/60' : 'bg-slate-900/80 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-emerald-400">
                        {meal.status ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-slate-500" />}
                      </button>
                      <div>
                        <div className="text-sm font-bold text-white">{meal.slot}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Required Ration: <strong className="text-amber-300">{meal.amountKg.toFixed(1)} kg</strong></div>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${meal.status ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {meal.status ? 'FED & LOGGED' : 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODULE 3: VACCINATION & HEALTH SCHEDULER */}
      {activeOpsTab === 'vaccines' && (
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  3) Vaccination & Health Scheduler ({activeFlock.batchId})
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Single source of truth: Administered vaccines automatically update customer traceability certificates.
                </p>
              </div>

              <div className="bg-emerald-950 border border-emerald-600/60 px-3 py-1.5 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Linked to Traceability Certificate
              </div>
            </div>

            {/* Vaccination Schedule Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-700 text-xs">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-900 text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Age Schedule</th>
                    <th className="p-3">Vaccine Name</th>
                    <th className="p-3">Route / Method</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date Administered</th>
                    <th className="p-3">Administered By</th>
                    <th className="p-3">Batch / Expiry No.</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 bg-slate-800/40">
                  {activeFlock.vaccinations.map((vac, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-bold text-emerald-300">{vac.dayOrWeek}</td>
                      <td className="p-3 font-bold text-white">{vac.vaccine}</td>
                      <td className="p-3 text-slate-400">{vac.route}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          vac.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          vac.status === 'due' ? 'bg-amber-500 text-slate-950 font-black animate-pulse' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {vac.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{vac.dateAdministered || '—'}</td>
                      <td className="p-3">{vac.administeredBy || '—'}</td>
                      <td className="p-3 font-mono text-amber-300">{vac.batchNo || '—'}</td>
                      <td className="p-3 text-right">
                        {vac.status !== 'completed' && (
                          <button
                            onClick={() => {
                              setSelectedVacIndex(idx);
                              setVacFormOpen(true);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-lg transition cursor-pointer"
                          >
                            Record Vaccine
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vaccination Entry Form Modal */}
            {vacFormOpen && selectedVacIndex !== null && (
              <div className="bg-slate-900 border border-emerald-500/60 p-5 rounded-xl space-y-4">
                <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Record Vaccine Administration: {activeFlock.vaccinations[selectedVacIndex].vaccine}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Date Administered:</label>
                    <input 
                      type="date"
                      value={vacDate}
                      onChange={(e) => setVacDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Administrator Name / Reg:</label>
                    <input 
                      type="text"
                      value={vacAdministeredBy}
                      onChange={(e) => setVacAdministeredBy(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Vaccine Batch / Expiry No:</label>
                    <input 
                      type="text"
                      value={vacBatchNo}
                      onChange={(e) => setVacBatchNo(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setVacFormOpen(false)}
                    className="bg-slate-800 text-slate-300 text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdministerVaccine}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-5 py-2 rounded-lg"
                  >
                    Save & Sync to Customer Traceability
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 4: MORTALITY & WEIGHT LOGGING */}
      {activeOpsTab === 'mortality_weight' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Daily Mortality Entry */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                4.1 Daily Flock Mortality Log ({activeFlock.batchId})
              </h3>
              <p className="text-xs text-slate-400">
                Internal mortality entry dynamically updates live count & sunk cost per bird calculation.
              </p>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Mortality Count:</label>
                    <input 
                      type="number"
                      min="1"
                      value={mortalityInputCount}
                      onChange={(e) => setMortalityInputCount(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded-lg text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Probable Cause:</label>
                    <select
                      value={mortalityReason}
                      onChange={(e) => setMortalityReason(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded-lg"
                    >
                      <option value="Heat Stress / Culling">Heat Stress / Culling</option>
                      <option value="Unknown / Physical Trauma">Unknown / Physical Trauma</option>
                      <option value="Respiratory Symptoms">Respiratory Symptoms</option>
                      <option value="Weak Chick Non-Starter">Weak Chick Non-Starter</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleLogMortality}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl w-full transition cursor-pointer"
                >
                  Record Mortality Entry
                </button>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700 text-xs text-slate-300 flex justify-between">
                <span>Total Cumulative Loss: <strong className="text-rose-400">{activeFlock.mortalityCount} birds</strong></span>
                <span>Current Live Count: <strong className="text-emerald-400 font-bold">{activeLiveCount} birds</strong></span>
              </div>
            </div>

            {/* Weekly Weight Sampling */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                4.2 Weekly Weight Sampling (10-Bird Sample Avg)
              </h3>
              <p className="text-xs text-slate-400">
                Plots average sample weight against age growth benchmarks.
              </p>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-slate-300 font-medium block mb-1">Average Weight of 10 Birds (kg):</label>
                    <input 
                      type="number"
                      step="0.05"
                      value={sampledWeightInput}
                      onChange={(e) => setSampledWeightInput(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 text-amber-300 p-2 rounded-lg font-bold"
                    />
                  </div>
                  <button
                    onClick={handleLogWeight}
                    className="mt-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Log Weight
                  </button>
                </div>
              </div>

              {/* Weight Log Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-700 text-xs">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-900 text-slate-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Flock Age</th>
                      <th className="p-2.5">Sample Avg (kg)</th>
                      <th className="p-2.5">Benchmark (kg)</th>
                      <th className="p-2.5">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 bg-slate-800/40">
                    {weightLogs.map((wl, i) => {
                      const diff = wl.avgWeightKg - wl.targetKg;
                      const isGood = diff >= 0;
                      return (
                        <tr key={i}>
                          <td className="p-2.5 font-bold text-white">Week {wl.week}</td>
                          <td className="p-2.5 font-bold text-amber-300">{wl.avgWeightKg} kg</td>
                          <td className="p-2.5 text-slate-400">{wl.targetKg} kg</td>
                          <td className="p-2.5">
                            <span className={`font-bold ${isGood ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)} kg
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODULE 5: STAFF TASK MANAGEMENT & BONUS */}
      {activeOpsTab === 'staff' && (
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                  5) Staff Digital Checklist & Monthly Bonus Tracker
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Replaces printed attendant SOP sheets with a digital daily execution log.
                </p>
              </div>

              {/* Bonus Tracker Pill */}
              <div className="bg-amber-500/10 border border-amber-500/40 px-3.5 py-2 rounded-xl text-xs text-amber-300 font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Monthly Staff Bonus Target: &lt;3% Mortality + &gt;95% Tasks Done
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
              {staffTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    task.completed ? 'bg-emerald-950/30 border-emerald-600/50' : 'bg-slate-900/80 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-emerald-400">
                      {task.completed ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-slate-500" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{task.timeSlot}</span>
                        <span className="text-sm font-bold text-white">{task.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg block ${task.completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {task.completed ? `DONE (${task.completedAt})` : 'MARK DONE'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">{task.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 6: B2B SALES PIPELINE (CRM) */}
      {activeOpsTab === 'b2b_sales' && (
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  6) B2B Sales & Outbound Buyer Pipeline (CRM)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pre-orders, harvest booking, and deposit tracking for hotels, butcheries & wholesale traders.
                </p>
              </div>

              <button
                onClick={() => setNewOrderFormOpen(!newOrderFormOpen)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add B2B Booking
              </button>
            </div>

            {/* New Booking Form */}
            {newOrderFormOpen && (
              <form onSubmit={handleCreateB2bOrder} className="bg-slate-900 border border-emerald-500/50 p-5 rounded-xl space-y-4 text-xs">
                <h4 className="font-bold text-emerald-300 text-sm">Create New B2B Harvest Booking</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-300 block mb-1">Buyer / Business Name:</label>
                    <input 
                      type="text" 
                      required
                      value={newBuyerName} 
                      onChange={(e) => setNewBuyerName(e.target.value)} 
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded-lg"
                      placeholder="e.g. Naivasha Grill Butchery"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Phone Number:</label>
                    <input 
                      type="text" 
                      value={newBuyerPhone} 
                      onChange={(e) => setNewBuyerPhone(e.target.value)} 
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded-lg"
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Format:</label>
                    <select
                      value={newBuyerFormat}
                      onChange={(e) => setNewBuyerFormat(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded-lg"
                    >
                      <option value="Dressed">Dressed (Gutted & Chilled)</option>
                      <option value="Live">Live Birds</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Bird Quantity:</label>
                    <input 
                      type="number" 
                      value={newBuyerQty} 
                      onChange={(e) => setNewBuyerQty(Number(e.target.value))} 
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Agreed Price / Bird (Ksh):</label>
                    <input 
                      type="number" 
                      value={newBuyerPrice} 
                      onChange={(e) => setNewBuyerPrice(Number(e.target.value))} 
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Deposit Paid (Ksh):</label>
                    <input 
                      type="number" 
                      value={newBuyerDeposit} 
                      onChange={(e) => setNewBuyerDeposit(Number(e.target.value))} 
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded-lg font-bold text-emerald-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setNewOrderFormOpen(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg font-bold">Cancel</button>
                  <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2 rounded-lg font-bold">Save Booking</button>
                </div>
              </form>
            )}

            {/* B2B Orders Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-700 text-xs">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-900 text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Buyer / Business</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Harvest Date</th>
                    <th className="p-3">Quantity & Format</th>
                    <th className="p-3">Total Value</th>
                    <th className="p-3">Deposit Paid</th>
                    <th className="p-3">Balance Due</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 bg-slate-800/40">
                  {b2bOrders.map(ord => {
                    const totalVal = ord.birdQty * ord.agreedPricePerBird;
                    const balance = totalVal - ord.depositPaidKsh;
                    return (
                      <tr key={ord.id}>
                        <td className="p-3">
                          <div className="font-bold text-white">{ord.buyerName}</div>
                          <div className="text-[10px] text-slate-400">{ord.phone}</div>
                        </td>
                        <td className="p-3"><span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">{ord.businessType}</span></td>
                        <td className="p-3 font-mono">{ord.targetHarvestDate}</td>
                        <td className="p-3 font-bold text-amber-300">{ord.birdQty} birds ({ord.format})</td>
                        <td className="p-3 font-bold text-white">Ksh. {totalVal.toLocaleString()}</td>
                        <td className="p-3 font-bold text-emerald-400">Ksh. {ord.depositPaidKsh.toLocaleString()}</td>
                        <td className="p-3 font-mono text-amber-300">Ksh. {balance.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'deposit_received' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {ord.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* MODULE 7: PROCESSING DAY LOG */}
      {activeOpsTab === 'processing' && (
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-400" />
              7) Processing & Dressing Day Log (Harvest Record)
            </h3>

            {/* Entry Form */}
            <form onSubmit={handleLogDressing} className="bg-slate-900 border border-slate-700 p-5 rounded-xl space-y-4 text-xs">
              <h4 className="font-bold text-amber-300 text-sm">Log Harvest & Processing Batch</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">Live Birds Harvested:</label>
                  <input type="number" value={dressingInputLive} onChange={(e) => setDressingInputLive(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded-lg font-bold" />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Dressed Grade-A Birds:</label>
                  <input type="number" value={dressingInputSuccess} onChange={(e) => setDressingInputSuccess(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 text-emerald-300 p-2 rounded-lg font-bold" />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Rejects / Condemned:</label>
                  <input type="number" value={dressingInputRejects} onChange={(e) => setDressingInputRejects(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 text-rose-400 p-2 rounded-lg font-bold" />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Total Packaged Weight (kg):</label>
                  <input type="number" step="0.5" value={dressingInputWeightKg} onChange={(e) => setDressingInputWeightKg(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 text-amber-300 p-2 rounded-lg font-bold" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-lg cursor-pointer">
                  Save Processing Record & Sync Store Stock
                </button>
              </div>
            </form>

            {/* History */}
            <div className="overflow-x-auto rounded-xl border border-slate-700 text-xs">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-900 text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Processing ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Flock Batch</th>
                    <th className="p-3">Live Harvested</th>
                    <th className="p-3">Dressed Packaged</th>
                    <th className="p-3">Rejects</th>
                    <th className="p-3">Total Kg</th>
                    <th className="p-3">Avg Dressed Weight</th>
                    <th className="p-3">Supervisor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 bg-slate-800/40">
                  {dressingLogs.map(log => (
                    <tr key={log.id}>
                      <td className="p-3 font-mono font-bold text-amber-300">{log.id}</td>
                      <td className="p-3 font-mono">{log.date}</td>
                      <td className="p-3 font-bold text-white">{log.batchId}</td>
                      <td className="p-3">{log.liveHarvestedCount}</td>
                      <td className="p-3 font-bold text-emerald-400">{log.dressedSuccessCount}</td>
                      <td className="p-3 text-rose-400">{log.rejectsCount}</td>
                      <td className="p-3 font-bold text-white">{log.totalWeightKg} kg</td>
                      <td className="p-3 font-bold text-amber-300">{log.avgWeightKg} kg</td>
                      <td className="p-3 text-slate-400">{log.supervisor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 8: DATA EXPORTS & REPORTS */}
      {activeOpsTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              8) Exportable Structured Data & Financial Audit Reports
            </h3>
            <p className="text-xs text-slate-400">
              Download structured CSV reports for accounting, lender reviews, or veterinary compliance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Flock Mortality & Live Count Log', desc: 'Daily mortality records and live balance history.' },
                { title: 'Vaccination & Health Certificate Log', desc: 'Complete vaccine administration log by batch.' },
                { title: 'Feed Intake & Inventory Audit', desc: '50kg bag consumption and days remaining projection.' },
                { title: 'B2B Sales Ledger & Deposits', desc: 'Pre-orders, deposits collected, and outstanding balances.' },
                { title: 'Processing & Dressing Summary', desc: 'Harvest counts, reject rate, and packaged kg yields.' },
                { title: 'Master Farm Financial Sheet', desc: 'Combined sunk cost, target pricing, and net profit ledger.' }
              ].map((rep, idx) => (
                <div key={idx} className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl space-y-3">
                  <div className="text-sm font-bold text-white">{rep.title}</div>
                  <p className="text-xs text-slate-400">{rep.desc}</p>
                  <button
                    onClick={() => exportDataCSV(rep.title)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV Sheet
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
