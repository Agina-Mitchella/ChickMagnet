import { AlertTriangle, MessageSquare, Phone, X } from 'lucide-react';

interface MortalityClaimRitualProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'claim' | 'invoice';
}

const SUPPORT_NUMBER = '0724300781';

export default function MortalityClaimRitual({
  isOpen,
  onClose,
}: MortalityClaimRitualProps) {
  if (!isOpen) return null;

  const reportMessage = [
    'Hello ChickMagnet, I need to report a problem with a live chicken delivery.',
    '',
    'Order number:',
    'Delivery date and time:',
    'Number of weak, injured or dead chicks:',
    'What I observed:',
  ].join('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-md sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delivery-report-title"
        className="relative w-full max-w-xl space-y-6 rounded-3xl border border-emerald-800 bg-[#123524] p-5 text-amber-50 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4 border-b border-emerald-800 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-400">Live chicken delivery</p>
            <h2 id="delivery-report-title" className="mt-1 font-serif text-2xl font-black text-amber-300">
              Report a delivery problem
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close delivery problem report"
            className="cursor-pointer rounded-full p-2 text-emerald-300 hover:bg-emerald-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <h3 className="font-bold text-amber-200">Contact ChickMagnet immediately</h3>
            <p className="mt-1 text-sm leading-6 text-emerald-100">
              If chicks arrive weak, injured or dead, report the problem as soon as you receive the delivery. Keep the packaging and provide your order number, the delivery time, the number affected and clear photos or video.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b2217] p-4 text-sm leading-6 text-emerald-100">
          ChickMagnet will review the report and contact you about the available resolution. Submitting a report does not automatically approve a refund, replacement or store credit.
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href={`tel:${SUPPORT_NUMBER}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3.5 text-sm font-black text-emerald-950 hover:bg-amber-300"
          >
            <Phone className="h-4 w-4" />
            Call {SUPPORT_NUMBER}
          </a>
          <a
            href={`sms:${SUPPORT_NUMBER}?body=${encodeURIComponent(reportMessage)}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-white/[0.07] px-4 py-3.5 text-sm font-black text-amber-200 hover:bg-white/[0.12]"
          >
            <MessageSquare className="h-4 w-4" />
            Send report by SMS
          </a>
        </div>
      </div>
    </div>
  );
}
