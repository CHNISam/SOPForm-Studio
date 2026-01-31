# SOPForm Studio v1.2.0

A lightweight, local-only decision standardization tool for SDLC, capturing human decisions as structured forms for AI consumption. Now with **OpenSpec Companion** for managing OpenSpec workflows.

## Features

### Studio Mode (v0.1)

- Project management with stages and history
- Structured form capture for SDLC decisions
- Snapshot version history with rollback
- Export to AI-friendly format
- localStorage or File System Access API storage

### Companion Mode (v1.2.0) **NEW**

- **Change Dashboard**: View and manage multiple OpenSpec changes
- **Change Workspace**: Track artifact status and next instructions
- **Decision Form**: Write structured content to proposal.md and design.md
- **Gate Panel**: Execute Validate/Verify/Archive gates with strict prerequisites
- **Gate Report Log**: Append-only audit trail (JSONL format)
- Parallel change management

## Setup & Run

### Prerequisites

- Node.js installed
- OpenSpec CLI installed globally (`npm install -g @fission-ai/openspec`)

### Installation

```bash
cd sopform-studio
npm install
```

### Development

**Run both frontend and backend:**

```bash
npm run dev:all
```

**Or run separately:**

```bash
# Terminal 1: Frontend (port 5173)
npm run dev

# Terminal 2: Backend (port 3001)
npm run dev:backend
```

Open http://localhost:5173 and toggle between Studio and Companion modes.

### Environment Configuration

**OPENSPEC_ROOT** (optional):

- Set the path to your OpenSpec directory
- Default: `../openspec` (relative to sopform-studio directory)

**Windows (PowerShell):**

```powershell
$env:OPENSPEC_ROOT="D:\path\to\your\openspec"
npm run dev:backend
```

**Windows (CMD):**

```cmd
set OPENSPEC_ROOT=D:\path\to\your\openspec
npm run dev:backend
```

**VERIFY_CMD** (optional):

- Custom command for the Verify gate
- If not set, Verify button will be disabled

**Windows (PowerShell):**

```powershell
$env:VERIFY_CMD="npm test"
npm run dev:backend
```

### Build

```bash
npm run build
npm run typecheck
```

## Usage

### Studio Mode

1. Click "Studio" button (top right)
2. Create a new project
3. Fill out stages: Requirements, Design, Plan, Implementation, Release, Ops
4. Save snapshots for version history
5. Copy stage or entire project for AI consumption

### Companion Mode

1. Click "Companion" button (top right)
2. **Change Dashboard**: View all active changes from `openspec/changes/*`
3. Click a change to open **Change Workspace**
4. **Decision Form**: Fill out Goal, Non-goals, Constraints, Design sections
   - Writes to proposal.md and design.md using bounded markers (`<!-- SOPFORM:BEGIN/END -->`)
5. **Gates Tab**: Execute validation gates
   - **Validate**: Requires proposal.md + specs/ (runs `openspec validate`)
   - **Verify**: Requires Validate PASS + VERIFY_CMD configured
   - **Archive**: Requires Verify PASS (runs `openspec archive`)
6. **Report Log Tab**: View append-only gate execution history

### Creating New Changes

Use OpenSpec CLI to create changes:

```bash
cd ../openspec
openspec create my-new-change
```

Then refresh the Change Dashboard in Companion mode.

## Data Model

### Studio Mode

- **Storage**: localStorage ("sopform_studio_v1") or File System Access API
- **Project Structure**: projects, stages, history snapshots
- **Export Format**: Strict markdown for AI parsing

### Companion Mode

- **Backend**: Express server (port 3001) with OpenSpec CLI integration
- **Gate Reports**: JSONL format (`gate-report.jsonl`) - append-only
- **Artifact Writes**: Bounded markers prevent overwriting user content

## API Endpoints

- `GET /api/changes` - List all changes
- `GET /api/change/:id/status` - Get artifact status
- `POST /api/change/:id/write` - Write form data to artifacts
- `POST /api/change/:id/gate/validate` - Run validate gate
- `POST /api/change/:id/gate/verify` - Run verify gate
- `POST /api/change/:id/gate/archive` - Run archive gate
- `GET /api/change/:id/gate-report` - Get gate report
- `GET /api/config` - Get backend configuration

## Acceptance Checklist

### Studio Mode (v0.1)

- [ ] Create a new project
- [ ] Fill out "Requirements" stage (Goal, Scope)
- [ ] Verify required fields validation
- [ ] Save a snapshot
- [ ] Modify fields and restore snapshot
- [ ] Export Project (Copy to clipboard)
- [ ] Verify export format

### Companion Mode (v1.2.0)

- [ ] Switch to Companion mode
- [ ] View changes in Dashboard
- [ ] Open Change Workspace
- [ ] View artifact status grid
- [ ] Fill Decision Form and submit
- [ ] Verify bounded markers in proposal.md/design.md
- [ ] Run Validate gate (when prerequisites met)
- [ ] View gate result in Report Log
- [ ] Verify gate-report.jsonl created
- [ ] Verify gate prerequisites enforced

## Troubleshooting

**Backend not starting:**

- Ensure port 3001 is not in use
- Check OPENSPEC_ROOT path is correct

**Changes not appearing:**

- Verify OpenSpec directory structure: `openspec/changes/`
- Click Refresh button in Dashboard

**Verify gate disabled:**

- Set VERIFY_CMD environment variable
- Restart backend server

**Module not found errors:**

- Run `npm install` to install dependencies
