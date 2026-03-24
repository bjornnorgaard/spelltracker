# Ticket: Capture Character Spellcasting Ability Input

## Feature Goal

Add a per-character input for spellcasting ability and use it as a core input to determine that character's spell save DC.

## User Value

- Ensures spell save DC is based on explicit character data.
- Reduces mistakes from assumed/default casting stats.
- Improves support for varied builds and multiclass cases.

## Scope

- Add spellcasting ability input to character creation/edit flow.
- Persist selected ability per character.
- Ensure spell save DC logic reads this stored value.

## Dependency Analysis

### Data Model Dependencies

- Character schema needs a `spellcastingAbility` field (or equivalent).
- Existing saved characters may require migration/default handling.

### Logic Dependencies

- Spell save DC calculation should depend on this field rather than implicit assumptions.
- Validation needed to ensure valid ability options only.

### UI Dependencies

- Character form(s) need a clear input control (dropdown or segmented choice).
- Read-only display may be needed in character overview/details.

### Integration Dependencies

- Must stay synchronized with ticket `01-display-character-spell-save-dc.md`.
- Potential interaction with ticket `02-show-relevant-character-stat-for-save-based-spells.md`.

## Areas Likely Affected

- Character types and storage
- Character create/edit UI
- Derived stat or calculation utilities
- Spell save DC display surfaces

## Expected App Change Size

**Estimated impact: Medium**

- Requires data model changes + UI input + calculation integration.

## Risks

- Invalid defaults can produce incorrect DC values.
- Migration gaps for existing characters could leave unset values.

## Suggested Implementation Order

1. Add/validate `spellcastingAbility` in character model.
2. Add character input UI and persistence.
3. Update spell save DC calculation to consume the new field.
4. Validate with classes that use different spellcasting abilities.

## Open Questions

- Should this be manually editable for all characters, or class-driven with override?
- What should default behavior be for existing characters without this field?
