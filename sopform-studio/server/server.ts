import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getChanges, getChangeStatus, runValidate, runArchive, getGateReport, appendGateReport, writeArtifactBounded } from './openspec.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Environment config - prioritize env, fallback to relative from project root
const OPENSPEC_ROOT = process.env.OPENSPEC_ROOT || path.resolve(__dirname, '../../openspec');
const VERIFY_CMD = process.env.VERIFY_CMD || '';

console.log(`[Server] Final Resolved OPENSPEC_ROOT: ${OPENSPEC_ROOT}`);
console.log(`[Server] VERIFY_CMD: ${VERIFY_CMD || '(not configured)'}`);

// GET /api/changes - List all changes
app.get('/api/changes', async (req, res) => {
  try {
    const changes = await getChanges(OPENSPEC_ROOT);
    res.json({ changes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/change/:id/status - Get artifact status
app.get('/api/change/:id/status', async (req, res) => {
  try {
    const status = await getChangeStatus(OPENSPEC_ROOT, req.params.id);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/change/:id/write - Write form data to artifacts
app.post('/api/change/:id/write', async (req, res) => {
  try {
    const { goal, nonGoals, constraints, dataModel, apiBoundary, risks } = req.body;
    
    // Write to proposal.md
    const proposalContent = `## Goal\n${goal || ''}\n\n## Non-goals\n${nonGoals || ''}\n\n## Constraints\n${constraints || ''}`;
    await writeArtifactBounded(OPENSPEC_ROOT, req.params.id, 'proposal.md', proposalContent);
    
    // Write to design.md
    const designContent = `## Data Model\n${dataModel || ''}\n\n## API Boundary\n${apiBoundary || ''}\n\n## Risks\n${risks || ''}`;
    await writeArtifactBounded(OPENSPEC_ROOT, req.params.id, 'design.md', designContent);
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/change/:id/gate/validate
app.post('/api/change/:id/gate/validate', async (req, res) => {
  try {
    const result = await runValidate(OPENSPEC_ROOT, req.params.id);
    
    // Append to gate report
    await appendGateReport(OPENSPEC_ROOT, req.params.id, {
      timestamp: Date.now(),
      gate: 'validate',
      changeId: req.params.id,
      result: result.success ? 'pass' : 'fail',
      details: result.output
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/change/:id/gate/verify
app.post('/api/change/:id/gate/verify', async (req, res) => {
  try {
    if (!VERIFY_CMD) {
      return res.status(400).json({ 
        error: 'VERIFY_CMD not configured. Set environment variable to enable verify gate.' 
      });
    }
    
    // Execute custom verify command
    const { execSync } = await import('child_process');
    const output = execSync(VERIFY_CMD, { 
      cwd: OPENSPEC_ROOT,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    await appendGateReport(OPENSPEC_ROOT, req.params.id, {
      timestamp: Date.now(),
      gate: 'verify',
      changeId: req.params.id,
      result: 'pass',
      details: output
    });
    
    res.json({ success: true, output });
  } catch (error: any) {
    await appendGateReport(OPENSPEC_ROOT, req.params.id, {
      timestamp: Date.now(),
      gate: 'verify',
      changeId: req.params.id,
      result: 'fail',
      details: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// POST /api/change/:id/gate/archive
app.post('/api/change/:id/gate/archive', async (req, res) => {
  try {
    const result = await runArchive(OPENSPEC_ROOT, req.params.id);
    
    await appendGateReport(OPENSPEC_ROOT, req.params.id, {
      timestamp: Date.now(),
      gate: 'archive',
      changeId: req.params.id,
      result: result.success ? 'pass' : 'fail',
      details: result.output
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/change/:id/gate-report
app.get('/api/change/:id/gate-report', async (req, res) => {
  try {
    const report = await getGateReport(OPENSPEC_ROOT, req.params.id);
    res.json({ entries: report });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/config
app.get('/api/config', (req, res) => {
  res.json({
    openspecRoot: OPENSPEC_ROOT,
    verifyConfigured: !!VERIFY_CMD
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
