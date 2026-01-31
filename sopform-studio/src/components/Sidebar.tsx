import { h } from 'preact';
import type { Project } from '../types';

interface SidebarProps {
  projects: Project[];
  activeId?: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({ projects, activeId, onSelect, onCreate, onRename, onDelete }: SidebarProps) {
  return (
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>SOPForm Studio</h2>
      </div>
      <div class="sidebar-header">
         <span style={{fontSize: '0.85rem', color: '#666'}}>Projects ({projects.length})</span>
         <button class="btn btn-sm btn-primary" onClick={onCreate}>+ New</button>
      </div>
      <ul class="project-list">
        {projects.map(p => (
          <li key={p.id} class={`project-item ${p.id === activeId ? 'active' : ''}`} onClick={() => onSelect(p.id)}>
            <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.name}</span>
            <div class="project-actions">
              <button class="icon-btn" title="Rename" onClick={(e) => {
                e.stopPropagation();
                const name = prompt('Rename project', p.name);
                if (name && name.trim()) onRename(p.id, name.trim());
              }}>✎</button>
              <button class="icon-btn" title="Delete" onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete project "${p.name}"?`)) onDelete(p.id);
              }}>🗑</button>
            </div>
          </li>
        ))}
      </ul>
      <div style={{marginTop: 'auto', fontSize: '0.75rem', color: '#999', textAlign:'center', paddingTop: '10px', borderTop: '1px solid #eee'}}>
        v0.1
      </div>
    </div>
  );
}
