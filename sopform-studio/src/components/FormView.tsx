import { h } from 'preact';
import { STAGES } from '../forms';
import type { FormField } from '../forms';
import type { StageId } from '../types';

interface FormViewProps {
  stageId: StageId;
  fields: FormField[];
  data: Record<string, string>;
  onChange: (fieldId: string, val: string) => void;
}

export function FormView({ stageId, fields, data, onChange }: FormViewProps) {
  return (
    <div class="form-container">
      <div class="form-header">
        <h1>{STAGES[stageId]}</h1>
        <p>Fill out the details below. Required fields are marked.</p>
      </div>
      {fields.map(f => (
        <div class="field-group" key={f.id}>
          <label class="label">
            {f.label}
            {f.required && <span class="req">*</span>}
          </label>
          <textarea
            value={data[f.id] || ''}
            onInput={(e) => onChange(f.id, (e.target as HTMLTextAreaElement).value)}
            placeholder={`Enter ${f.label.toLowerCase()}...`}
          />
        </div>
      ))}
    </div>
  );
}
