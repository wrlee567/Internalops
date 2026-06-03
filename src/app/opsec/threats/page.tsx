'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Plus, Search, X, Save } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MOCK_THREATS, MOCK_CPIS } from '@/lib/mockData';
import { riskColor, statusColor, generateId, formatDate, deriveRiskLevel } from '@/lib/utils';
import type { ThreatAssessment, CPI } from '@/lib/types';

const BLANK: Omit<ThreatAssessment, 'id' | 'riskLevel'> = {
  cpiId: '', threatActor: '', threatCategory: 'Foreign Intelligence',
  description: '', probability: 'Medium', impact: 'Medium',
  status: 'Open', dateIdentified: '', dateResolved: '', analystNotes: '',
};

const RISK_MATRIX: Record<string, string> = {
  'High-High': 'Critical', 'High-Medium': 'High', 'High-Low': 'Medium',
  'Medium-High': 'High', 'Medium-Medium': 'Medium', 'Medium-Low': 'Low',
  'Low-High': 'Medium', 'Low-Medium': 'Low', 'Low-Low': 'Low',
};

const PROB_COLOR: Record<string, string> = { High: 'text-red-400', Medium: 'text-yellow-400', Low: 'text-green-400' };

export default function ThreatAssessments() {
  const [threats, setThreats, loaded] = useLocalStorage<ThreatAssessment[]>('secops-threats', MOCK_THREATS);
  const [cpis] = useLocalStorage('secops-cpis', MOCK_CPIS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ThreatAssessment | null>(null);
  const [form, setForm] = useState<Omit<ThreatAssessment, 'id' | 'riskLevel'>>(BLANK);

  const filtered = threats.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.threatActor.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    const matchStatus = !filterStatus || t.status === filterStatus;
    const matchRisk = !filterRisk || t.riskLevel === filterRisk;
    return matchSearch && matchStatus && matchRisk;
  });

  const openAdd = () => { setEditing(null); setForm(BLANK); setShowForm(true); };
  const openEdit = (t: ThreatAssessment) => { setEditing(t); setForm({ ...t }); setShowForm(true); };

  const save = () => {
    if (!form.threatActor || !form.cpiId) return;
    const riskLevel = deriveRiskLevel(form.probability, form.impact);
    if (editing) {
      setThreats((prev) => prev.map((t) => t.id === editing.id ? { ...form, riskLevel, id: editing.id } : t));
    } else {
      setThreats((prev) => [...prev, { ...form, riskLevel, id: generateId('threat') }]);
    }
    setShowForm(false);
  };

  const remove = (id: string) => {
    if (confirm('Delete this threat assessment?')) setThreats((prev) => prev.filter((t) => t.id !== id));
  };

  if (!loaded) return null;

  const critCount = threats.filter((t) => t.riskLevel === 'Critical').length;
  const highCount = threats.filter((t) => t.riskLevel === 'High').length;

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
          <Link href="/opsec" className="hover:text-slate-300">OPSEC</Link><span>/</span>
          <span>Threat Assessments</span>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-red-600/20 border border-red-700/40 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Threat Assessments</h1>
              <p className="text-sm text-slate-400">Probability/impact analysis for all identified threats</p>
            </div>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
            <Plus size={14} />New Assessment
          </button>
        </div>
      </div>

      {/* Risk summary chips */}
      <div className="flex gap-3 mb-5">
        {[
          { label: 'Critical', count: critCount, cls: 'bg-red-900/40 text-red-300 border-red-800' },
          { label: 'High', count: highCount, cls: 'bg-orange-900/40 text-orange-300 border-orange-800' },
          { label: 'Open', count: threats.filter(t=>t.status==='Open').length, cls: 'bg-yellow-900/40 text-yellow-300 border-yellow-800' },
          { label: 'Mitigated', count: threats.filter(t=>t.status==='Mitigated').length, cls: 'bg-green-900/40 text-green-300 border-green-800' },
        ].map((chip) => (
          <div key={chip.label} className={`px-3 py-1.5 rounded border text-xs font-medium flex items-center gap-2 ${chip.cls}`}>
            <span className="text-base font-bold">{chip.count}</span> {chip.label}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search threat actor, description…"
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-600" />
        </div>
        <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700 rounded text-slate-300 focus:outline-none focus:border-blue-600">
          <option value="">All Risk Levels</option>
          {['Critical','High','Medium','Low'].map((v) => <option key={v}>{v}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700 rounded text-slate-300 focus:outline-none focus:border-blue-600">
          <option value="">All Statuses</option>
          {['Open','Monitoring','Accepted','Mitigated'].map((v) => <option key={v}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Threat Actor','Category','CPI','Prob','Impact','Risk','Status','Date Identified',''].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {filtered.length === 0
              ? <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500 text-sm">No threats match the filters.</td></tr>
              : filtered.map((t) => {
                const cpi = cpis.find((c: { id: string }) => c.id === t.cpiId);
                return (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-3 text-xs text-slate-300 max-w-[200px]">
                      <div className="truncate" title={t.threatActor}>{t.threatActor}</div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-400 whitespace-nowrap">{t.threatCategory}</td>
                    <td className="px-3 py-3 text-xs font-mono text-blue-400">{(cpi as { programName: string })?.programName ?? '—'}</td>
                    <td className={`px-3 py-3 text-xs font-medium ${PROB_COLOR[t.probability]}`}>{t.probability}</td>
                    <td className={`px-3 py-3 text-xs font-medium ${PROB_COLOR[t.impact]}`}>{t.impact}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${riskColor(t.riskLevel)}`}>{t.riskLevel}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor(t.status)}`}>{t.status}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(t.dateIdentified)}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(t)} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                        <button onClick={() => remove(t.id)} className="text-xs text-slate-600 hover:text-red-400">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-600">{filtered.length} of {threats.length} assessments shown</div>

      {/* Risk Matrix callout */}
      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/30 p-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Risk Matrix</div>
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse">
            <thead>
              <tr>
                <th className="px-2 py-1 text-slate-500 text-left w-20">Prob ↓ / Impact →</th>
                {['Low','Medium','High'].map((h) => (
                  <th key={h} className="px-4 py-1 text-slate-500 font-medium text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(['High','Medium','Low'] as const).map((prob) => (
                <tr key={prob}>
                  <td className={`px-2 py-1 font-medium ${PROB_COLOR[prob]}`}>{prob}</td>
                  {(['Low','Medium','High'] as const).map((impact) => {
                    const risk = RISK_MATRIX[`${prob}-${impact}`];
                    return (
                      <td key={impact} className="px-4 py-1 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs ${riskColor(risk)}`}>{risk}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h2 className="font-semibold text-slate-100">{editing ? 'Edit Threat Assessment' : 'New Threat Assessment'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <Field label="Linked CPI *">
                <select value={form.cpiId} onChange={(e) => setForm((p) => ({ ...p, cpiId: e.target.value }))} className={inputCls}>
                  <option value="">— Select CPI —</option>
                  {cpis.map((c: CPI) => <option key={c.id} value={c.id}>{c.programName} — {c.cpiName}</option>)}
                </select>
              </Field>
              <Field label="Threat Actor *">
                <input value={form.threatActor} onChange={(e) => setForm((p) => ({ ...p, threatActor: e.target.value }))} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <select value={form.threatCategory} onChange={(e) => setForm((p) => ({ ...p, threatCategory: e.target.value as ThreatAssessment['threatCategory'] }))} className={inputCls}>
                    {['Foreign Intelligence','Insider Threat','Cyber','Physical','Open Source'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ThreatAssessment['status'] }))} className={inputCls}>
                    {['Open','Monitoring','Accepted','Mitigated'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Probability">
                  <select value={form.probability} onChange={(e) => setForm((p) => ({ ...p, probability: e.target.value as ThreatAssessment['probability'] }))} className={inputCls}>
                    {['High','Medium','Low'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Impact">
                  <select value={form.impact} onChange={(e) => setForm((p) => ({ ...p, impact: e.target.value as ThreatAssessment['impact'] }))} className={inputCls}>
                    {['High','Medium','Low'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
              </div>
              <div className="px-3 py-2 rounded bg-slate-800/60 border border-slate-700 text-xs text-slate-400">
                Computed Risk Level: <span className={`font-semibold ${riskColor(RISK_MATRIX[`${form.probability}-${form.impact}`] ?? 'Medium').split(' ')[1]}`}>
                  {RISK_MATRIX[`${form.probability}-${form.impact}`] ?? 'Medium'}
                </span>
              </div>
              <Field label="Description">
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date Identified">
                  <input type="date" value={form.dateIdentified} onChange={(e) => setForm((p) => ({ ...p, dateIdentified: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Date Resolved">
                  <input type="date" value={form.dateResolved ?? ''} onChange={(e) => setForm((p) => ({ ...p, dateResolved: e.target.value }))} className={inputCls} />
                </Field>
              </div>
              <Field label="Analyst Notes">
                <textarea value={form.analystNotes} onChange={(e) => setForm((p) => ({ ...p, analystNotes: e.target.value }))} rows={2} className={inputCls} />
              </Field>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-800">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
              <button onClick={save} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium">
                <Save size={13} />{editing ? 'Save Changes' : 'Create Assessment'}
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
