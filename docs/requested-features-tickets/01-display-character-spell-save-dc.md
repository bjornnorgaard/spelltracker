# Ticket: Display Character Spell Save DC

## Status

Done.

## Feature Goal

Display each character's spell save DC in the UI and use it where save-based spells are shown. Include an informational message that explains how spell save DC is calculated.

## User Value

- Players can quickly confirm save DC without manual math.
- Save-based spell resolution becomes faster and less error-prone.
- The formula explanation improves trust in the displayed value.

## Scope

- Show spell save DC in character-facing spell UI.
- Surface the value when viewing spells that require a saving throw.
- Add an info/help message describing the formula.

## Dependency Analysis

### Data Dependencies

- Character must expose:
  - spellcasting ability (or equivalent source stat)
  - proficiency bonus
  - any modifiers that alter spell save DC (if supported)
- Spell data must identify whether a spell requires a saving throw.

### Logic Dependencies

- A shared utility may be needed to calculate spell save DC consistently across UI surfaces.
- Formula handling should support future class/rule exceptions.

### UI Dependencies

- Character details and/or spell list cards need a stable location for showing DC.
- Save-based spell rows/cards need an area to display computed DC and formula info trigger.

### Copy/UX Dependencies

- Informational message content must be agreed (for example: `8 + proficiency bonus + spellcasting ability modifier`).
- Tooltip vs inline helper decision may affect design consistency.

## Areas Likely Affected

- Character data models/types
- Spell rendering components
- Shared calculation utilities
- Possibly stores/selectors that provide derived character stats

## Expected App Change Size

**Estimated impact: Medium**

- Mostly additive UI + derived-data logic.
- Could become larger if current data model does not expose required spellcasting fields cleanly.

## Risks

- Incorrect calculation if class-specific exceptions are not modeled.
- Inconsistent values if multiple components compute DC independently.

## Suggested Implementation Order

1. Confirm required character fields exist in model/store.
2. Add/centralize spell save DC calculation utility.
3. Render DC in relevant character/spell UI surfaces.
4. Add info message with agreed formula text.
5. Validate against sample characters/classes.

## Open Questions

- Do we need to support class-specific overrides now, or later?
- Should the formula info be always visible or shown on demand?
- Should temporary bonuses (items/buffs) be included in v1?
