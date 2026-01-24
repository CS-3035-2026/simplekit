# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.1.0] - 2026-01-23

### Breaking changes
- Renamed `SKTextfield` event from `changed` to `change`
- Corrected `change` event timing so it is emitted after text editing completes (on focus loss), aligning with HTML DOM semantics
- Added `input` semantic event for `SKTextfield`

### Fixed
- Fixed a bug in wrap row layout (#4)

### Changed
- Added parent references to `SKElement` and `SKContainer`
- Rewrote event dispatch internals to build target routes using parent references
- Added semantic event dispatch
- Rewrote positional target identification
- Cleaned up property access in widgets
- In imperative-mode `runLoop`, enforce root element layout invariants: zero margin, canvas-sized width and height, and `(0, 0)` position; emit a warning when user-specified values are overridden

## [1.0.5] - 2025-09-29

### Fixed
- Reset content sizes to `0` when a container becomes empty (#3)
- `SKButton` no longer defaults to width `80`