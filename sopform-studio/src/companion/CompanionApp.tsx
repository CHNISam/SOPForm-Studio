import { h } from 'preact';
import { useState } from 'preact/hooks';
import { ChangeDashboard } from './ChangeDashboard';
import { ChangeWorkspace } from './ChangeWorkspace';

export function CompanionApp() {
  const [selectedChange, setSelectedChange] = useState<string | null>(null);

  if (selectedChange) {
    return (
      <ChangeWorkspace 
        changeId={selectedChange} 
        onBack={() => setSelectedChange(null)} 
      />
    );
  }

  return <ChangeDashboard onSelectChange={setSelectedChange} />;
}
