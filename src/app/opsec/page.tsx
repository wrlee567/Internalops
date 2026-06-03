'use client';
import Link from 'next/link';
import { Eye, Shield, AlertTriangle, Target, CheckCircle } from 'lucide-react';
import { MOCK_CPIS, MOCK_THREATS, MOCK_INDICATORS, MOCK_COUNTERMEASURES } from '@/lib/mockData';
import { riskColor, statusColor } from '@/lib/utils';

export default function OpsecOverview() {
  const criticalThreats = MOCK_THREATS.filter((t) => t.riskLevel === 'Critical');
  const openThreats = MOCK_THREATS.filter((t) => t.status === 'Open');
  const highExposure = MOCK_INDICATORS.filter((i) => i.currentExposure === 'High');
  const pendingCM = MOCK_COUNTERMEASURES.filter((c) => c.status === 'Pending');

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-slate-300">Home</Link>
          <span>/</span><span>OPSEC</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-blue-600/20 border border-blue-700/40 flex items-center justify-center">
            <Eye size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">OPSEC Program</h1>
            <p className="text-sm text-slate-400">Operational Security — CPI protection, threat tracking, indicators & countermeasures</p>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Registered CPIs', value: MOCK_CPIS.length, sub: `${MOCK_CPIS.filter((c) => c.protectionStatus === 'At-Risk').length} at risk`, color: 'text-blue-400', href: '/opsec/cpi', Icon: Shield },
          { label: 'Active Threats', value: openThreats.length, sub: `${criticalThreats.length} critical`, color: 'text-red-400', href: '/opsec/threats', Icon: AlertTriangle },
          { label: 'High Exposure', value: highExposure.length, sub: 'indicators needing action', color: 'text-yellow-400', href: '/opsec/indicators', Icon: Target },
          { label: 'Countermeasures', value: MOCK_COUNTERMEASURES.filter(c => c.status === 'Active').length, sub: `${pendingCM.length} pending implementation`, color: 'text-green-400', href: '/opsec/countermeasures', Icon: CheckCircle },
        ].map((k) => (
          <Link key={k.label} href={k.href}
            className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 hover:border-slate-700 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xl font-bold text-slate-100">{k.value}</div>
                <div className="text-xs text-slate-300 font-medium">{k.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{k.sub}</div>
              </div>
              <k.Icon size={16} className={k.color} />
            </div>
          </Link>
        ))}
      </div>

      {/* Sub-module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { href: '/opsec/cpi', label: 'CPI Registry', desc: 'Critical Program Information — classified asset register', icon: Shield },
          { href: '/opsec/threats', label: 'Threat Assessments', desc: 'Probability/impact matrix for all identified threats', icon: AlertTriangle },
          { href: '/opsec/indicators', label: 'OPSEC Indicators', desc: 'Observable actions or signatures revealing CPI', icon: Eye },
          { href: '/opsec/countermeasures', label: 'Countermeasures', desc: 'Administrative, physical, and technical mitigations', icon: CheckCircle },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.href} href={m.href}
              className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:border-blue-800/60 hover:bg-slate-800/40 transition-all group">
              <Icon size={20} className="text-blue-400 mb-3" />
              <div className="font-semibold text-slate-200 text-sm mb-1">{m.label}</div>
              <div className="text-xs text-slate-500">{m.desc}</div>
            </Link>
          );
        })}
      </div>

      {/* Open threats table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Open Threats</h2>
          <Link href="/opsec/threats" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Threat Actor', 'Category', 'Linked CPI', 'Risk', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {MOCK_THREATS.filter((t) => t.status !== 'Mitigated').slice(0, 5).map((t) => {
                const cpi = MOCK_CPIS.find((c) => c.id === t.cpiId);
                return (
                  <tr key={t.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-2.5 text-xs text-slate-300">{t.threatActor}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-400">{t.threatCategory}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-blue-400">{cpi?.programName ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${riskColor(t.riskLevel)}`}>{t.riskLevel}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor(t.status)}`}>{t.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
