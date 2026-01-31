import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { fetchGateReport } from '../api-client';
import type { GateReportEntry } from '../types-companion';
import './companion.css';

interface GateReportLogProps {
  changeId: string;
}

export function GateReportLog({ changeId }: GateReportLogProps) {
  const [entries, setEntries] = useState<GateReportEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [changeId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await fetchGateReport(changeId);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load gate report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div class="loading">Loading gate report...</div>;
  }

  return (
    <div class="gate-report-log">
      <h3>Gate Report Log</h3>
      <p class="form-help">Append-only audit trail of all gate executions (gate-report.jsonl)</p>

      {entries.length === 0 && (
        <div class="empty-state">No gate executions yet.</div>
      )}

      {entries.length > 0 && (
        <div class="report-entries">
          {entries.map((entry, i) => (
            <div key={i} class={`report-entry ${entry.result}`}>
              <div class="report-header">
                <span class="report-timestamp">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                <span class="report-gate">{entry.gate.toUpperCase()}</span>
                <span class={`report-result ${entry.result}`}>
                  {entry.result.toUpperCase()}
                </span>
              </div>
              <div class="report-details">
                <pre>{entry.details}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
