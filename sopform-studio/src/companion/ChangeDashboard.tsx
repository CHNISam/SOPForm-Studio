import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { fetchChanges } from '../api-client';
import './companion.css';

interface ChangeDashboardProps {
  onSelectChange: (id: string) => void;
}

export function ChangeDashboard({ onSelectChange }: ChangeDashboardProps) {
  const [changes, setChanges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChanges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChanges();
      setChanges(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChanges();
  }, []);

  return (
    <div class="companion-container">
      <div class="companion-header">
        <h2>Change Dashboard</h2>
        <div>
          <button class="btn btn-sm" onClick={loadChanges}>🔄 Refresh</button>
          <button class="btn btn-sm btn-primary" onClick={() => alert('Create change via OpenSpec CLI:\n\nopenspec create <change-id>\n\nThen click Refresh.')}>
            + New Change
          </button>
        </div>
      </div>

      {loading && <div class="loading">Loading changes...</div>}
      {error && <div class="error-message">Error: {error}</div>}

      {!loading && !error && changes.length === 0 && (
        <div class="empty-state">
          <p>No active changes found.</p>
          <p>Create a change using OpenSpec CLI, then click Refresh.</p>
        </div>
      )}

      {!loading && !error && changes.length > 0 && (
        <div class="change-list">
          {changes.map(changeId => (
            <div 
              key={changeId} 
              class="change-card"
              onClick={() => onSelectChange(changeId)}
            >
              <div class="change-card-header">
                <h3>{changeId}</h3>
              </div>
              <div class="change-card-footer">
                Click to open workspace →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
