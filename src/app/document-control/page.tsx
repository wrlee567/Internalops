import Link from 'next/link';
import { FileText, Lock } from 'lucide-react';

const FEATURES = [
  'Classified document inventory — serial numbers, classification level, custodian',
  'Check-in / check-out log with chain-of-custody trail',
  'Destruction certification records — SF-715 / DD-2861 equivalents',
  'Annual inventory reconciliation workflow with discrepancy tracking',
  'Downgrade and declassification tracking with review schedules',
  'Unauthorized disclosure incident log and reporting workflow',
];

export default function DocumentControl() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
          <span>Document Control</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-slate-700/50 border border-slate-600/40 flex items-center justify-center">
            <FileText size={18} className="text-slate-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Document Control</h1>
            <p className="text-sm text-slate-400">Classified document inventory, check-in/out, destruction certification</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-8 text-center mb-6">
        <Lock size={32} className="text-slate-600 mx-auto mb-3" />
        <div className="text-slate-300 font-semibold mb-1">Module In Development</div>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Document Control will handle the full lifecycle of classified materials — creation, custody, transmission, and destruction — in line with NISPOM Chapter 5 requirements.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Planned Features</h2>
        <div className="space-y-2">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg border border-slate-800 bg-slate-900/30">
              <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
              </div>
              <span className="text-sm text-slate-400">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
