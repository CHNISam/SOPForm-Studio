import type { Project, StageId } from './types';
import { FORM_REGISTRY, STAGES, STAGE_ORDER } from './forms';

export function validateStage(stageId: StageId, data: Record<string, string> | undefined): string[] {
  const fields = FORM_REGISTRY[stageId];
  const missing: string[] = [];
  const safeData = data || {};
  for (const f of fields) {
    if (f.required) {
      const val = safeData[f.id]?.trim();
      if (!val) {
        missing.push(f.label);
      }
    }
  }
  return missing;
}

const HEADER = (projName: string, stageName?: string) => `
# SOPForm Studio Export
Project: ${projName}
${stageName ? `Stage: ${stageName}\n` : ''}UpdatedAt: ${new Date().toISOString()}

## Rules
- Missing required fields must be asked.
- Do not assume anything not written.

## Fields`.trim();

export function exportStage(project: Project, stageId: StageId): string {
  const stageName = STAGES[stageId];
  const fields = FORM_REGISTRY[stageId];
  const data = project.stages[stageId] || {};

  let out = HEADER(project.name, stageName) + '\n';
  
  for (const f of fields) {
    out += `\n[${f.label}]\n${data[f.id] || ''}\n`;
  }
  return out;
}

export function exportProject(project: Project): string {
  let out = HEADER(project.name) + '\n';
  
  for (const stageId of STAGE_ORDER) {
    const stageName = STAGES[stageId];
    const fields = FORM_REGISTRY[stageId];
    const data = project.stages[stageId] || {};

    out += `\n## Stage: ${stageName}\n`;
    for (const f of fields) {
      out += `\n[${f.label}]\n${data[f.id] || ''}\n`;
    }
  }
  return out;
}
