import { describe, it, expect } from 'vitest';
import {
  deriveRiskLevel,
  classificationColor,
  riskColor,
  statusColor,
  exposureColor,
  formatDate,
  generateId,
} from '@/lib/utils';

// ─── deriveRiskLevel ──────────────────────────────────────────────────────────
// This is the risk matrix — 9 combinations. We test all of them so a future
// change to the matrix doesn't silently break the UI.
describe('deriveRiskLevel', () => {
  it('High probability + High impact → Critical', () => {
    expect(deriveRiskLevel('High', 'High')).toBe('Critical');
  });
  it('High probability + Medium impact → High', () => {
    expect(deriveRiskLevel('High', 'Medium')).toBe('High');
  });
  it('High probability + Low impact → Medium', () => {
    expect(deriveRiskLevel('High', 'Low')).toBe('Medium');
  });
  it('Medium probability + High impact → High', () => {
    expect(deriveRiskLevel('Medium', 'High')).toBe('High');
  });
  it('Medium probability + Medium impact → Medium', () => {
    expect(deriveRiskLevel('Medium', 'Medium')).toBe('Medium');
  });
  it('Medium probability + Low impact → Low', () => {
    expect(deriveRiskLevel('Medium', 'Low')).toBe('Low');
  });
  it('Low probability + High impact → Medium', () => {
    expect(deriveRiskLevel('Low', 'High')).toBe('Medium');
  });
  it('Low probability + Medium impact → Low', () => {
    expect(deriveRiskLevel('Low', 'Medium')).toBe('Low');
  });
  it('Low probability + Low impact → Low', () => {
    expect(deriveRiskLevel('Low', 'Low')).toBe('Low');
  });
});

// ─── classificationColor ──────────────────────────────────────────────────────
describe('classificationColor', () => {
  it('returns orange for TS/SCI', () => {
    expect(classificationColor('TS/SCI')).toContain('orange');
  });
  it('returns red for TOP SECRET', () => {
    expect(classificationColor('TOP SECRET')).toContain('red');
  });
  it('returns yellow for SECRET', () => {
    expect(classificationColor('SECRET')).toContain('yellow');
  });
  it('returns blue for CONFIDENTIAL', () => {
    expect(classificationColor('CONFIDENTIAL')).toContain('blue');
  });
  it('returns a fallback for unknown classifications', () => {
    expect(classificationColor('UNCLASSIFIED')).toContain('slate');
  });
});

// ─── riskColor ────────────────────────────────────────────────────────────────
describe('riskColor', () => {
  it('returns red for Critical', () => expect(riskColor('Critical')).toContain('red'));
  it('returns orange for High', () => expect(riskColor('High')).toContain('orange'));
  it('returns yellow for Medium', () => expect(riskColor('Medium')).toContain('yellow'));
  it('returns green for Low', () => expect(riskColor('Low')).toContain('green'));
  it('returns a fallback for unknown values', () => expect(riskColor('Unknown')).toContain('slate'));
});

// ─── statusColor ──────────────────────────────────────────────────────────────
describe('statusColor', () => {
  it('Protected → green', () => expect(statusColor('Protected')).toContain('green'));
  it('Active → green', () => expect(statusColor('Active')).toContain('green'));
  it('Mitigated → green', () => expect(statusColor('Mitigated')).toContain('green'));
  it('At-Risk → yellow', () => expect(statusColor('At-Risk')).toContain('yellow'));
  it('Open → yellow', () => expect(statusColor('Open')).toContain('yellow'));
  it('Compromised → red', () => expect(statusColor('Compromised')).toContain('red'));
  it('Under Review → blue', () => expect(statusColor('Under Review')).toContain('blue'));
  it('Monitoring → blue', () => expect(statusColor('Monitoring')).toContain('blue'));
});

// ─── exposureColor ────────────────────────────────────────────────────────────
describe('exposureColor', () => {
  it('High exposure → red', () => expect(exposureColor('High')).toContain('red'));
  it('Medium exposure → yellow', () => expect(exposureColor('Medium')).toContain('yellow'));
  it('Low exposure → green', () => expect(exposureColor('Low')).toContain('green'));
  it('Mitigated → blue', () => expect(exposureColor('Mitigated')).toContain('blue'));
});

// ─── formatDate ───────────────────────────────────────────────────────────────
describe('formatDate', () => {
  it('converts ISO date to MM/DD/YYYY', () => {
    expect(formatDate('2026-06-04')).toBe('06/04/2026');
  });
  it('returns an em-dash for empty string', () => {
    expect(formatDate('')).toBe('—');
  });
  it('pads single-digit months and days', () => {
    expect(formatDate('2026-01-05')).toBe('01/05/2026');
  });
});

// ─── generateId ───────────────────────────────────────────────────────────────
describe('generateId', () => {
  it('starts with the given prefix', () => {
    expect(generateId('cpi')).toMatch(/^cpi-/);
    expect(generateId('threat')).toMatch(/^threat-/);
  });
  it('generates unique IDs on repeated calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId('test')));
    expect(ids.size).toBe(100);
  });
});
