import type { StageId } from './types';

export const STAGES: Record<StageId, string> = {
  req: 'Requirements',
  design: 'Design / Architecture',
  plan: 'Planning',
  impl: 'Implementation',
  release: 'Verification / Release',
  ops: 'Operations / Feedback',
};

export const STAGE_ORDER: StageId[] = ['req', 'design', 'plan', 'impl', 'release', 'ops'];

export interface FormField {
  id: string;
  label: string;
  required?: boolean;
  type: 'textarea' | 'text';
}

export const FORM_REGISTRY: Record<StageId, FormField[]> = {
  req: [
    { id: 'goal', label: 'Goal', required: true, type: 'textarea' },
    { id: 'scope', label: 'Scope', required: true, type: 'textarea' },
    { id: 'non_goals', label: 'Non-goals', type: 'textarea' },
    { id: 'target_users', label: 'Target Users', type: 'textarea' },
    { id: 'constraints', label: 'Constraints', type: 'textarea' },
    { id: 'acceptance_criteria', label: 'Acceptance Criteria', required: true, type: 'textarea' },
  ],
  design: [
    { id: 'module_boundaries', label: 'Module Boundaries', required: true, type: 'textarea' },
    { id: 'data_model', label: 'Data Model', required: true, type: 'textarea' },
    { id: 'state_machine', label: 'State Machine', type: 'textarea' },
    { id: 'idempotency_concurrency', label: 'Idempotency & Concurrency', type: 'textarea' },
    { id: 'observability', label: 'Observability', type: 'textarea' },
    { id: 'security_privacy', label: 'Security & Privacy', type: 'textarea' },
  ],
  plan: [
    { id: 'versions', label: 'Versions', required: true, type: 'textarea' },
    { id: 'milestones', label: 'Milestones', type: 'textarea' },
    { id: 'dependencies', label: 'Dependencies', type: 'textarea' },
    { id: 'risks', label: 'Risks', type: 'textarea' },
    { id: 'gates', label: 'Gates', type: 'textarea' },
  ],
  impl: [
    { id: 'allowed_changes', label: 'Allowed Changes', required: true, type: 'textarea' },
    { id: 'must_not_change', label: 'Must Not Change', required: true, type: 'textarea' },
    { id: 'required_evidence', label: 'Required Evidence', type: 'textarea' },
    { id: 'rollback_conditions', label: 'Rollback Conditions', type: 'textarea' },
    { id: 'test_commands', label: 'Test Commands', type: 'textarea' },
  ],
  release: [
    { id: 'critical_paths', label: 'Critical Paths', required: true, type: 'textarea' },
    { id: 'repro_steps', label: 'Repro Steps', type: 'textarea' },
    { id: 'pass_criteria', label: 'Pass Criteria', required: true, type: 'textarea' },
    { id: 'release_checklist', label: 'Release Checklist', type: 'textarea' },
    { id: 'rollback_trigger', label: 'Rollback Trigger', type: 'textarea' },
  ],
  ops: [
    { id: 'incident_summary', label: 'Incident Summary', type: 'textarea' },
    { id: 'root_cause', label: 'Root Cause', type: 'textarea' },
    { id: 'lessons_learned', label: 'Lessons Learned', type: 'textarea' },
    { id: 'new_rules_to_add', label: 'New Rules to Add', type: 'textarea' },
    { id: 'fields_to_standardize_next_time', label: 'Fields to Standardize Next Time', type: 'textarea' },
  ],
};
