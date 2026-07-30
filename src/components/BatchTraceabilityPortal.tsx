import React, { useState } from 'react';
import { X, Search, Activity, ShieldCheck, CheckCircle2, FileText, Download, Award, Clock } from 'lucide-react';
import { MOCK_BATCH_TRACE_RECORDS } from '../data/products';
import { BatchTraceabilityRecord } from '../types';

interface BatchTraceabilityPortalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBatchId?: string;
}

export default function BatchTraceabilityPortal({
  isOpen,
  onClose,
  initialBatchId = 'BATCH-2026-CHX9'
}: BatchTraceabilityPortalProps) {
  const [searchQuery, setSearchQuery] = useState(initialBatchId);
  const [activeRecord, setActiveRecord] = useState<BatchTraceabilityRecord | null>(
    MOCK_BATCH_TRACE_RECORDS[initialBatchId] || MOCK_BATCH_TRACE_RECORDS['BATCH-2026-CHX9']
  );

  if (!isOpen) return null;

  const handleSearch = (batchId: string) => {
    const formatted = batchId.trim().toUpperCase();
    if (MOCK_BATCH_TRACE_RECORDS[formatted]) {
      setActiveRecord(MOCK_BATCH_TRACE_RECORDS[formatted]);
    } else {
      setActiveRecord(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#123524] text-amber-50 rounded-3xl max-w-3xl w-full border border-emerald-800 shadow-2xl relative p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-emerald-950 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-black text-xl text-amber-300">
                ChickMagnet Traceability Portal
              </h2>
              <p className="text-xs text-emerald-300 font-mono">
                Verify Farm Origin, Slaughter/Hatch Timestamps & Disease Clearances
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

        {/* Batch ID Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Batch ID (e.g., BATCH-2026-CHX9, BATCH-2026-RAW2)"
              className="w-full pl-10 pr-4 py-3 bg-[#0b2217] border border-emerald-700 rounded-xl text-sm font-mono text-amber-300 placeholder-emerald-600 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            onClick={() => handleSearch(searchQuery)}
            className="bg-amber-500 hover:bg-amber-400 text-emerald-950 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider font-mono cursor-pointer"
          >
            Inspect Batch
          </button>
        </div>

        {/* Batch Quick Sample Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-emerald-400 font-mono text-[11px]">Try sample batches:</span>
          {Object.keys(MOCK_BATCH_TRACE_RECORDS).map(id => (
            <button
              key={id}
              onClick={() => {
                setSearchQuery(id);
                handleSearch(id);
              }}
              className="bg-[#0b2217] border border-emerald-800 hover:border-amber-400 px-2.5 py-1 rounded-lg text-emerald-300 font-mono text-[11px]"
            >
              {id}
            </button>
          ))}
        </div>

        {/* Traceability Result Report */}
        {activeRecord ? (
          <div className="bg-[#0b2217] rounded-2xl border border-emerald-800 p-5 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
              <div>
                <span className="text-amber-400 font-bold text-sm">{activeRecord.batchId}</span>
                <div className="text-emerald-200 font-sans font-bold text-base mt-0.5">{activeRecord.breedOrCut}</div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-bold text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                DVS Passed & Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-emerald-200">
              <div className="space-y-1">
                <div className="text-emerald-400 font-bold text-[11px] uppercase">Sourcing Farm</div>
                <div>{activeRecord.farmName}</div>
                <div className="text-slate-400 text-[11px]">{activeRecord.location}</div>
              </div>

              <div className="space-y-1">
                <div className="text-emerald-400 font-bold text-[11px] uppercase">Timestamp & Climate</div>
                <div>{activeRecord.hatchOrSlaughterDate}</div>
                <div className="text-amber-300 text-[11px]">{activeRecord.temperatureLog}</div>
              </div>
            </div>

            {/* Vaccination Log */}
            <div className="pt-2 border-t border-emerald-800/80 space-y-1.5">
              <div className="text-emerald-400 font-bold text-[11px] uppercase">Vaccination & Bio-Shield History</div>
              <div className="space-y-1">
                {activeRecord.vaccinationHistory.map((vac, idx) => (
                  <div key={idx} className="bg-[#123524] p-2 rounded-lg border border-emerald-800 flex justify-between text-[11px]">
                    <span className="text-amber-300 font-bold">✓ {vac.vaccine}</span>
                    <span className="text-emerald-400">{vac.dateAdministered}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Regulatory Sign-Off */}
            <div className="pt-2 border-t border-emerald-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="bg-[#123524] p-2.5 rounded-xl border border-emerald-800">
                <div className="text-emerald-400 font-bold">Lab Screening Result</div>
                <div className="text-emerald-200 mt-0.5">{activeRecord.labTestStatus}</div>
              </div>
              <div className="bg-[#123524] p-2.5 rounded-xl border border-emerald-800">
                <div className="text-emerald-400 font-bold">Veterinary Sign-Off</div>
                <div className="text-emerald-200 mt-0.5">{activeRecord.veterinarySignOff}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-emerald-400 font-mono text-xs bg-[#0b2217] rounded-2xl border border-emerald-800">
            No batch found matching "{searchQuery}". Try selecting one of the sample batch IDs above.
          </div>
        )}

      </div>
    </div>
  );
}
