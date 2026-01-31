# Change: SOPForm Companion basic workflow

## Why

We need a minimal workflow to manage engineering changes with explicit decisions,
validation gates, and traceable logs.  
Currently changes are driven by chat and memory, which causes repeated mistakes
and unclear project state.

This change introduces a structured change folder and gate-based validation.

## What Changes

This change adds a SOPForm Companion workflow based on OpenSpec changes:

- Each change has proposal, design, tasks, and specs artifacts
- A validate and archive gate is enforced
- Gate results are recorded in gate-report.md
- Retro and rule-candidates are introduced for experience capture

## Capabilities

### New Capabilities

- `sopform-companion`: Provide a decision workspace for OpenSpec changes with gate control and audit logs

### Modified Capabilities

- (none)

## Impact

- Affects project workflow and documentation structure
- No direct runtime API changes
- Introduces new change management process


<!-- SOPFORM:BEGIN -->
## Goal
让 SOPForm Companion 能在 GUI 中显示 change 状态，并支持 Validate Gate 操作。


## Non-goals
不实现自动写代码功能；
不接入云端协作；
不实现多用户权限系统。


## Constraints
必须兼容 OpenSpec 目录结构；
只读写 markdown 文件；
不修改 OpenSpec CLI 本身。

<!-- SOPFORM:END -->