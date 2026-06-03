'use client';
import Link from 'next/link';
import { Shield, Eye, Users, KeyRound, FileText, BookOpen, UserCheck, AlertTriangle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { MOCK_CPIS, MOCK_THREATS, MOCK_INDICATORS, MOCK_COUNTERMEASURES } from '@/lib/mockData';

const openThreats = MOCK_THREATS.filter((t) => t.status === 'Open').length;
const criticalThreats = MOCK_THREATS.filter((t) => t.riskLevel === 'Critical').length;
const atRiskCPIs = MOCK_CPIS.filter((c) => c.protectionStatus === 'At-Risk').length;
const unmitigatedIndicators = MOCK_INDICATORS.filter((i) => !i.countermeasureApplied).length;

const SUMMARY_CARDS = [
  {
    label: 'Registered CPIs',
    value: MOCK_CPIS.length,
    sub: `${atRiskCPIs} at risk`,
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-900/20 border-blue-800/40',
    href: '/opsec/cpi',
  },
  {
    label: 'Open Threats',
    value: openThreats,
    sub: `${criticalThreats} critical`,
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'bg-red-900/20 border-red-800/40',
    href: '/opsec/threats',
  },
  {
    label: 'Indicators Tracked',
    value: MOCK_INDICATORS.length,
    sub: `${unmitigatedIndicators} need countermeasures`,
    icon: Eye,
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/20 border-yellow-800/40',
    href: '/opsec/indicators',
  },
  {
    label: 'Countermeasures',
    value: MOCK_COUNTERMEASURES.length,
    sub: `${MOCK_COUNTERMEASURES.filter((c) => c.status === 'Active').length} active`,
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-900/20 border-green-800/40',
    href: '/opsec/countermeasures',
  },
];

const MODULES = [
  { label: 'OPSEC Program', description: 'CPIs, threats, indicators, countermeasures', href: '/opsec', icon: Eye, status: 'Active' },
  { label: 'Personnel Security', description: 'Clearance tracking, SF-86, periodic reinvestigations', href: '/personnel', icon: Users, status: 'Coming Soon' },
  { label: 'Access Control', description: 'Badge management, zone access, visitor logs', href: '/access-control', icon: KeyRound, status: 'Coming Soon' },
  { label: 'Document Control', description: 'Classified inventory, check-in/out, destruction certs', href: '/document-control', icon: FileText, status: 'Coming Soon' },
  { label: 'Training & Compliance', description: 'CDSE/FSO curriculum, annual briefings, certifications', href: '/training', icon: BookOpen, status: 'Coming Soon' },
  { label: 'Visitor Management', description: 'Visit requests, escort logs, clearance verification', href: '/visitor', icon: UserCheck, status: 'Coming Soon' },
];

const RECENT_ACTIVITY = [
  { time: '2026-05-20', action: 'Threat opened', detail: 'OSINT exposure — CIPHER contractor social media', level: 'High', icon: AlertTriangle, color: 'text-orange-400' },
  { time: '2026-05-12', action: 'Threat opened', detail: 'HUMINT recruitment attempt — GUARDIAN engineers', level: 'Critical', icon: AlertTriangle, color: 'text-red-400' },
  { time: '2026-05-01', action: 'Threat monitoring', detail: 'APT cyber campaign against STARGATE network', level: 'High', icon: TrendingUp, color: 'text-orange-400' },
  { time: '2026-04-01', action: 'Countermeasure active', detail: 'GUARDIAN — Operational Pattern Randomization', level: 'Active', icon: CheckCircle, color: 'text-green-400' },
  { time: '2026-03-10', action: 'Countermeasure pending', detail: 'NIGHTWATCH — Travel Voucher Aggregation Policy', level: 'Pending', icon: Clock, color: 'text-yellow-400' },
];

export default function Dashboard() {
  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>Home</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Security Operations Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">Program security posture overview — all classifications</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {SUMMARY_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}
              className={`rounded-lg border p-4 hover:border-opacity-80 transition-all ${card.bg}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-100">{card.value}</div>
                  <div className="text-sm text-slate-300 font-medium mt-0.5">{card.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{card.sub}</div>
                </div>
                <Icon size={20} className={card.color} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Security Modules</h2>
          <div className="space-y-2">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link key={mod.href} href={mod.href}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 hover:border-slate-700 hover:bg-slate-800/40 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                      <Icon size={15} className="text-slate-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{mod.label}</div>
                      <div className="text-xs text-slate-500">{mod.description}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    mod.status === 'Active' ? 'bg-green-900/50 text-green-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {mod.status}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</h2>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 divide-y divide-slate-800">
            {RECENT_ACTIVITY.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <Icon size={13} className={`${a.color} mt-0.5 shrink-0`} />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-300 truncate">{a.detail}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{a.action} · {a.time}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CPI risk summary */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">CPI Protection Status</h2>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">Program</th>
                <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">CPI</th>
                <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">Classification</th>
                <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">Status</th>
                <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">Next Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {MOCK_CPIS.map((cpi) => (
                <tr key={cpi.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-mono text-blue-400">{cpi.programName}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-300 max-w-xs truncate">{cpi.cpiName}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                      cpi.classificationLevel === 'TS/SCI' ? 'bg-orange-900/40 text-orange-300' :
                      cpi.classificationLevel === 'TOP SECRET' ? 'bg-red-900/40 text-red-300' :
                      'bg-yellow-900/40 text-yellow-300'
                    }`}>{cpi.classificationLevel}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      cpi.protectionStatus === 'Protected' ? 'bg-green-900/40 text-green-300' :
                      cpi.protectionStatus === 'At-Risk' ? 'bg-yellow-900/40 text-yellow-300' :
                      'bg-blue-900/40 text-blue-300'
                    }`}>{cpi.protectionStatus}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{cpi.nextReviewDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
