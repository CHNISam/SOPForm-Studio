# companion Specification

## Purpose
TBD - created by archiving change change-001. Update Purpose after archive.
## Requirements
### Requirement: COMPANION-001 - Gate report MUST be append-only

The system SHALL ensure gate execution results are written as append-only entries.

#### Scenario: Record validate failure

Given a change exists
When validate is run and fails
Then an entry is appended to gate-report with result FAIL

#### Scenario: Record validate success

Given a change exists
When validate is run and passes
Then an entry is appended to gate-report with result PASS

