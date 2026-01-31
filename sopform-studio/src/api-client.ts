import type { ChangeStatus, GateReportEntry, DecisionFormData, AppConfig } from './types-companion';

const API_BASE = '/api';

export async function fetchChanges(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/changes`);
  const data = await res.json();
  return data.changes || [];
}

export async function fetchChangeStatus(id: string): Promise<ChangeStatus> {
  const res = await fetch(`${API_BASE}/change/${id}/status`);
  return await res.json();
}

export async function writeArtifacts(id: string, formData: DecisionFormData): Promise<void> {
  const res = await fetch(`${API_BASE}/change/${id}/write`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to write artifacts');
  }
}

export async function runGate(id: string, gate: 'validate' | 'verify' | 'archive'): Promise<{ success: boolean; output: string }> {
  const res = await fetch(`${API_BASE}/change/${id}/gate/${gate}`, {
    method: 'POST'
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || `Failed to run ${gate} gate`);
  }
  
  return await res.json();
}

export async function fetchGateReport(id: string): Promise<GateReportEntry[]> {
  const res = await fetch(`${API_BASE}/change/${id}/gate-report`);
  const data = await res.json();
  return data.entries || [];
}

export async function fetchConfig(): Promise<AppConfig> {
  const res = await fetch(`${API_BASE}/config`);
  return await res.json();
}
