# sopform-companion Specification

## Purpose
TBD - created by archiving change change-002. Update Purpose after archive.
## Requirements
### Requirement: Mandatory Artifact Set

The system SHALL ensure that every active change folder includes `proposal.md`, `design.md`, `tasks.md`, and a `specs/` directory.

#### Scenario: Change folder validation

- **WHEN** `openspec validate` is run on a change
- **THEN** it MUST check for the presence of all four mandatory artifacts
- **AND** report an error if any are missing

### Requirement: Gate-Based Audit Logging

The workflow SHALL record validation results into a `gate-report.md` file within the change directory.

#### Scenario: Validation success logging

- **WHEN** a change passes all validation checks
- **THEN** a `gate-report.md` MUST be updated with the "PASS" status and a timestamp

### Requirement: Experience Capture (Retro)

Users SHALL create a `retro.md` file after a change is archived to document lessons learned.

#### Scenario: Post-archive feedback

- **WHEN** `openspec archive` finishes successfully
- **THEN** the system SHOULD prompt or remind the user to create `retro.md`

### Requirement: Rule Evolution

Potential improvements to project conventions SHALL be tracked in a `rule-candidates.md` file during the development of a change.

#### Scenario: Suggesting a new rule

- **WHEN** a developer identifies a recurring pattern or mistake
- **THEN** they SHALL record the candidate rule in `rule-candidates.md` for later review

