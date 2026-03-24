# Requested Feature Tickets

This folder contains one planning ticket per requested feature from `docs/requested-features-backlog.md`.

## Tickets

- `01-display-character-spell-save-dc.md`
- `02-show-relevant-character-stat-for-save-based-spells.md`
- `03-improve-free-cast-link-navigation.md`
- `04-support-custom-class-abilities-resources.md`
- `05-spell-component-inventory-quick-view.md`
- `06-capture-character-spellcasting-ability-input.md`

## Suggested Implementation Roadmap

This order is optimized around dependencies in application state and shared data models, so later features can reuse stable foundations.

### Phase 1: Establish spellcasting source-of-truth

1. `06-capture-character-spellcasting-ability-input.md`
   - Adds a required per-character state field that other spellcasting features depend on.
   - Creates the canonical input needed for accurate downstream calculations.

2. `01-display-character-spell-save-dc.md`
   - Uses the spellcasting ability input and proficiency data to compute/show spell save DC.
   - Introduces shared derived-stat logic and formula visibility.

3. `02-show-relevant-character-stat-for-save-based-spells.md`
   - Reuses the same casting-stat/DC data pipeline for contextual spell UI.
   - Keeps all save-related values consistent across components.

### Phase 2: Improve spell interaction workflow

4. `03-improve-free-cast-link-navigation.md`
   - Largely UI/routing behavior and can be implemented once spell rendering patterns are stable.
   - Independent from core character stat schema changes.

### Phase 3: Expand character progression/state systems

5. `04-support-custom-class-abilities-resources.md`
   - Introduces broader character resource state and persistence concerns.
   - Benefits from having foundational character stat patterns established first.

### Phase 4: Add advanced inventory/component mechanics

6. `05-spell-component-inventory-quick-view.md`
   - Highest cross-cutting complexity (spell metadata parsing, inventory schema, consumption logic, UI).
   - Best tackled after core character/spell state architecture is already solid.

## Why This Order

- Builds from core data inputs -> derived calculations -> UI enhancements.
- Reduces rework by defining character spellcasting state before dependent displays.
- Defers highest-complexity parsing/inventory work until shared patterns are proven.
