import { h } from 'preact';
import type { Snapshot } from '../types';

interface HistoryModalProps {
  snapshots: Snapshot[];
  onClose: () => void;
  onRestore: (s: Snapshot) => void;
}

export function HistoryModal({ snapshots, onClose, onRestore }: HistoryModalProps) {
  return (
    <div class="modal-overlay" onClick={onClose}>
      <div class="modal" onClick={e => e.stopPropagation()}>
        <div class="modal-header">
          <h3 class="modal-title">Project History</h3>
          <button class="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div class="modal-content">
          {snapshots.length === 0 ? (
            <p style={{color:'#666', textAlign:'center'}}>No snapshots yet.</p>
          ) : (
            <ul class="history-list">
              {[...snapshots].reverse().map(s => (
                <li class="snapshot-item" key={s.ts}>
                  <div>
                    <div class="snapshot-meta">{new Date(s.ts).toLocaleString()}</div>
                    {s.note && <div class="snapshot-note">{s.note}</div>}
                  </div>
                  <button class="btn btn-sm" onClick={() => {
                    if(confirm('Restoring will overwrite current state. Continue?')) onRestore(s);
                  }}>Restore</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
