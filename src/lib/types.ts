export type ClassificationLevel = 'TS/SCI' | 'TOP SECRET' | 'SECRET' | 'CONFIDENTIAL' | 'UNCLASSIFIED';
export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type Probability = 'High' | 'Medium' | 'Low';
export type Impact = 'High' | 'Medium' | 'Low';

export interface CPI {
  id: string;
  programName: string;
  cpiName: string;
  description: string;
  classificationLevel: ClassificationLevel;
  category: 'Technology' | 'Operations' | 'Personnel' | 'Infrastructure' | 'Methodology';
  protectionStatus: 'Protected' | 'At-Risk' | 'Under Review' | 'Compromised';
  owner: string;
  lastReviewDate: string;
  nextReviewDate: string;
  notes: string;
}

export interface ThreatAssessment {
  id: string;
  cpiId: string;
  threatActor: string;
  threatCategory: 'Foreign Intelligence' | 'Insider Threat' | 'Cyber' | 'Physical' | 'Open Source';
  description: string;
  probability: Probability;
  impact: Impact;
  riskLevel: RiskLevel;
  status: 'Open' | 'Mitigated' | 'Accepted' | 'Monitoring';
  dateIdentified: string;
  dateResolved?: string;
  analystNotes: string;
}

export interface OpsecIndicator {
  id: string;
  cpiId: string;
  indicatorType: 'Personnel' | 'Physical' | 'Information' | 'Cyber' | 'Activity';
  description: string;
  observable: string;
  criticality: RiskLevel;
  currentExposure: 'High' | 'Medium' | 'Low' | 'Mitigated';
  countermeasureApplied: boolean;
  reviewDate: string;
}

export interface Countermeasure {
  id: string;
  linkedIndicatorId?: string;
  linkedCpiId?: string;
  type: 'Administrative' | 'Physical' | 'Technical' | 'Personnel' | 'Information';
  title: string;
  description: string;
  owner: string;
  implementationDate: string;
  effectiveness: 'High' | 'Medium' | 'Low' | 'Unknown';
  status: 'Active' | 'Pending' | 'Expired' | 'Cancelled';
  reviewDate: string;
}
