# Design: SOPForm Companion Workflow

## Decisions

### 1. Mandatory Artifact Set

Every change folder under `openspec/changes/` SHALL contain:

- `proposal.md`: Business justification and scope.
- `tasks.md`: Implementation checklist.
- `specs/`: Capability deltas.
- `design.md`: Technical decisions (required if ≥1 NEW capability or BREAKING change).

### 2. Gate-Based Validation Audit

To ensure traceable quality gates:

- A `gate-report.md` SHALL be generated/updated when running `openspec validate`.
- It MUST record: Timestamp, Validation Status (Pass/Fail), and high-level issue counts.

### 3. Experience Loop (Post-Archive)

To capture continuous improvement:

- **Retro**: a `retro.md` MUST be created post-archive to document "What went well" and "What to improve".
- **Rule Candidates**: A `rule-candidates.md` SHALL be used during development to track potential additions to `openspec/project.md`.

### 4. Folder Structure for Audit

The `gate-report.md`, `retro.md`, and `rule-candidates.md` will reside in the active change folder:

```
openspec/changes/[id]/
├── gate-report.md
├── retro.md
└── rule-candidates.md
```

## Risks / Trade-offs

- **Overhead**: Increased number of files per change. _Mitigation_: Use automation/templates to seed these files.
- **Maintenance**: Audit logs might grow stale. _Mitigation_: Enforce gate checks via CI/CD (future goal).


<!-- SOPFORM:BEGIN -->
## Data Model


## API Boundary


## Risks

<!-- SOPFORM:END -->