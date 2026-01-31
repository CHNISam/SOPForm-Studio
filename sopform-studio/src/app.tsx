import { h } from 'preact';
import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { Sidebar } from './components/Sidebar';
import { FormView } from './components/FormView';
import { HistoryModal } from './components/HistoryModal';
import { CompanionApp } from './companion/CompanionApp';
import type { AppData, Project, StageId, Snapshot } from './types';
import { FORM_REGISTRY, STAGES, STAGE_ORDER } from './forms';
import { loadLocal, saveLocal, loadFromFile, saveToFile, getEmptyData } from './storage';
import type { FileSystemFileHandle } from './storage';
import { validateStage, exportStage, exportProject } from './export';

export function App() {
  const [mode, setMode] = useState<'studio' | 'companion'>('studio');
  const [data, setData] = useState<AppData>(getEmptyData());
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>();
  const [activeStage, setActiveStage] = useState<StageId>('req');
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [missingFields, setMissingFields] = useState<string[] | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'error' } | null>(null);
  
  // Load initial data
  useEffect(() => {
    const loaded = loadLocal();
    setData(loaded);
    if (loaded.activeProjectId) setActiveProjectId(loaded.activeProjectId);
  }, []);

  // Save Effect (Debounced)
  const saveTimeout = useRef<number>();
  const saveData = useCallback((newData: AppData) => {
    // Optimistic update
    setData(newData);
    
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(async () => {
       if (fileHandle) {
         try {
           await saveToFile(fileHandle, newData);
           console.log('Saved to file');
         } catch(e) {
           console.error(e);
           setToast({ msg: 'Failed to save to file', type: 'error' });
         }
       } else {
         saveLocal(newData);
         console.log('Saved to local');
       }
    }, 500);
  }, [fileHandle]);

  // Project Helpers
  const activeProject = data.projects.find(p => p.id === activeProjectId);

  const createProject = () => {
    const name = prompt('Project Name:');
    if (!name) return;
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      updatedAt: Date.now(),
      stages: { ...Object.fromEntries(STAGE_ORDER.map(s => [s, {}])) } as any,
      history: []
    };
    const newData = { ...data, projects: [...data.projects, newProject], activeProjectId: newProject.id };
    setActiveProjectId(newProject.id);
    saveData(newData);
  };

  const deleteProject = (id: string) => {
    const newData = { ...data, projects: data.projects.filter(p => p.id !== id) };
    if (activeProjectId === id) setActiveProjectId(undefined);
    saveData(newData);
  };

  const renameProject = (id: string, name: string) => {
    const newData = {
      ...data,
      projects: data.projects.map(p => p.id === id ? { ...p, name, updatedAt: Date.now() } : p)
    };
    saveData(newData);
  };

  const updateField = (fieldId: string, val: string) => {
    if (!activeProject) return;
    const newStages = { ...activeProject.stages };
    if (!newStages[activeStage]) newStages[activeStage] = {};
    newStages[activeStage] = { ...newStages[activeStage], [fieldId]: val };
    
    const updatedProject = { ...activeProject, stages: newStages, updatedAt: Date.now() };
    const newData = {
      ...data,
      projects: data.projects.map(p => p.id === activeProject.id ? updatedProject : p)
    };
    saveData(newData);
  };

  const takeSnapshot = () => {
    if (!activeProject) return;
    const note = prompt('Snapshot Note (optional):');
    const snapshot: Snapshot = {
      ts: Date.now(),
      note: note || undefined,
      stages: JSON.parse(JSON.stringify(activeProject.stages))
    };
    const updatedProject = { 
      ...activeProject, 
      history: [...activeProject.history, snapshot] 
    };
    const newData = {
      ...data,
      projects: data.projects.map(p => p.id === activeProject.id ? updatedProject : p)
    };
    saveData(newData);
    showToast('Snapshot saved');
  };

  const restoreSnapshot = (s: Snapshot) => {
    if (!activeProject) return;
    const updatedProject = {
      ...activeProject,
      stages: JSON.parse(JSON.stringify(s.stages)),
      updatedAt: Date.now()
    };
    const newData = {
      ...data,
      projects: data.projects.map(p => p.id === activeProject.id ? updatedProject : p)
    };
    saveData(newData);
    setShowHistory(false);
    showToast('Restored from snapshot');
  };

  // Copy/Export
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const handleCopyStage = () => {
    if (!activeProject) return;
    const missing = validateStage(activeStage, activeProject.stages[activeStage]);
    if (missing.length > 0) {
      setMissingFields(missing);
      return;
    }
    const text = exportStage(activeProject, activeStage);
    copyToClipboard(text);
  };

  const handleCopyProject = () => {
    if (!activeProject) return;
    // Validate ALL stages
    const allMissing: string[] = [];
    STAGE_ORDER.forEach(sid => {
      const missing = validateStage(sid, activeProject.stages[sid]);
      if (missing.length > 0) {
        allMissing.push(`${STAGES[sid]}: ${missing.join(', ')}`);
      }
    });

    if (allMissing.length > 0) {
      setMissingFields(allMissing);
      return;
    }
    const text = exportProject(activeProject);
    copyToClipboard(text);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sopform_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.projects && Array.isArray(json.projects)) {
          saveData(json);
          showToast('Import successful');
        } else {
          showToast('Invalid JSON format', 'error');
        }
      } catch {
        showToast('Failed to parse JSON', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleFileSelect = async () => {
    try {
      if (window.showOpenFilePicker) {
        const [handle] = await window.showOpenFilePicker({
          types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }]
        });
        const fileData = await loadFromFile(handle);
        setFileHandle(handle);
        setData(fileData);
        if (fileData.activeProjectId) setActiveProjectId(fileData.activeProjectId);
        showToast(`Using file: ${handle.name}`);
      } else {
        showToast('File System API not supported', 'error');
      }
    } catch (e) {
      console.error(e); // Cancelled or error
    }
  };

  const showToast = (msg: string, type: 'info'|'error' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div id="app">
      {/* Mode Toggle */}
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        zIndex: 1000,
        background: 'white',
        padding: '4px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        display: 'flex',
        gap: '4px'
      }}>
        <button 
          class={`btn btn-sm ${mode === 'studio' ? 'btn-primary' : ''}`}
          onClick={() => setMode('studio')}
        >
          Studio
        </button>
        <button 
          class={`btn btn-sm ${mode === 'companion' ? 'btn-primary' : ''}`}
          onClick={() => setMode('companion')}
        >
          Companion
        </button>
      </div>

      {mode === 'companion' ? (
        <CompanionApp />
      ) : (
        <>
          <Sidebar 
            projects={data.projects} 
            activeId={activeProjectId} 
            onSelect={(id) => { setActiveProjectId(id); saveData({...data, activeProjectId: id}); }}
            onCreate={createProject}
            onRename={renameProject}
            onDelete={deleteProject}
          />
          <div class="main">
            <div class="top-bar">
              {STAGE_ORDER.map(s => (
                <div 
                  key={s} 
                  class={`tab ${activeStage === s ? 'active' : ''}`}
                  onClick={() => setActiveStage(s)}
                >
                  {STAGES[s]}
                </div>
              ))}
            </div>
            
            <div class="editor-area">
              {activeProject ? (
                <FormView 
                  stageId={activeStage}
                  fields={FORM_REGISTRY[activeStage]}
                  data={activeProject.stages[activeStage] || {}}
                  onChange={updateField}
                />
              ) : (
                 <div style={{marginTop: 50, color: '#999'}}>Select or create a project to start.</div>
              )}
            </div>

            <div class="actions-bar">
                {fileHandle && <div class="status-indicator">📄 {fileHandle.name}</div>}
                 {!fileHandle && <div class="status-indicator">💾 Local Storage</div>}
                
                <button class="btn btn-sm" onClick={handleFileSelect} title="Use File System">📂 Data File</button>
                <button class="btn btn-sm" onClick={exportJSON}>Export JSON</button>
                <label class="btn btn-sm" style={{display:'inline-block', marginBottom:0}}>
                  Import JSON
                  <input type="file" accept=".json" onChange={importJSON} style={{display:'none'}} />
                </label>
                <div style={{width: 1, background:'#ddd', height: 20, margin:'0 4px'}}></div>
                {activeProject && (
                  <>
                    <button class="btn" onClick={takeSnapshot}>Save Snapshot</button>
                    <button class="btn" onClick={() => setShowHistory(true)}>History</button>
                    <button class="btn" onClick={handleCopyStage}>Copy Stage</button>
                    <button class="btn btn-primary" onClick={handleCopyProject}>Copy Project</button>
                  </>
                )}
            </div>
          </div>

          {showHistory && activeProject && (
            <HistoryModal 
              snapshots={activeProject.history} 
              onClose={() => setShowHistory(false)}
              onRestore={restoreSnapshot}
            />
          )}

          {missingFields && (
            <div class="modal-overlay" onClick={() => setMissingFields(null)}>
              <div class="modal" onClick={e => e.stopPropagation()}>
                 <h3 class="modal-title" style={{color: 'var(--danger)'}}>Missing Required Fields</h3>
                 <div class="modal-content">
                   <p>The following fields are required before copying:</p>
                   <ul class="missing-list">
                     {missingFields.map((f, i) => <li key={i}>{f}</li>)}
                   </ul>
                 </div>
                 <div class="modal-footer">
                   <button class="btn btn-primary" onClick={() => setMissingFields(null)}>OK</button>
                 </div>
              </div>
            </div>
          )}

          {toast && <div class={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.msg}</div>}
        </>
      )}
    </div>
  );
}
