import { h } from 'preact';
import { useState } from 'preact/hooks';
import { writeArtifacts } from '../api-client';
import type { DecisionFormData } from '../types-companion';
import './companion.css';

interface DecisionFormProps {
  changeId: string;
  onSuccess: () => void;
}

export function DecisionForm({ changeId, onSuccess }: DecisionFormProps) {
  const [formData, setFormData] = useState<DecisionFormData>({
    goal: '',
    nonGoals: '',
    constraints: '',
    dataModel: '',
    apiBoundary: '',
    risks: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    if (!formData.goal.trim()) {
      setMessage({ text: 'Goal is required', type: 'error' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await writeArtifacts(changeId, formData);
      setMessage({ text: 'Successfully wrote to proposal.md and design.md', type: 'success' });
      onSuccess();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: keyof DecisionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form class="decision-form" onSubmit={handleSubmit}>
      <h3>Decision Form</h3>
      <p class="form-help">Fill out this form to write structured content to proposal.md and design.md using bounded markers.</p>

      <div class="form-section">
        <h4>Proposal Sections</h4>
        
        <div class="form-field">
          <label>Goal <span class="required">*</span></label>
          <textarea
            value={formData.goal}
            onInput={(e) => updateField('goal', (e.target as HTMLTextAreaElement).value)}
            placeholder="What are we trying to achieve?"
            rows={3}
          />
        </div>

        <div class="form-field">
          <label>Non-goals</label>
          <textarea
            value={formData.nonGoals}
            onInput={(e) => updateField('nonGoals', (e.target as HTMLTextAreaElement).value)}
            placeholder="What is explicitly out of scope?"
            rows={3}
          />
        </div>

        <div class="form-field">
          <label>Constraints</label>
          <textarea
            value={formData.constraints}
            onInput={(e) => updateField('constraints', (e.target as HTMLTextAreaElement).value)}
            placeholder="Technical, business, or regulatory limitations"
            rows={3}
          />
        </div>
      </div>

      <div class="form-section">
        <h4>Design Sections</h4>
        
        <div class="form-field">
          <label>Data Model</label>
          <textarea
            value={formData.dataModel}
            onInput={(e) => updateField('dataModel', (e.target as HTMLTextAreaElement).value)}
            placeholder="Database schema, entities, relationships"
            rows={3}
          />
        </div>

        <div class="form-field">
          <label>API Boundary</label>
          <textarea
            value={formData.apiBoundary}
            onInput={(e) => updateField('apiBoundary', (e.target as HTMLTextAreaElement).value)}
            placeholder="Endpoints, contracts, integration points"
            rows={3}
          />
        </div>

        <div class="form-field">
          <label>Risks</label>
          <textarea
            value={formData.risks}
            onInput={(e) => updateField('risks', (e.target as HTMLTextAreaElement).value)}
            placeholder="What could go wrong? Mitigation strategies?"
            rows={3}
          />
        </div>
      </div>

      {message && (
        <div class={`form-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <button type="submit" class="btn btn-primary" disabled={submitting}>
        {submitting ? 'Writing...' : 'Write to Artifacts'}
      </button>
    </form>
  );
}
