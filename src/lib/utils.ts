import type { Probability, Impact, RiskLevel } from './types';

export function deriveRiskLevel(probability: Probability, impact: Impact): RiskLevel {
  const matrix: Record<string, RiskLevel> = {
    'High-High': 'Critical',
    'High-Medium': 'High',
    'High-Low': 'Medium',
    'Medium-High': 'High',
    'Medium-Medium': 'Medium',
    'Medium-Low': 'Low',
    'Low-High': 'Medium',
    'Low-Medium': 'Low',
    'Low-Low': 'Low',
  };
  return matrix[`${probability}-${impact}`] ?? 'Medium';
}

export function classificationColor(level: string) {
  switch (level) {
    case 'TS/SCI': return 'bg-orange-900/50 text-orange-300 border border-orange-700';
    case 'TOP SECRET': return 'bg-red-900/50 text-red-300 border border-red-700';
    case 'SECRET': return 'bg-yellow-900/50 text-yellow-300 border border-yellow-700';
    case 'CONFIDENTIAL': return 'bg-blue-900/50 text-blue-300 border border-blue-700';
    default: return 'bg-slate-700 text-slate-300 border border-slate-600';
  }
}

export function riskColor(level: string) {
  switch (level) {
    case 'Critical': return 'bg-red-900/50 text-red-300 border border-red-700';
    case 'High': return 'bg-orange-900/50 text-orange-300 border border-orange-700';
    case 'Medium': return 'bg-yellow-900/50 text-yellow-300 border border-yellow-700';
    case 'Low': return 'bg-green-900/50 text-green-300 border border-green-700';
    default: return 'bg-slate-700 text-slate-300 border border-slate-600';
  }
}

export function statusColor(status: string) {
  switch (status) {
    case 'Protected': case 'Active': case 'Mitigated': return 'bg-green-900/50 text-green-300 border border-green-700';
    case 'At-Risk': case 'Open': case 'Pending': return 'bg-yellow-900/50 text-yellow-300 border border-yellow-700';
    case 'Compromised': case 'Expired': case 'Cancelled': return 'bg-red-900/50 text-red-300 border border-red-700';
    case 'Under Review': case 'Monitoring': case 'Accepted': return 'bg-blue-900/50 text-blue-300 border border-blue-700';
    default: return 'bg-slate-700 text-slate-300 border border-slate-600';
  }
}

export function exposureColor(level: string) {
  switch (level) {
    case 'High': return 'text-red-400';
    case 'Medium': return 'text-yellow-400';
    case 'Low': return 'text-green-400';
    case 'Mitigated': return 'text-blue-400';
    default: return 'text-slate-400';
  }
}

export function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function formatDate(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}
