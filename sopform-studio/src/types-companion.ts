export interface OpenSpecChange {
  id: string;
  status: 'READY' | 'BLOCKED' | 'NEXT';
}

export interface ArtifactStatus {
  name: string;
  exists: boolean;
  complete: boolean;
}

export interface ChangeStatus {
  id: string;
  artifacts: ArtifactStatus[];
  status: 'READY' | 'BLOCKED' | 'NEXT';
}

export interface GateReportEntry {
  timestamp: number;
  gate: 'validate' | 'verify' | 'archive';
  changeId: string;
  result: 'pass' | 'fail';
  details: string;
}

export interface DecisionFormData {
  goal: string;
  nonGoals: string;
  constraints: string;
  dataModel: string;
  apiBoundary: string;
  risks: string;
}

export interface AppConfig {
  openspecRoot: string;
  verifyConfigured: boolean;
}
