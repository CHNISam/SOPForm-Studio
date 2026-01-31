import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export interface GateReportEntry {
  timestamp: number;
  gate: 'validate' | 'verify' | 'archive';
  changeId: string;
  result: 'pass' | 'fail';
  details: string;
}

export interface ArtifactStatus {
  name: string;
  exists: boolean;
  complete: boolean;
}

export interface ChangeStatus {
  id: string;
  artifacts: ArtifactStatus[];
  status: 'READY' | 'BLOCKED' | 'NEXT';
}

// List all changes from openspec/changes/*
export async function getChanges(openspecRoot: string): Promise<string[]> {
  const changesDir = path.resolve(openspecRoot, 'changes');
  
  console.log(`[getChanges] Resolved OPENSPEC_ROOT: ${openspecRoot}`);
  console.log(`[getChanges] Scanning directory: ${changesDir}`);
  
  try {
    const entries = await fs.readdir(changesDir, { withFileTypes: true });
    const changes = entries
      .filter(e => e.isDirectory() && e.name !== 'archive')
      .map(e => e.name);
    
    console.log(`[getChanges] Directory listing result:`, changes);
    return changes;
  } catch (error: any) {
    console.error(`[getChanges] Error reading ${changesDir}:`, error.message);
    return [];
  }
}

// Get artifact status for a change
export async function getChangeStatus(openspecRoot: string, changeId: string): Promise<ChangeStatus> {
  const changeDir = path.join(openspecRoot, 'changes', changeId);
  
  const artifacts: ArtifactStatus[] = [];
  
  // Check proposal.md
  const proposalPath = path.join(changeDir, 'proposal.md');
  const proposalExists = await fileExists(proposalPath);
  artifacts.push({
    name: 'proposal',
    exists: proposalExists,
    complete: proposalExists
  });
  
  // Check specs/
  const specsDir = path.join(changeDir, 'specs');
  const specsExists = await dirExists(specsDir);
  artifacts.push({
    name: 'specs',
    exists: specsExists,
    complete: specsExists
  });
  
  // Check design.md
  const designPath = path.join(changeDir, 'design.md');
  const designExists = await fileExists(designPath);
  artifacts.push({
    name: 'design',
    exists: designExists,
    complete: designExists
  });
  
  // Check tasks.md
  const tasksPath = path.join(changeDir, 'tasks.md');
  const tasksExists = await fileExists(tasksPath);
  artifacts.push({
    name: 'tasks',
    exists: tasksExists,
    complete: tasksExists
  });
  
  // Determine status
  const allComplete = artifacts.every(a => a.complete);
  const anyExists = artifacts.some(a => a.exists);
  const status = allComplete ? 'READY' : anyExists ? 'NEXT' : 'BLOCKED';
  
  return { id: changeId, artifacts, status };
}

// Run openspec validate
export async function runValidate(openspecRoot: string, changeId: string): Promise<{ success: boolean; output: string }> {
  try {
    const output = execSync(`openspec validate ${changeId} --strict --no-interactive`, {
      cwd: openspecRoot,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: error.message };
  }
}

// Run openspec archive
export async function runArchive(openspecRoot: string, changeId: string): Promise<{ success: boolean; output: string }> {
  try {
    const output = execSync(`openspec archive ${changeId} --yes`, {
      cwd: openspecRoot,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: error.message };
  }
}

// Get gate report entries
export async function getGateReport(openspecRoot: string, changeId: string): Promise<GateReportEntry[]> {
  const reportPath = path.join(openspecRoot, 'changes', changeId, 'gate-report.jsonl');
  
  try {
    const content = await fs.readFile(reportPath, 'utf-8');
    const lines = content.trim().split('\n').filter(l => l.trim());
    return lines.map(line => JSON.parse(line));
  } catch (error) {
    return [];
  }
}

// Append to gate report (JSONL format)
export async function appendGateReport(openspecRoot: string, changeId: string, entry: GateReportEntry): Promise<void> {
  const reportPath = path.join(openspecRoot, 'changes', changeId, 'gate-report.jsonl');
  const line = JSON.stringify(entry) + '\n';
  
  await fs.appendFile(reportPath, line, 'utf-8');
}

// Write to artifact with bounded markers
export async function writeArtifactBounded(
  openspecRoot: string, 
  changeId: string, 
  filename: string, 
  content: string
): Promise<void> {
  const filePath = path.join(openspecRoot, 'changes', changeId, filename);
  
  const beginMarker = '<!-- SOPFORM:BEGIN -->';
  const endMarker = '<!-- SOPFORM:END -->';
  
  let existingContent = '';
  try {
    existingContent = await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    // File doesn't exist, create new
  }
  
  const boundedContent = `${beginMarker}\n${content}\n${endMarker}`;
  
  if (existingContent.includes(beginMarker) && existingContent.includes(endMarker)) {
    // Replace bounded section
    const regex = new RegExp(`${beginMarker}[\\s\\S]*?${endMarker}`, 'g');
    const newContent = existingContent.replace(regex, boundedContent);
    await fs.writeFile(filePath, newContent, 'utf-8');
  } else {
    // Append bounded section
    const newContent = existingContent ? `${existingContent}\n\n${boundedContent}` : boundedContent;
    await fs.writeFile(filePath, newContent, 'utf-8');
  }
}

// Helper functions
async function fileExists(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function dirExists(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}
