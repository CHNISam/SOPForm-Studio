import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { runGate, fetchGateReport } from '../api-client';
import type { ChangeStatus, AppConfig, GateReportEntry } from '../types-companion';
import './companion.css';

interface GatePanelProps {
  changeId: string;
  status: ChangeStatus;
  config: AppConfig;
  onGateComplete: () => void;
}

export function GatePanel({ changeId, status, config, onGateComplete }: GatePanelProps) {
  const [executing, setExecuting] = useState<string | null>(null);
  const [result, setResult] = useState<{ gate: string; success: boolean; output: string } | null>(null);
  const [gateHistory, setGateHistory] = useState<GateReportEntry[]>([]);

  useEffect(() => {
    loadGateHistory();
  }, [changeId]);

  const loadGateHistory = async () => {
    try {
      const history = await fetchGateReport(changeId);
      setGateHistory(history);
    } catch (err) {
      console.error('Failed to load gate history:', err);
    }
  };

  const handleRunGate = async (gate: 'validate' | 'verify' | 'archive') => {
    setExecuting(gate);
    setResult(null);

    try {
      const res = await runGate(changeId, gate);
      setResult({ gate, success: res.success, output: res.output });
      await loadGateHistory();
      onGateComplete();
    } catch (err: any) {
      setResult({ gate, success: false, output: err.message });
    } finally {
      setExecuting(null);
    }
  };

  // Gate enable logic
  const proposalExists = status.artifacts.find(a => a.name === 'proposal')?.exists || false;
  const specsExists = status.artifacts.find(a => a.name === 'specs')?.exists || false;
  
  const lastValidate = gateHistory.filter(e => e.gate === 'validate').pop();
  const lastVerify = gateHistory.filter(e => e.gate === 'verify').pop();
  
  const canValidate = proposalExists && specsExists;
  const canVerify = config.verifyConfigured && lastValidate?.result === 'pass';
  const canArchive = lastVerify?.result === 'pass';

  return (
    <div class="gate-panel">
      <h3>Run Gates</h3>
      <p class="form-help">Execute validation, verification, and archiving gates with strict prerequisites.</p>

      <div class="gate-buttons">
        <div class="gate-button-group">
          <button
            class="btn gate-btn"
            onClick={() => handleRunGate('validate')}
            disabled={!canValidate || executing !== null}
          >
            {executing === 'validate' ? '⏳ Validating...' : '✓ Validate'}
          </button>
          <div class="gate-help">
            {canValidate ? 'Ready to validate' : 'Requires: proposal.md + specs/'}
          </div>
        </div>

        <div class="gate-button-group">
          <button
            class="btn gate-btn"
            onClick={() => handleRunGate('verify')}
            disabled={!canVerify || executing !== null}
          >
            {executing === 'verify' ? '⏳ Verifying...' : '🔍 Verify'}
          </button>
          <div class="gate-help">
            {!config.verifyConfigured 
              ? '⚠️ VERIFY_CMD not configured' 
              : canVerify 
                ? 'Ready to verify' 
                : 'Requires: Validate PASS'}
          </div>
        </div>

        <div class="gate-button-group">
          <button
            class="btn gate-btn"
            onClick={() => handleRunGate('archive')}
            disabled={!canArchive || executing !== null}
          >
            {executing === 'archive' ? '⏳ Archiving...' : '📦 Archive'}
          </button>
          <div class="gate-help">
            {canArchive ? 'Ready to archive' : 'Requires: Verify PASS'}
          </div>
        </div>
      </div>

      {result && (
        <div class={`gate-result ${result.success ? 'success' : 'error'}`}>
          <h4>{result.gate.toUpperCase()}: {result.success ? 'PASS' : 'FAIL'}</h4>
          <pre>{result.output}</pre>
        </div>
      )}

      {gateHistory.length > 0 && (
        <div class="gate-history">
          <h4>Recent Gates</h4>
          <div class="gate-history-list">
            {gateHistory.slice(-5).reverse().map((entry, i) => (
              <div key={i} class={`gate-history-item ${entry.result}`}>
                <span class="gate-name">{entry.gate.toUpperCase()}</span>
                <span class={`gate-result-badge ${entry.result}`}>{entry.result.toUpperCase()}</span>
                <span class="gate-time">{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
