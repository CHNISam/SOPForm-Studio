# SOPForm Studio v0.1

A lightweight, local-only decision standardization tool for SDLC, capturing human decisions as structured forms for AI consumption.

## Usage

### Prerequisites

- Node.js installed

### Setup & Run

```bash
cd sopform-studio
npm install
npm run dev
# Open http://localhost:5173
```

### Commands

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run typecheck`: Run TypeScript validation

## Data Model

- **Storage**: Default is `localStorage` ("sopform_studio_v1"). Optional File System Access API support.
- **Project Structure**:
  - `projects`: List of projects.
  - `stages`: Key-value pairs of field IDs to content.
  - `history`: Snapshots of the project state.
- **Export Format**: Strict markdown-like format optimized for AI parsing.

## Acceptance Checklist

- [ ] Create a new project
- [ ] Fill out "Requirements" stage (Goal, Scope)
- [ ] Verify "Goal" and "Scope" are required (Try copying stage, should fail if empty)
- [ ] Save a snapshot
- [ ] Modify some fields
- [ ] Restore snapshot from History
- [ ] Export Project (Copy to clipboard)
- [ ] Verify export format matches strict rules (Missing fields explicitly asked)
- [ ] (Optional) Save to local file using "Files" button

## Manual Test Steps

1. Open app. Click "+ New". Name it "TestProj".
2. In "Requirements", type "Test Goal" in Goal. Leave Scope empty.
3. Click "Copy Stage". Expect error toast/modal: "Missing: Scope".
4. Fill Scope with "Test Scope". Click "Copy Stage". Expect success.
5. Click "Save Snapshot". Add note "Initial".
6. Change Goal to "Changed Goal".
7. Click "History". Click "Restore" on the snapshot.
8. Verify Goal reverts to "Test Goal".
9. Click "Copy Project". Paste into a text editor. Check format.
