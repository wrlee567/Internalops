'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, Plus, Search, X, Save, AlertCircle } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MOCK_INDICATORS, MOCK_CPIS } from '@/lib/mockData';
import { riskColor, exposureColor, generateId, formatDate } from '@/lib/utils';
import type { OpsecIndicator, CPI } from '@/lib/types';

const BLANK: Omit<OpsecIndicator, 'id'> = {
  cpiId: '', indicatorType: 'Information', description: '', observable: '',
  criticality: 'Medium', currentExposure: 'Medium', countermeasureApplied: false, reviewDate: '',
};

export default function OpsecIndicators() {
  const [indicators, setIndicators, loaded] = useLocalStorage<OpsecIndicator[]>('secops-indicators', MOCK_INDICATORS);
  const [cpis] = useLocalStorage<CPI[]>('secops-cpis', MOCK_CPIS);
  const [search, setSearch] = useState('');
  const [filterExposure, setFilterExposure] = useState('');
  const [filterCrit, setFilterCrit] = useState('');
  const [filterCM, setFilterCM] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<OpsecIndicator | null>(null);
  const [form, setForm] = useState<Omit<OpsecIndicator, 'id'>>(BLANK);

  const filtered = indicators.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.description.toLowerCase().includes(q) || i.observable.toLowerCase().includes(q);
    const matchExp = !filterExposure || i.currentExposure === filterExposure;
    const matchCrit = !filterCrit || i.criticality === filterCrit;
    const matchCM = filterCM === '' ? true : filterCM === 'yes' ? i.countermeasureApplied : !i.countermeasureApplied;
    return matchSearch && matchExp && matchCrit && matchCM;
  });

  const openAdd = () => { setEditing(null); setForm(BLANK); setShowForm(true); };
  const openEdit = (i: OpsecIndicator) => { setEditing(i); setForm({ ...i }); setShowForm(true); };

  const save = () => {
    if (!form.cpiId || !form.description) return;
    if (editing) {
      setIndicators((prev) => prev.map((i) => i.id === editing.id ? { ...form, id: editing.id } : i));
    } else {
      setIndicators((prev) => [...prev, { ...form, id: generateId('ind') }]);
    }
    setShowForm(false);
  };

  const remove = (id: string) => {
    if (confirm('Delete this indicator?')) setIndicators((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleCM = (id: string) => {
    setIndicators((prev) => prev.map((i) => i.id === id ? { ...i, countermeasureApplied: !i.countermeasureApplied } : i));
  };

  if (!loaded) return null;

  const needingAction = indicators.filter((i) => !i.countermeasureApplied && i.currentExposure !== 'Mitigated');

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
          <Link href="/opsec" className="hover:text-slate-300">OPSEC</Link><span>/</span>
          <span>Indicators</span>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-yellow-600/20 border border-yellow-700/40 flex items-center justify-center">
              <Eye size={18} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">OPSEC Indicators</h1>
              <p className="text-sm text-slate-400">Observable actions or signatures that could reveal Critical Program Information</p>
            </div>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
            <Plus size={14} />Add Indicator
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {needingAction.length > 0 && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-lg border border-yellow-800/60 bg-yellow-900/20">
          <AlertCircle size={15} className="text-yellow-400 mt-0.5 shrink-0" />
          <div className="text-sm text-yellow-300">
            <span className="font-semibold">{needingAction.length} indicator{needingAction.length > 1 ? 's' : ''}</span> have no countermeasure applied and remain exposed. Review and assign mitigations.
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search indicators…"
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-600" />
        </div>
        <select value={filterCrit} onChange={(e) => setFilterCrit(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700 rounded text-slate-300 focus:outline-none focus:border-blue-600">
          <option value="">All Criticality</option>
          {['Critical','High','Medium','Low'].map((v) => <option key={v}>{v}</option>)}
        </select>
        <select value={filterExposure} onChange={(e) => setFilterExposure(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700 rounded text-slate-300 focus:outline-none focus:border-blue-600">
          <option value="">All Exposure</option>
          {['High','Medium','Low','Mitigated'].map((v) => <option key={v}>{v}</option>)}
        </select>
        <select value={filterCM} onChange={(e) => setFilterCM(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700 rounded text-slate-300 focus:outline-none focus:border-blue-600">
          <option value="">All CM Status</option>
          <option value="yes">Has Countermeasure</option>
          <option value="no">No Countermeasure</option>
        </select>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0
          ? <div className="text-center py-8 text-slate-500 text-sm">No indicators match the filters.</div>
          : filtered.map((ind) => {
            const cpi = cpis.find((c) => c.id === ind.cpiId);
            return (
              <div key={ind.id} className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-4 hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs font-mono text-blue-400 font-semibold">{cpi?.programName ?? '—'}</span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-400">{ind.indicatorType}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${riskColor(ind.criticality)}`}>{ind.criticality}</span>
                      <span className="text-xs text-slate-500">
                        Exposure: <span className={`font-medium ${exposureColor(ind.currentExposure)}`}>{ind.currentExposure}</span>
                      </span>
                      {ind.countermeasureApplied
                        ? <span className="text-xs px-1.5 py-0.5 rounded bg-green-900/40 text-green-300 border border-green-800">Countermeasure Applied</span>
                        : <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-900">No Countermeasure</span>
                      }
                    </div>
                    <p className="text-sm text-slate-200 mb-1">{ind.description}</p>
                    <p className="text-xs text-slate-500"><span className="text-slate-600">Observable:</span> {ind.observable}</p>
                    {ind.reviewDate && <p className="text-xs text-slate-600 mt-1">Review: {formatDate(ind.reviewDate)}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => toggleCM(ind.id)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${ind.countermeasureApplied ? 'border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-800' : 'border-green-800 text-green-400 hover:bg-green-900/20'}`}>
                      {ind.countermeasureApplied ? 'Remove CM' : 'Mark CM Applied'}
                    </button>
                    <button onClick={() => openEdit(ind)} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                    <button onClick={() => remove(ind.id)} className="text-xs text-slate-600 hover:text-red-400">Delete</button>
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>
      <div className="mt-3 text-xs text-slate-600">{filtered.length} of {indicators.length} indicators shown</div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h2 className="font-semibold text-slate-100">{editing ? 'Edit Indicator' : 'Add OPSEC Indicator'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <Field label="Linked CPI *">
                <select value={form.cpiId} onChange={(e) => setForm((p) => ({ ...p, cpiId: e.target.value }))} className={inputCls}>
                  <option value="">— Select CPI —</option>
                  {cpis.map((c) => <option key={c.id} value={c.id}>{c.programName} — {c.cpiName}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Indicator Type">
                  <select value={form.indicatorType} onChange={(e) => setForm((p) => ({ ...p, indicatorType: e.target.value as OpsecIndicator['indicatorType'] }))} className={inputCls}>
                    {['Personnel','Physical','Information','Cyber','Activity'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Criticality">
                  <select value={form.criticality} onChange={(e) => setForm((p) => ({ ...p, criticality: e.target.value as OpsecIndicator['criticality'] }))} className={inputCls}>
                    {['Critical','High','Medium','Low'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Description *">
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className={inputCls} />
              </Field>
              <Field label="What is observable to an adversary?">
                <textarea value={form.observable} onChange={(e) => setForm((p) => ({ ...p, observable: e.target.value }))} rows={2} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Current Exposure">
                  <select value={form.currentExposure} onChange={(e) => setForm((p) => ({ ...p, currentExposure: e.target.value as OpsecIndicator['currentExposure'] }))} className={inputCls}>
                    {['High','Medium','Low','Mitigated'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Review Date">
                  <input type="date" value={form.reviewDate} onChange={(e) => setForm((p) => ({ ...p, reviewDate: e.target.value }))} className={inputCls} />
                </Field>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.countermeasureApplied}
                  onChange={(e) => setForm((p) => ({ ...p, countermeasureApplied: e.target.checked }))}
                  className="w-4 h-4 accent-blue-600" />
                <span className="text-sm text-slate-300">Countermeasure applied</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-800">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
              <button onClick={save} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium">
                <Save size={13} />{editing ? 'Save Changes' : 'Add Indicator'}
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
