# Ticket: Show Relevant Character Stat for Save-Based Spells

## Status

Done.

## Feature Goal

When a spell requires a saving throw, display the relevant character spellcasting stat context (such as the casting ability modifier) alongside that spell information.

## User Value

- Reduces back-and-forth when resolving spell effects.
- Helps players understand why their save DC value is what it is.
- Improves clarity for multiclass or mixed-stat scenarios.

## Scope

- Detect save-based spells in the spell list/detail context.
- Show the relevant caster stat near save/DC-related info.
- Ensure wording is understandable for players.

## Dependency Analysis

### Data Dependencies

- Character model must provide:
  - spellcasting ability identifier
  - derived ability modifier (or enough data to compute it)
- Spell model must indicate save-based behavior and/or save type.

### Logic Dependencies

- Mapping between character spellcasting ability and display label/value.
- Potential helper for formatting stat display consistently.

### UI Dependencies

- Save-based spell rows/cards need additional display space.
- Layout should remain readable on small screens.

## Areas Likely Affected

- Spell list/detail components
- Character-derived stat helpers/selectors
- Types describing spell metadata and character casting data

## Expected App Change Size

**Estimated impact: Small to Medium**

- Primarily presentation work if required fields are already present.
- Increases to medium if stat derivation logic needs refactor.

## Risks

- Ambiguity for multiclass builds if only one casting stat is currently supported.
- UI clutter if too many stat details are shown at once.

## Suggested Implementation Order

1. Confirm canonical source of character casting stat/modifier.
2. Add normalized display helper for stat output.
3. Add UI in save-based spell contexts.
4. Verify layout and readability across breakpoints.

## Open Questions

- Should we show only modifier, or both raw score and modifier?
- For multiclass, which casting stat should be shown for each spell source?
