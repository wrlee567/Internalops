'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Shield, X, Save } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MOCK_CPIS } from '@/lib/mockData';
import { classificationColor, statusColor, generateId, formatDate } from '@/lib/utils';
import type { CPI } from '@/lib/types';

const BLANK: Omit<CPI, 'id'> = {
  programName: '', cpiName: '', description: '', classificationLevel: 'SECRET',
  category: 'Technology', protectionStatus: 'Protected', owner: '',
  lastReviewDate: '', nextReviewDate: '', notes: '',
};

export default function CPIRegistry() {
  const [cpis, setCpis, loaded] = useLocalStorage<CPI[]>('secops-cpis', MOCK_CPIS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CPI | null>(null);
  const [form, setForm] = useState<Omit<CPI, 'id'>>(BLANK);

  const filtered = cpis.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.cpiName.toLowerCase().includes(q) || c.programName.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    const matchStatus = !filterStatus || c.protectionStatus === filterStatus;
    const matchClass = !filterClass || c.classificationLevel === filterClass;
    return matchSearch && matchStatus && matchClass;
  });

  const openAdd = () => { setEditing(null); setForm(BLANK); setShowForm(true); };
  const openEdit = (c: CPI) => { setEditing(c); setForm({ ...c }); setShowForm(true); };

  const save = () => {
    if (!form.programName || !form.cpiName) return;
    if (editing) {
      setCpis((prev) => prev.map((c) => c.id === editing.id ? { ...form, id: editing.id } : c));
    } else {
      setCpis((prev) => [...prev, { ...form, id: generateId('cpi') }]);
    }
    setShowForm(false);
  };

  const remove = (id: string) => {
    if (confirm('Delete this CPI record?')) setCpis((prev) => prev.filter((c) => c.id !== id));
  };

  if (!loaded) return null;

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-slate-300">Home</Link>
          <span>/</span>
          <Link href="/opsec" className="hover:text-slate-300">OPSEC</Link>
          <span>/</span><span>CPI Registry</span>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-600/20 border border-blue-700/40 flex items-center justify-center">
              <Shield size={18} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">CPI Registry</h1>
              <p className="text-sm text-slate-400">Critical Program Information — classified asset register</p>
            </div>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
            <Plus size={14} />Add CPI
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search CPIs, programs…"
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-600" />
        </div>
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700 rounded text-slate-300 focus:outline-none focus:border-blue-600">
          <option value="">All Classifications</option>
          {['TS/SCI','TOP SECRET','SECRET','CONFIDENTIAL'].map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700 rounded text-slate-300 focus:outline-none focus:border-blue-600">
          <option value="">All Statuses</option>
          {['Protected','At-Risk','Under Review','Compromised'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Program','CPI Name','Classification','Category','Status','Owner','Next Review',''].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500 text-sm">No CPIs match the current filters.</td></tr>
            ) : filtered.map((cpi) => (
              <tr key={cpi.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-xs font-mono font-semibold text-blue-400">{cpi.programName}</td>
                <td className="px-4 py-3 text-xs text-slate-300 max-w-xs">
                  <div className="truncate max-w-[220px]" title={cpi.cpiName}>{cpi.cpiName}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${classificationColor(cpi.classificationLevel)}`}>
                    {cpi.classificationLevel}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{cpi.category}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor(cpi.protectionStatus)}`}>
                    {cpi.protectionStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{cpi.owner}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{formatDate(cpi.nextReviewDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(cpi)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                    <button onClick={() => remove(cpi.id)} className="text-xs text-slate-600 hover:text-red-400 transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-600">{filtered.length} of {cpis.length} CPIs shown</div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h2 className="font-semibold text-slate-100">{editing ? 'Edit CPI' : 'Register New CPI'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Program Name *">
                  <input value={form.programName} onChange={(e) => setForm((p) => ({ ...p, programName: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Classification *">
                  <select value={form.classificationLevel} onChange={(e) => setForm((p) => ({ ...p, classificationLevel: e.target.value as CPI['classificationLevel'] }))} className={inputCls}>
                    {['TS/SCI','TOP SECRET','SECRET','CONFIDENTIAL','UNCLASSIFIED'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="CPI Name *">
                <input value={form.cpiName} onChange={(e) => setForm((p) => ({ ...p, cpiName: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as CPI['category'] }))} className={inputCls}>
                    {['Technology','Operations','Personnel','Infrastructure','Methodology'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Protection Status">
                  <select value={form.protectionStatus} onChange={(e) => setForm((p) => ({ ...p, protectionStatus: e.target.value as CPI['protectionStatus'] }))} className={inputCls}>
                    {['Protected','At-Risk','Under Review','Compromised'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Owner">
                  <input value={form.owner} onChange={(e) => setForm((p) => ({ ...p, owner: e.target.value }))} className={inputCls} />
                </Field>
                <div />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Last Review Date">
                  <input type="date" value={form.lastReviewDate} onChange={(e) => setForm((p) => ({ ...p, lastReviewDate: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Next Review Date">
                  <input type="date" value={form.nextReviewDate} onChange={(e) => setForm((p) => ({ ...p, nextReviewDate: e.target.value }))} className={inputCls} />
                </Field>
              </div>
              <Field label="Notes">
                <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2} className={inputCls} />
              </Field>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-800">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
              <button onClick={save} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
                <Save size={13} />{editing ? 'Save Changes' : 'Register CPI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full px-2.5 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-600';
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  );
}
