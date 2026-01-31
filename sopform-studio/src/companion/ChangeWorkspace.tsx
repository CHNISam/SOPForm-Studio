import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { fetchChangeStatus, fetchConfig } from '../api-client';
import type { ChangeStatus, AppConfig } from '../types-companion';
import { DecisionForm } from './DecisionForm';
import { GatePanel } from './GatePanel';
import { GateReportLog } from './GateReportLog';
import './companion.css';

interface ChangeWorkspaceProps {
  changeId: string;
  onBack: () => void;
}

export function ChangeWorkspace({ changeId, onBack }: ChangeWorkspaceProps) {
  const [status, setStatus] = useState<ChangeStatus | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'gates' | 'report'>('form');
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const [statusData, configData] = await Promise.all([
        fetchChangeStatus(changeId),
        fetchConfig()
      ]);
      setStatus(statusData);
      setConfig(configData);
    } catch (err) {
      console.error('Failed to load status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [changeId]);

  if (loading) {
    return <div class="loading">Loading workspace...</div>;
  }

  if (!status || !config) {
    return <div class="error-message">Failed to load change status</div>;
  }

  return (
    <div class="companion-container">
      <div class="companion-header">
        <button class="btn btn-sm" onClick={onBack}>← Back</button>
        <h2>Change: {changeId}</h2>
        <button class="btn btn-sm" onClick={loadStatus}>🔄 Refresh</button>
      </div>

      <div class="artifact-status-grid">
        <h3>Artifact Status</h3>
        <div class="status-grid">
          {status.artifacts.map(artifact => (
            <div key={artifact.name} class={`status-item ${artifact.exists ? 'exists' : 'missing'}`}>
              <span class="status-icon">{artifact.exists ? '✓' : '✗'}</span>
              <span class="status-name">{artifact.name}</span>
            </div>
          ))}
        </div>
        <div class={`status-badge status-${status.status.toLowerCase()}`}>
          {status.status}
        </div>
      </div>

      <div class="workspace-tabs">
        <button 
          class={`tab ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          Decision Form
        </button>
        <button 
          class={`tab ${activeTab === 'gates' ? 'active' : ''}`}
          onClick={() => setActiveTab('gates')}
        >
          Gates
        </button>
        <button 
          class={`tab ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          Report Log
        </button>
      </div>

      <div class="workspace-content">
        {activeTab === 'form' && (
          <DecisionForm changeId={changeId} onSuccess={loadStatus} />
        )}
        {activeTab === 'gates' && (
          <GatePanel 
            changeId={changeId} 
            status={status} 
            config={config}
            onGateComplete={loadStatus}
          />
        )}
        {activeTab === 'report' && (
          <GateReportLog changeId={changeId} />
        )}
      </div>
    </div>
  );
}
