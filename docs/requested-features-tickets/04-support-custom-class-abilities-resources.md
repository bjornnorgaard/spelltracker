# Ticket: Support Custom Class Abilities/Resources

## Status

Done.

## Progress

- Done: generic custom resource data model and character edit CRUD UI.
- Done: Sorcerer preset auto-detection for `Sorcery Points`, with `max = character level`.
- Done: Sorcerer preset sync in character normalization and edit flows.
- Done: Added additional spellcaster presets:
  - Wizard: `Arcane Recovery`
  - Cleric: `Channel Divinity`
  - Druid: `Wild Shape`
  - Bard: `Bardic Inspiration` (scales with proficiency bonus)
  - Warlock: `Pact Slots` (scales by level tier)
  - Paladin: `Channel Divinity`
  - Artificer: `Flash of Genius` (available at level 7+, based on spellcasting modifier)

## Ranger Preset Decision

- Reviewed Ranger (5e 2024 SRD): Ranger has multiple limited-use features (for example free `Hunter's Mark` casts and other feature-specific uses), but no single universal class pool equivalent to `Sorcery Points`.
- Decision: no default Ranger custom-resource preset for now.
- Rationale: avoid auto-injecting a misleading single resource; users can still add Ranger-specific tracking manually as needed.

## Feature Goal

Enable tracking of class-specific or custom abilities/resources per character (for example sorcery points, channel divinity, and similar class mechanics).

## User Value

- Characters can track key class resources in one place.
- Supports broader class coverage without hardcoding only spell slots.
- Improves play-session usability and state tracking.

## Scope

- Add a character-level system for tracked resources/abilities.
- Support built-in examples and user-defined entries.
- Allow updates to current/max values (where relevant).

## Dependency Analysis

### Data Model Dependencies

- Character schema likely needs a new structured field for custom resources.
- Resource shape should support:
  - name/type
  - current value
  - max value (optional)
  - reset cadence or notes (optional)

### Logic Dependencies

- Initialization rules for known classes (optional phase).
- Validation rules for numeric ranges and safe updates.
- Potential hooks with level-up logic if values scale by level.

### UI Dependencies

- Character sheet area to view and adjust tracked resources.
- Creation/editing UX for adding custom abilities/resources.
- Optional presets for common class mechanics.

## Areas Likely Affected

- Character types/models
- Stores managing character state
- Character detail components/forms
- Import/export persistence paths for character data

## Expected App Change Size

**Estimated impact: Medium to High**

- Requires schema extension and persistence handling.
- UI and state updates are cross-cutting across character workflows.

## Risks

- Overfitting to specific classes instead of a flexible model.
- Data migration complexity for existing saved characters.
- Inconsistent reset/refresh behavior if cadence is introduced.

## Suggested Implementation Order

1. Define generic resource data model.
2. Add storage/migration support for existing characters.
3. Build basic CRUD UI for custom resources.
4. Add optional class templates/presets.
5. Test persistence and editing flows end-to-end.

## Open Questions

- Should we ship generic custom resources first, then class presets?
- Do we need reset cadence automation in v1?
- Should resource history/logging be in scope now or later?
