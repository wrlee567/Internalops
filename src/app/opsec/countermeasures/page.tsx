'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Plus, Search, X, Save } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MOCK_COUNTERMEASURES, MOCK_CPIS } from '@/lib/mockData';
import { statusColor, generateId, formatDate } from '@/lib/utils';
import type { Countermeasure, CPI } from '@/lib/types';

const BLANK: Omit<Countermeasure, 'id'> = {
  linkedCpiId: '', linkedIndicatorId: '', type: 'Administrative', title: '',
  description: '', owner: '', implementationDate: '', effectiveness: 'Unknown',
  status: 'Pending', reviewDate: '',
};

const EFF_COLOR: Record<string, string> = {
  High: 'text-green-400', Medium: 'text-yellow-400', Low: 'text-red-400', Unknown: 'text-slate-400',
};

const TYPE_COLOR: Record<string, string> = {
  Administrative: 'bg-blue-900/40 text-blue-300 border-blue-800',
  Physical: 'bg-orange-900/40 text-orange-300 border-orange-800',
  Technical: 'bg-purple-900/40 text-purple-300 border-purple-800',
  Personnel: 'bg-teal-900/40 text-teal-300 border-teal-800',
  Information: 'bg-slate-700 text-slate-300 border-slate-600',
};

export default function CountermeasuresPage() {
  const [cms, setCms, loaded] = useLocalStorage<Countermeasure[]>('secops-countermeasures', MOCK_COUNTERMEASURES);
  const [cpis] = useLocalStorage<CPI[]>('secops-cpis', MOCK_CPIS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Countermeasure | null>(null);
  const [form, setForm] = useState<Omit<Countermeasure, 'id'>>(BLANK);

  const filtered = cms.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.owner.toLowerCase().includes(q);
    const matchStatus = !filterStatus || c.status === filterStatus;
    const matchType = !filterType || c.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const openAdd = () => { setEditing(null); setForm(BLANK); setShowForm(true); };
  const openEdit = (c: Countermeasure) => { setEditing(c); setForm({ ...c }); setShowForm(true); };

  const save = () => {
    if (!form.title) return;
    if (editing) {
      setCms((prev) => prev.map((c) => c.id === editing.id ? { ...form, id: editing.id } : c));
    } else {
      setCms((prev) => [...prev, { ...form, id: generateId('cm') }]);
    }
    setShowForm(false);
  };

  const remove = (id: string) => {
    if (confirm('Delete this countermeasure?')) setCms((prev) => prev.filter((c) => c.id !== id));
  };

  if (!loaded) return null;

  const activeCount = cms.filter((c) => c.status === 'Active').length;
  const pendingCount = cms.filter((c) => c.status === 'Pending').length;

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
          <Link href="/opsec" className="hover:text-slate-300">OPSEC</Link><span>/</span>
          <span>Countermeasures</span>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-green-600/20 border border-green-700/40 flex items-center justify-center">
              <CheckCircle size={18} className="text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Countermeasures Log</h1>
              <p className="text-sm text-slate-400">Administrative, physical, technical, and personnel mitigations</p>
            </div>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
            <Plus size={14} />Add Countermeasure
          </button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { label: 'Total', value: cms.length, cls: 'border-slate-700 text-slate-300' },
          { label: 'Active', value: activeCount, cls: 'bg-green-900/30 border-green-800 text-green-300' },
          { label: 'Pending', value: pendingCount, cls: 'bg-yellow-900/30 border-yellow-800 text-yellow-300' },
          { label: 'High Effectiveness', value: cms.filter(c=>c.effectiveness==='High').length, cls: 'bg-blue-900/30 border-blue-800 text-blue-300' },
        ].map((chip) => (
          <div key={chip.label} className={`px-3 py-1.5 rounded border text-xs font-medium flex items-center gap-2 ${chip.cls}`}>
            <span className="text-base font-bold">{chip.value}</span> {chip.label}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search countermeasures…"
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-600" />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700 rounded text-slate-300 focus:outline-none focus:border-blue-600">
          <option value="">All Types</option>
          {['Administrative','Physical','Technical','Personnel','Information'].map((v) => <option key={v}>{v}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700 rounded text-slate-300 focus:outline-none focus:border-blue-600">
          <option value="">All Statuses</option>
          {['Active','Pending','Expired','Cancelled'].map((v) => <option key={v}>{v}</option>)}
        </select>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0
          ? <div className="text-center py-8 text-slate-500 text-sm">No countermeasures match the filters.</div>
          : filtered.map((cm) => {
            const cpi = cpis.find((c) => c.id === cm.linkedCpiId);
            return (
              <div key={cm.id} className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-4 hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${TYPE_COLOR[cm.type] ?? 'bg-slate-700 text-slate-300 border-slate-600'}`}>{cm.type}</span>
                      {cpi && <span className="text-xs font-mono text-blue-400">{cpi.programName}</span>}
                      <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor(cm.status)}`}>{cm.status}</span>
                      <span className="text-xs text-slate-500">
                        Effectiveness: <span className={`font-medium ${EFF_COLOR[cm.effectiveness]}`}>{cm.effectiveness}</span>
                      </span>
                    </div>
                    <div className="font-semibold text-slate-200 text-sm mb-1">{cm.title}</div>
                    <p className="text-xs text-slate-400">{cm.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-600">
                      {cm.owner && <span>Owner: <span className="text-slate-400">{cm.owner}</span></span>}
                      {cm.implementationDate && <span>Implemented: <span className="text-slate-400">{formatDate(cm.implementationDate)}</span></span>}
                      {cm.reviewDate && <span>Review: <span className="text-slate-400">{formatDate(cm.reviewDate)}</span></span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(cm)} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                    <button onClick={() => remove(cm.id)} className="text-xs text-slate-600 hover:text-red-400">Delete</button>
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>
      <div className="mt-3 text-xs text-slate-600">{filtered.length} of {cms.length} countermeasures shown</div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h2 className="font-semibold text-slate-100">{editing ? 'Edit Countermeasure' : 'Add Countermeasure'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <Field label="Title *">
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Type">
                  <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as Countermeasure['type'] }))} className={inputCls}>
                    {['Administrative','Physical','Technical','Personnel','Information'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Countermeasure['status'] }))} className={inputCls}>
                    {['Active','Pending','Expired','Cancelled'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Linked CPI">
                <select value={form.linkedCpiId ?? ''} onChange={(e) => setForm((p) => ({ ...p, linkedCpiId: e.target.value }))} className={inputCls}>
                  <option value="">— None —</option>
                  {cpis.map((c) => <option key={c.id} value={c.id}>{c.programName} — {c.cpiName}</option>)}
                </select>
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Owner">
                  <input value={form.owner} onChange={(e) => setForm((p) => ({ ...p, owner: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Effectiveness">
                  <select value={form.effectiveness} onChange={(e) => setForm((p) => ({ ...p, effectiveness: e.target.value as Countermeasure['effectiveness'] }))} className={inputCls}>
                    {['High','Medium','Low','Unknown'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Implementation Date">
                  <input type="date" value={form.implementationDate} onChange={(e) => setForm((p) => ({ ...p, implementationDate: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Review Date">
                  <input type="date" value={form.reviewDate} onChange={(e) => setForm((p) => ({ ...p, reviewDate: e.target.value }))} className={inputCls} />
                </Field>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-800">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
              <button onClick={save} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium">
                <Save size={13} />{editing ? 'Save Changes' : 'Add Countermeasure'}
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
  return <div><label className="block text-xs text-slate-400 mb-1">{label}</label>{children}</div>;
}
